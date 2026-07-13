from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone, date
from calendar import month_abbr

from app.database import get_db
from app.auth import get_current_user

from app.models.favorite import Favorite
from app.models.search_history import SearchHistory
from app.models.viewed_movie import ViewedMovie
from app.models.watchlist import Watchlist
from app.models.review import Review
from app.models.collection import Collection

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def _month_bounds(now, months_ago):
    """Return (year, month) for `months_ago` months before `now`'s month."""
    year, month = now.year, now.month
    for _ in range(months_ago):
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    return year, month


def _compute_streak(viewed_dates):
    """Count consecutive days watched ending today (or yesterday if today empty)."""
    if not viewed_dates:
        return 0

    date_set = set(viewed_dates)
    today = datetime.now(timezone.utc).date()

    cursor = today
    # Allow the streak to "carry" from yesterday if nothing was watched today.
    if cursor not in date_set:
        cursor = today - timedelta(days=1)
        if cursor not in date_set:
            return 0

    streak = 0
    while cursor in date_set:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


# =========================================
# GET /dashboard/  — All stat counts
# =========================================
@router.get("/")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    uid = current_user.id

    watched_count = db.query(ViewedMovie).filter(ViewedMovie.user_id == uid).count()
    favorites_count = db.query(Favorite).filter(Favorite.user_id == uid).count()
    watchlist_count = db.query(Watchlist).filter(Watchlist.user_id == uid).count()
    reviews_count = db.query(Review).filter(Review.user_id == uid).count()
    collections_count = db.query(Collection).filter(Collection.user_id == uid).count()
    total_searches = db.query(SearchHistory).filter(SearchHistory.user_id == uid).count()

    viewed_dates = [
        row[0].date()
        for row in db.query(ViewedMovie.viewed_at)
        .filter(ViewedMovie.user_id == uid, ViewedMovie.viewed_at != None)
        .all()
    ]
    streak = _compute_streak(viewed_dates)

    return {
        "watched_count": watched_count,
        "favorites_count": favorites_count,
        "watchlist_count": watchlist_count,
        "reviews_count": reviews_count,
        "collections_count": collections_count,
        "total_searches": total_searches,
        "streak": streak,
    }


# =========================================
# GET /dashboard/genres  — Top 5 genres
# =========================================
@router.get("/genres")
def get_top_genres(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    uid = current_user.id

    # Fetch raw genre strings — these may be comma-separated (e.g. "Action, Thriller")
    rows = (
        db.query(ViewedMovie.genre)
        .filter(
            ViewedMovie.user_id == uid,
            ViewedMovie.genre != None,
            ViewedMovie.genre != ""
        )
        .all()
    )

    # Split each entry by comma and count individual genres
    genre_counts: dict[str, int] = {}
    for (genre_str,) in rows:
        for genre in genre_str.split(","):
            genre = genre.strip()
            if genre:
                genre_counts[genre] = genre_counts.get(genre, 0) + 1

    # Return top 5 by count, descending
    top_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return [{"genre": g, "count": c} for g, c in top_genres]


# =========================================
# GET /dashboard/monthly  — Last 6 months
# =========================================
@router.get("/monthly")
def get_monthly_activity(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    uid = current_user.id
    now = datetime.now(timezone.utc)
    data = []

    for i in range(5, -1, -1):
        year, month = _month_bounds(now, i)

        if month == 12:
            next_month_start = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            next_month_start = datetime(year, month + 1, 1, tzinfo=timezone.utc)
        month_start = datetime(year, month, 1, tzinfo=timezone.utc)

        count = (
            db.query(ViewedMovie)
            .filter(
                ViewedMovie.user_id == uid,
                ViewedMovie.viewed_at >= month_start,
                ViewedMovie.viewed_at < next_month_start,
            )
            .count()
        )

        data.append({
            "month": month_abbr[month],
            "count": count
        })

    return data


# =========================================
# GET /dashboard/recent  — Recent activity
# =========================================
@router.get("/recent")
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    uid = current_user.id

    recent_watched = (
        db.query(ViewedMovie)
        .filter(ViewedMovie.user_id == uid)
        .order_by(ViewedMovie.viewed_at.desc())
        .limit(5)
        .all()
    )

    recent_favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == uid)
        .order_by(Favorite.id.desc())
        .limit(5)
        .all()
    )

    recent_reviews = (
        db.query(Review)
        .filter(Review.user_id == uid)
        .order_by(Review.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "recent_watched": [
            {
                "title": item.movie_title,
                "poster": item.poster,
                "watched_date": item.viewed_at.isoformat() if item.viewed_at else None
            }
            for item in recent_watched
        ],
        "recent_favorites": [
            {
                "title": item.movie_title,
                "poster": item.poster
            }
            for item in recent_favorites
        ],
        "recent_reviews": [
            {
                "movie_title": item.movie_title,
                "rating": item.rating,
                "created_at": item.created_at.isoformat() if item.created_at else None
            }
            for item in recent_reviews
        ]
    }
