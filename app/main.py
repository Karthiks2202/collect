from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import false

from app.database import Base, engine
from app import models

# Import models so SQLAlchemy creates the tables
from app.models.collection import Collection, CollectionMovie
from app.models.notification import Notification
from app.models.review_like import ReviewLike

# =========================
# IMPORT ROUTES
# =========================
from app.routes import (
    auth,
    favorites,
    history,
    dashboard,
    recommendations,
    movies,
    watchlist,
    reviews,
    profile,
    collections,
    notification,
    watched,
)

# =========================
# IMPORT ADMIN ROUTER
# =========================
from app.routes.admin import router as admin_router

# =========================
# CREATE DATABASE TABLES
# =========================
Base.metadata.create_all(bind=engine)

# =========================
# FASTAPI APP
# =========================
app = FastAPI(title="Movie Backend API")

# =========================
# CORS CONFIG
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# APPLICATION ROUTES
# =========================
app.include_router(auth.router)
app.include_router(favorites.router)
app.include_router(history.router)
app.include_router(dashboard.router)
app.include_router(recommendations.router)
app.include_router(movies.router)
app.include_router(watchlist.router)
app.include_router(reviews.router)
app.include_router(profile.router)
app.include_router(collections.router)
app.include_router(notification.router)
app.include_router(watched.router)

# =========================
# ADMIN ROUTES
# =========================
app.include_router(admin_router)