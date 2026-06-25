from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.models.user import User
from app.models.review import Review
from app.models.review_like import ReviewLike

from app.services.notification_service import send_notification

router = APIRouter(
    prefix="/review-likes",
    tags=["Review Likes"]
)


@router.post("/{review_id}")
def like_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    existing = (
        db.query(ReviewLike)
        .filter(
            ReviewLike.review_id == review_id,
            ReviewLike.user_id == current_user.id
        )
        .first()
    )

    if existing:
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
    db.refresh(like)

    # Notify the review owner (but not yourself)
    if review.user_id != current_user.id:
        send_notification(
            db=db,
            user_id=review.user_id,
            message=f"{current_user.username} liked your review.",
            notification_type="review_like",
        )
        

    return {
        "success": True,
        "message": "Review liked successfully"
    }