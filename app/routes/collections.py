from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.database import SessionLocal, get_db
from datetime import datetime
from app import base1_schemas
from app.auth import get_current_user
from app.models.collection import Collection, CollectionMovie

router = APIRouter(
    prefix="/collections",
    tags=["Collections"]
)




@router.post("/", response_model=base1_schemas.CollectionResponse)
def create_collection(
    collection: base1_schemas.CollectionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    new_collection = Collection(
        name=collection.name,
        description=collection.description,
        user_id=current_user.id,
        visibility=collection.visibility,
        cover_image_url=collection.cover_image_url,
        created_at=datetime.utcnow()
    )

    # Prevent duplicate collection names per user
    existing = db.query(Collection).filter(Collection.user_id == current_user.id, Collection.name == collection.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Collection with this name already exists")

    db.add(new_collection)
    db.commit()
    db.refresh(new_collection)

    return new_collection


@router.get("/", response_model=list[base1_schemas.CollectionResponse])
def get_collections(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Collection)
        .options(joinedload(Collection.user))
        .filter(Collection.user_id == current_user.id)
        .order_by(Collection.created_at.desc())
        .all()
    )


@router.get("/public", response_model=list[base1_schemas.CollectionResponse])
def get_public_collections(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Collection)
        .options(joinedload(Collection.user))
        .filter(Collection.visibility == "public")
        .order_by(Collection.created_at.desc())
        .all()
    )


@router.get("/search", response_model=list[base1_schemas.CollectionResponse])
def search_collections(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q_pattern = f"%{q}%"
    from app.models.user import User

    # Build a scalar SELECT for user IDs whose username matches
    from sqlalchemy import select
    matching_user_ids = (
        select(User.id)
        .where(User.username.ilike(q_pattern))
        .scalar_subquery()
    )

    collections = (
        db.query(Collection)
        .options(joinedload(Collection.user), joinedload(Collection.movies))
        .filter(
            Collection.visibility == "public",
            or_(
                Collection.name.ilike(q_pattern),
                Collection.user_id.in_(matching_user_ids),
            ),
        )
        .order_by(Collection.created_at.desc())
        .all()
    )
    return collections


@router.get("/{collection_id}", response_model=base1_schemas.CollectionResponse)
def get_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    collection = (
        db.query(Collection)
        .options(joinedload(Collection.user))
        .filter(Collection.id == collection_id)
        .first()
    )

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    if collection.user_id != current_user.id and collection.visibility != "public":
        raise HTTPException(status_code=403, detail="Not authorized to view this collection")

    # Load movies relationship eagerly
    collection.movies  # access to ensure loading

    return collection


@router.put("/{collection_id}", response_model=base1_schemas.CollectionResponse)
def update_collection(
    collection_id: int,
    updated: base1_schemas.CollectionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.user_id == current_user.id,
        )
        .first()
    )

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.user_id == current_user.id,
        )
        .first()
    )

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Update fields, keep visibility if not provided
    collection.name = updated.name
    collection.description = updated.description
    if hasattr(updated, 'visibility'):
        collection.visibility = updated.visibility
    if hasattr(updated, 'cover_image_url'):
        collection.cover_image_url = updated.cover_image_url

    db.commit()
    db.refresh(collection)

    return collection


@router.delete("/{collection_id}")
def delete_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    collection = (
        db.query(Collection)
        .filter(
            Collection.id == collection_id,
            Collection.user_id == current_user.id,
        )
        .first()
    )

    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    db.delete(collection)
    db.commit()

    return {"message": "Collection deleted successfully"}


@router.post("/{collection_id}/movies")
def add_movie(
    collection_id: int,
    movie: base1_schemas.MovieCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Ensure collection belongs to user
    collection = (
        db.query(Collection)
        .filter(Collection.id == collection_id, Collection.user_id == current_user.id)
        .first()
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Check for duplicate movie in collection
    existing = (
        db.query(CollectionMovie)
        .filter(CollectionMovie.collection_id == collection_id, CollectionMovie.movie_id == movie.movie_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Movie already in collection")

    new_movie = CollectionMovie(
        collection_id=collection.id,
        movie_id=movie.movie_id,
        movie_title=movie.movie_title,
        poster_path=movie.poster_path,
    )

    db.add(new_movie)
    db.commit()

    return {"message": "Movie added successfully"}


@router.delete("/{collection_id}/movies/{movie_id}")
def remove_movie(
    collection_id: int,
    movie_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Ensure collection belongs to user
    collection = (
        db.query(Collection)
        .filter(Collection.id == collection_id, Collection.user_id == current_user.id)
        .first()
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    movie = (
        db.query(CollectionMovie)
        .filter(
            CollectionMovie.collection_id == collection_id,
            CollectionMovie.movie_id == movie_id,
        )
        .first()
    )

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    db.delete(movie)
    db.commit()

    return {"message": "Movie removed successfully"}