from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.models.user import User
from app.models.review import Review
from app.models.review_like import ReviewLike

from app.schemas.review import ReviewCreate
from app.services.notification_service import send_notification


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


@router.post("/")
def add_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing = (
        db.query(Review)
        .filter(
            Review.user_id == current_user.id,
            Review.movie_id == review.movie_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already reviewed this movie"
        )

    new_review = Review(
        user_id=current_user.id,
        movie_id=review.movie_id,
        movie_title=review.movie_title,
        rating=review.rating,
        review=review.review
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "success": True,
        "message": "Review added successfully"
    }


@router.get("/{movie_id}")
def get_reviews(
    movie_id: str,
    db: Session = Depends(get_db)
):

    reviews = (
        db.query(Review)
        .filter(
            Review.movie_id == movie_id
        )
        .all()
    )

    return {
        "success": True,
        "reviews": reviews
    }


@router.put("/{review_id}")
def update_review(
    review_id: int,
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.user_id == current_user.id
        )
        .first()
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    existing.rating = review.rating
    existing.review = review.review

    db.commit()

    return {
        "success": True,
        "message": "Review updated"
    }


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.user_id == current_user.id
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    db.delete(review)
    db.commit()

    return {
        "success": True,
        "message": "Review deleted"
    }


@router.get("/average/{movie_id}")
def average_rating(
    movie_id: str,
    db: Session = Depends(get_db)
):

    reviews = (
        db.query(Review)
        .filter(
            Review.movie_id == movie_id
        )
        .all()
    )

    if len(reviews) == 0:
        return {
            "average_rating": 0
        }

    avg = (
        sum(
            review.rating
            for review in reviews
        )
        / len(reviews)
    )

    return {
        "movie_id": movie_id,
        "average_rating": round(avg, 1)
    }


@router.post("/{review_id}/like")
def like_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    review = (
        db.query(Review)
        .filter(Review.id == review_id)
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    existing_like = (
        db.query(ReviewLike)
        .filter(
            ReviewLike.review_id == review_id,
            ReviewLike.user_id == current_user.id
        )
        .first()
    )

    if existing_like:
        raise HTTPException(
            status_code=400,
            detail="You already liked this review"
        )

    like = ReviewLike(
        review_id=review_id,
        user_id=current_user.id
    )

    db.add(like)
    db.commit()

    # Debug prints
    print("Review owner:", review.user_id)
    print("Current user:", current_user.id)

    if review.user_id != current_user.id:
        print("Creating notification...")

        notification = send_notification(
            db=db,
            user_id=review.user_id,
            message=f"{current_user.username} liked your review.",
            notification_type="review_like",
        )

        print("Notification created:", notification.id)

    return {
        "success": True,
        "message": "Review liked successfully"
    }