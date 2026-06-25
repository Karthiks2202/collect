from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user

from app.models.search_history import SearchHistory

# Notification Service
from app.services.notification_service import send_notification

router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)


@router.get("/search")
def search_movies(
    query: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if not query.strip():
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "message": "Invalid request"
            }
        )

    history = SearchHistory(
        user_id=current_user.id,
        keyword=query
    )

    db.add(history)
    db.commit()

    # =========================
    # CREATE NOTIFICATION
    # =========================
    send_notification(
        db=db,
        user_id=current_user.id,
        message=f'You searched for "{query}".',
        notification_type="search"
    )

    return {
        "success": True,
        "message": "Search saved",
        "keyword": query
    }