from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.favorite import Favorite
from app.models.user import User
from app.auth import get_current_user
from app.schemas.favorite import FavoriteCreate

# Notification service
from app.services.notification_service import send_notification

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)


# =========================
# ADD FAVORITE
# =========================

@router.post("/")
def add_favorite(
    favorite: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.movie_id == favorite.movie_id
        )
        .first()
    )

    if existing:
        return {
            "success": False,
            "message": "Movie already in favorites"
        }

    new_favorite = Favorite(
        user_id=current_user.id,
        movie_id=favorite.movie_id,
        movie_title=favorite.movie_title,
        poster=favorite.poster
    )

    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)

    # =========================
    # CREATE NOTIFICATION
    # =========================
    send_notification(
        db=db,
        user_id=current_user.id,
        message=f'"{favorite.movie_title}" was added to your favorites.',
        notification_type="favorite"
    )

    return {
        "success": True,
        "message": "Movie added to favorites",
        "favorite": new_favorite
    }


# =========================
# GET FAVORITES
# =========================

@router.get("/")
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    favorites = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id
        )
        .all()
    )

    return {
        "success": True,
        "favorites": favorites
    }


# =========================
# DELETE FAVORITE
# =========================

@router.delete("/{favorite_id}")
def delete_favorite(
    favorite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.id == favorite_id,
            Favorite.user_id == current_user.id
        )
        .first()
    )

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Favorite not found"
        )

    movie_title = favorite.movie_title

    db.delete(favorite)
    db.commit()

    # =========================
    # CREATE NOTIFICATION
    # =========================
    send_notification(
        db=db,
        user_id=current_user.id,
        message=f'"{movie_title}" was removed from your favorites.',
        notification_type="favorite"
    )

    return {
        "success": True,
        "message": "Favorite deleted"
    }