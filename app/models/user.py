from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime
)
from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):

    __tablename__ = "users"

    # =========================
    # COLUMNS
    # =========================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    # NEW COLUMN
    is_admin = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=True
    )

    # =========================
    # RELATIONSHIPS
    # =========================

    favorites = relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete"
    )

    search_history = relationship(
        "SearchHistory",
        back_populates="user",
        cascade="all, delete"
    )

    viewed_movies = relationship(
        "ViewedMovie",
        back_populates="user",
        cascade="all, delete"
    )

    preferences = relationship(
        "UserPreference",
        back_populates="user",
        cascade="all, delete"
    )

    watchlist = relationship(
        "Watchlist",
        back_populates="user"
    )

    reviews = relationship(
        "Review",
        back_populates="user"
    )
    collections = relationship(
    "Collection",
    back_populates="user",
    cascade="all, delete"
)
    notifications = relationship(
    "Notification",
    back_populates="user",
    cascade="all, delete-orphan"
)