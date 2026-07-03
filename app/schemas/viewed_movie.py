from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ViewedMovieCreate(BaseModel):
    movie_id: str
    movie_title: str
    genre: Optional[str] = None
    poster: Optional[str] = None
    imdb_rating: Optional[str] = None


class ViewedMovieResponse(BaseModel):
    id: int
    movie_id: str
    movie_title: str
    genre: Optional[str] = None
    poster: Optional[str] = None
    imdb_rating: Optional[str] = None
    viewed_at: datetime
    user_id: int

    class Config:
        from_attributes = True
