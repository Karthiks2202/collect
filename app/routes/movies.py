import os
import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.auth import get_current_user
from app.models.review import Review
from app.models.search_history import SearchHistory

router = APIRouter(
    prefix="/movies",
    tags=["Movies"]
)

OMDB_API_KEY = os.getenv("OMDB_API_KEY", "8b2506ba")


@router.get("/search")
def search_movies(
    query: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not query.strip():
        raise HTTPException(
            status_code=400,
            detail={"success": False, "message": "Invalid request"}
        )

    history = SearchHistory(
        user_id=current_user.id,
        keyword=query
    )
    db.add(history)
    db.commit()

    from app.services.notification_service import send_notification
    send_notification(
        db=db,
        user_id=current_user.id,
        message=f'You searched for "{query}".',
        notification_type="search"
    )

    return {
        "success": True,
        "message": "Search saved",
        "keyword": query
    }


def _fetch_omdb_movie(movie_id: str) -> dict:
    """Fetch movie details from OMDB API by IMDb ID or title."""
    # Try by IMDb ID first (starts with 'tt')
    if movie_id.startswith("tt"):
        url = f"https://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={movie_id}&plot=full"
    else:
        url = f"https://www.omdbapi.com/?apikey={OMDB_API_KEY}&t={movie_id}&plot=full"

    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if data.get("Response") == "True":
            return data
    except Exception:
        pass
    return None


def _get_user_stats(db: Session, movie_id: str) -> dict:
    """Get average rating and total reviews for a movie from our database."""
    reviews = db.query(Review).filter(Review.movie_id == movie_id).all()
    total = len(reviews)
    if total == 0:
        return {"avg_rating": None, "total_reviews": 0}
    avg = round(sum(r.rating for r in reviews if r.rating) / total, 1)
    return {"avg_rating": avg, "total_reviews": total}


def _build_movie_data(movie_id: str, db: Session) -> dict:
    """Combine OMDB data + user stats for a movie."""
    omdb = _fetch_omdb_movie(movie_id)
    stats = _get_user_stats(db, movie_id)

    if not omdb:
        return {
            "movie_id": movie_id,
            "found": False,
            "title": "Unknown Movie",
            "poster": None,
            "year": "N/A",
            "genre": "N/A",
            "runtime": "N/A",
            "director": "N/A",
            "actors": "N/A",
            "imdb_rating": None,
            "plot": "No data available.",
            **stats,
        }

    # Parse IMDb rating safely
    try:
        imdb_rating = float(omdb.get("imdbRating", "N/A"))
    except (ValueError, TypeError):
        imdb_rating = None

    return {
        "movie_id": movie_id,
        "found": True,
        "title": omdb.get("Title", "N/A"),
        "poster": omdb.get("Poster", None),
        "year": omdb.get("Year", "N/A"),
        "genre": omdb.get("Genre", "N/A"),
        "runtime": omdb.get("Runtime", "N/A"),
        "director": omdb.get("Director", "N/A"),
        "actors": omdb.get("Actors", "N/A"),
        "imdb_rating": imdb_rating,
        "plot": omdb.get("Plot", "N/A"),
        **stats,
    }


@router.get("/compare")
def compare_movies(
    movie1: str,
    movie2: str,
    movie3: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Compare two or three movies side by side.
    Fetches OMDB details + user review stats for each.
    """
    if not movie1 or not movie2:
        raise HTTPException(
            status_code=400,
            detail="At least movie1 and movie2 query params are required"
        )

    movie_ids = [movie1, movie2]
    if movie3:
        movie_ids.append(movie3)

    # Check for duplicates
    if len(movie_ids) != len(set(movie_ids)):
        raise HTTPException(
            status_code=400,
            detail="Please select unique movies to compare"
        )

    movies_data = [_build_movie_data(m_id, db) for m_id in movie_ids]

    # Build comparison summary dynamically
    summary = _build_summary_multi(movies_data)

    res = {
        "movie1": movies_data[0],
        "movie2": movies_data[1],
        "summary": summary
    }
    if len(movies_data) > 2:
        res["movie3"] = movies_data[2]

    return res


def _build_summary_multi(movies_list: list) -> list:
    """Generate human-readable comparison messages for 2 or 3 movies."""
    messages = []
    valid_movies = [m for m in movies_list if m.get("found", True)]
    if len(valid_movies) < 2:
        return messages

    # IMDb rating comparison
    ratings = []
    for m in valid_movies:
        r = m.get("imdb_rating")
        if r is not None:
            ratings.append((m, r))
    if ratings:
        max_rating = max(r for m, r in ratings)
        winners = [m for m, r in ratings if r == max_rating]
        if len(winners) == len(valid_movies):
            messages.append({
                "type": "imdb",
                "text": f"🤝 All compared movies have the same IMDb rating of {max_rating}."
            })
        elif len(winners) == 1:
            winner = winners[0]
            others = [m for m in valid_movies if m["movie_id"] != winner["movie_id"]]
            others_str = ", ".join(f"{o['title']} ({o.get('imdb_rating', 'N/A')})" for o in others)
            messages.append({
                "type": "imdb",
                "text": f"🏆 {winner['title']} has a higher IMDb rating ({winner['imdb_rating']}) than {others_str}."
            })
        else:
            winners_str = " and ".join(w['title'] for w in winners)
            others = [m for m in valid_movies if m not in winners]
            others_str = " and ".join(o['title'] for o in others)
            suffix = f" compared to {others_str}" if others_str else ""
            messages.append({
                "type": "imdb",
                "text": f"🏆 {winners_str} tie for the highest IMDb rating ({max_rating}){suffix}."
            })

    # User rating comparison
    user_ratings = []
    for m in valid_movies:
        u = m.get("avg_rating")
        if u is not None:
            user_ratings.append((m, u))
    if user_ratings:
        max_user = max(u for m, u in user_ratings)
        winners = [m for m, u in user_ratings if u == max_user]
        if len(winners) == len(valid_movies):
            messages.append({
                "type": "user_rating",
                "text": f"🤝 All compared movies have the same user average rating of {max_user}/10."
            })
        elif len(winners) == 1:
            winner = winners[0]
            others = [m for m in valid_movies if m["movie_id"] != winner["movie_id"]]
            others_str = ", ".join(f"{o['title']} ({o.get('avg_rating', 'N/A')}/10)" for o in others)
            messages.append({
                "type": "user_rating",
                "text": f"⭐ {winner['title']} has a higher user rating ({winner['avg_rating']}/10) than {others_str}."
            })
        else:
            winners_str = " and ".join(w['title'] for w in winners)
            messages.append({
                "type": "user_rating",
                "text": f"⭐ {winners_str} tie for the highest user rating ({max_user}/10)."
            })
    else:
        messages.append({
            "type": "user_rating",
            "text": "📝 None of the compared movies have user reviews yet."
        })

    # Total reviews comparison
    reviews_counts = [(m, m.get("total_reviews", 0)) for m in valid_movies]
    max_reviews = max(cnt for m, cnt in reviews_counts)
    winners = [m for m, cnt in reviews_counts if cnt == max_reviews]
    if max_reviews > 0:
        if len(winners) == len(valid_movies):
            messages.append({
                "type": "reviews",
                "text": f"💬 All compared movies have the same number of user reviews ({max_reviews})."
            })
        elif len(winners) == 1:
            winner = winners[0]
            others = [m for m in valid_movies if m["movie_id"] != winner["movie_id"]]
            others_str = ", ".join(f"{o['title']} ({o.get('total_reviews', 0)})" for o in others)
            messages.append({
                "type": "reviews",
                "text": f"💬 {winner['title']} has more user reviews ({winner['total_reviews']}) than {others_str}."
            })
        else:
            winners_str = " and ".join(w['title'] for w in winners)
            messages.append({
                "type": "reviews",
                "text": f"💬 {winners_str} tie for the most user reviews ({max_reviews})."
            })
    else:
        messages.append({
            "type": "reviews",
            "text": "💬 No reviews exist for any of these movies."
        })

    return messages