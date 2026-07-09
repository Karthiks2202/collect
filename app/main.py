import os
import re
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

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
# Static allowed origins from env var (comma-separated)
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174")
_static_origins = {o.strip() for o in _raw_origins.split(",") if o.strip()}

# Regex patterns for dynamic origins (e.g. every Vercel preview URL)
_ORIGIN_PATTERNS = [
    re.compile(r"^https://[\w.-]+-karthiks2202s-projects\.vercel\.app$"),  # preview deploys
    re.compile(r"^https://[\w-]+\.vercel\.app$"),                           # all *.vercel.app
]

def _is_allowed_origin(origin: str) -> bool:
    if origin in _static_origins:
        return True
    return any(p.match(origin) for p in _ORIGIN_PATTERNS)


class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        allowed = _is_allowed_origin(origin)

        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            response = Response(status_code=204)
            if allowed:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
                response.headers["Access-Control-Allow-Headers"] = "*"
                response.headers["Access-Control-Max-Age"] = "600"
            return response

        response = await call_next(request)
        if allowed and origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
        return response


app.add_middleware(DynamicCORSMiddleware)


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