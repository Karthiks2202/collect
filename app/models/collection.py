from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    visibility = Column(Enum('public', 'private', name='visibility'), nullable=False, default='private')
    cover_image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="collections")

    movies = relationship(
        "CollectionMovie",
        back_populates="collection",
        cascade="all, delete"
    )


class CollectionMovie(Base):
    __tablename__ = "collection_movies"
    __table_args__ = (UniqueConstraint('collection_id', 'movie_id', name='uq_collection_movie'),)


    id = Column(Integer, primary_key=True, index=True)

    collection_id = Column(
        Integer,
        ForeignKey("collections.id")
    )

    movie_id = Column(String)

    movie_title = Column(String(255))

    poster_path = Column(String(255))

    collection = relationship(
        "Collection",
        back_populates="movies"
    )