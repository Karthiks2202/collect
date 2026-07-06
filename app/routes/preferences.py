from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.models.user_preference import UserPreference
from app.base_schemas import PreferenceCreate
from app.auth import get_current_user

router = APIRouter(
    prefix="/preferences",
    tags=["Preferences"]
)


# =========================
# GET ALL PREFERENCES
# =========================
@router.get("/")
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prefs = (
        db.query(UserPreference)
        .filter(UserPreference.user_id == current_user.id)
        .order_by(UserPreference.id.asc())
        .all()
    )

    return {
        "success": True,
        "data": [
            {"id": p.id, "genre": p.genre, "score": p.score}
            for p in prefs
        ]
    }


# =========================
# ADD A PREFERENCE
# =========================
@router.post("/")
def add_preference(
    pref: PreferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    genre_normalized = pref.genre.strip()

    if not genre_normalized:
        raise HTTPException(
            status_code=400,
            detail="Genre cannot be empty"
        )

    # Prevent duplicate genre for same user (case-insensitive)
    existing = (
        db.query(UserPreference)
        .filter(
            UserPreference.user_id == current_user.id,
            UserPreference.genre.ilike(genre_normalized)
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f'Genre "{genre_normalized}" is already in your preferences'
        )

    new_pref = UserPreference(
        user_id=current_user.id,
        genre=genre_normalized,
        score=1
    )

    db.add(new_pref)
    db.commit()
    db.refresh(new_pref)

    return {
        "success": True,
        "message": f'"{genre_normalized}" added to your genre preferences',
        "data": {"id": new_pref.id, "genre": new_pref.genre, "score": new_pref.score}
    }


# =========================
# DELETE A PREFERENCE
# =========================
@router.delete("/{pref_id}")
def delete_preference(
    pref_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pref = (
        db.query(UserPreference)
        .filter(
            UserPreference.id == pref_id,
            UserPreference.user_id == current_user.id
        )
        .first()
    )

    if not pref:
        raise HTTPException(
            status_code=404,
            detail="Preference not found"
        )

    genre_name = pref.genre
    db.delete(pref)
    db.commit()

    return {
        "success": True,
        "message": f'"{genre_name}" removed from your preferences'
    }
