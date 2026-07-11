from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import List, Optional


# -------------------------
# Movie Schemas
# -------------------------

class MovieCreate(BaseModel):
    movie_id: str
    movie_title: str
    poster_path: Optional[str] = None

    @field_validator('movie_id', mode='before')
    @classmethod
    def coerce_movie_id(cls, v):
        if v is not None:
            return str(v)
        return v


class MovieResponse(MovieCreate):
    id: int

    class Config:
        from_attributes = True


# -------------------------
# Collection Schemas
# -------------------------

class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None
    visibility: str = "private"
    cover_image_url: Optional[str] = None


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(CollectionBase):
    pass


class UserMinResponse(BaseModel):
    username: str

    class Config:
        from_attributes = True


class CollectionResponse(CollectionBase):
    id: int
    user_id: int
    visibility: str
    cover_image_url: Optional[str] = None
    created_at: datetime
    movies: List[MovieResponse] = []
    user: Optional[UserMinResponse] = None

    class Config:
        from_attributes = True