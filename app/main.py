import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    preferences,
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
# Set ALLOWED_ORIGINS on Render as a comma-separated list, e.g.:
#   https://your-app.vercel.app,http://localhost:5173
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
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
app.include_router(preferences.router)

# =========================
# ADMIN ROUTES
# =========================
app.include_router(admin_router)