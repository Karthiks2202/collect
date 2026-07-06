from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.models.viewed_movie import ViewedMovie
from app.models.favorite import Favorite
from app.models.watchlist import Watchlist
from app.models.review import Review
from app.base_schemas import ProfileUpdate, ChangePassword
from app.auth import get_current_user, verify_password, hash_password

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# =========================
# GET PROFILE
# =========================
@router.get("/")
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


# =========================
# UPDATE PROFILE
# =========================
@router.put("/")
def update_profile(
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Check for duplicate email (other users)
    if profile.email != user.email:
        existing_email = (
            db.query(User)
            .filter(
                User.email == profile.email,
                User.id != current_user.id
            )
            .first()
        )
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already in use by another account"
            )

    # Check for duplicate username (other users)
    if profile.username != user.username:
        existing_username = (
            db.query(User)
            .filter(
                User.username == profile.username,
                User.id != current_user.id
            )
            .first()
        )
        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Username already taken"
            )

    user.email = profile.email
    user.username = profile.username

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Profile updated successfully",
        "username": user.username,
        "email": user.email,
    }


# =========================
# CHANGE PASSWORD
# =========================
@router.put("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Use verify_password to support both bcrypt and legacy plain-text passwords
    if not verify_password(data.old_password, user.password):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 6 characters"
        )

    # Hash the new password before saving
    user.password = hash_password(data.new_password)

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Password changed successfully"
    }


# =========================
# GET PROFILE STATS
# =========================
@router.get("/stats")
def get_profile_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    watched_count = (
        db.query(ViewedMovie)
        .filter(ViewedMovie.user_id == current_user.id)
        .count()
    )

    favorites_count = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .count()
    )

    watchlist_count = (
        db.query(Watchlist)
        .filter(Watchlist.user_id == current_user.id)
        .count()
    )

    reviews_count = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .count()
    )

    return {
        "watched_count": watched_count,
        "favorites_count": favorites_count,
        "watchlist_count": watchlist_count,
        "reviews_count": reviews_count,
    }