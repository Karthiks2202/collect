from app.models.favorite import Favorite
from app.models.search_history import SearchHistory
from app.models.viewed_movie import ViewedMovie

# ==================================================
# MOVIE CATALOG PER GENRE
# ==================================================

GENRE_MOVIES = {
    "superhero": {
        "label": "Superhero / DC & Marvel",
        "keywords": ["batman", "superman", "justice", "marvel", "dc", "spider", "avenger", "thor", "hulk", "iron man"],
        "movies": [
            {"title": "The Dark Knight", "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"},
            {"title": "The Batman", "poster": "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg"},
            {"title": "Man of Steel", "poster": "https://image.tmdb.org/t/p/w500/7rIPjn5TUK04O25ZkMyHrGNPgLx.jpg"},
            {"title": "Justice League", "poster": "https://image.tmdb.org/t/p/w500/eifGNCSDuxJeS1loAXil5bIGgvC.jpg"},
            {"title": "Wonder Woman", "poster": "https://image.tmdb.org/t/p/w500/v4ncgZjG2Zu8ZW5al1vIZTsSjqX.jpg"},
            {"title": "Avengers: Endgame", "poster": "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"},
            {"title": "Spider-Man: No Way Home", "poster": "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"},
        ]
    },
    "scifi": {
        "label": "Sci-Fi",
        "keywords": ["interstellar", "space", "sci-fi", "science", "alien", "robot", "future", "galaxy", "planet", "nasa", "matrix"],
        "movies": [
            {"title": "Interstellar", "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"},
            {"title": "Inception", "poster": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"},
            {"title": "Arrival", "poster": "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg"},
            {"title": "Blade Runner 2049", "poster": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"},
            {"title": "The Martian", "poster": "https://image.tmdb.org/t/p/w500/5aGhaIHYuQbqlHWvWYqMCnj40y2.jpg"},
            {"title": "Dune", "poster": "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"},
            {"title": "The Matrix", "poster": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"},
        ]
    },
    "action": {
        "label": "Action / Thriller",
        "keywords": ["action", "fight", "war", "mission", "gun", "shoot", "spy", "explosive", "chase", "combat"],
        "movies": [
            {"title": "John Wick", "poster": "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg"},
            {"title": "Mad Max: Fury Road", "poster": "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg"},
            {"title": "Mission: Impossible", "poster": "https://image.tmdb.org/t/p/w500/l5uxY5m5OInWpcExIpKG6AR3rgL.jpg"},
            {"title": "Top Gun: Maverick", "poster": "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg"},
            {"title": "The Bourne Identity", "poster": "https://image.tmdb.org/t/p/w500/a6ItlMBpb1gBJMIbBxMUb6GBKXF.jpg"},
            {"title": "Gladiator", "poster": "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAZ1UoD9xKZmpMp.jpg"},
        ]
    },
    "horror": {
        "label": "Horror",
        "keywords": ["horror", "scary", "ghost", "haunted", "demon", "evil", "fear", "terror", "nightmare", "monster"],
        "movies": [
            {"title": "The Conjuring", "poster": "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg"},
            {"title": "Get Out", "poster": "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg"},
            {"title": "Hereditary", "poster": "https://image.tmdb.org/t/p/w500/p8jSEbFrqLAiCT2F1ZPkRkHxJsE.jpg"},
            {"title": "A Quiet Place", "poster": "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg"},
            {"title": "It (2017)", "poster": "https://image.tmdb.org/t/p/w500/9E2y5Q7WlCVHWL4XFPFexkBIBpL.jpg"},
        ]
    },
    "romance": {
        "label": "Romance / Drama",
        "keywords": ["love", "romance", "relationship", "wedding", "couple", "heart", "drama", "feel", "emotion"],
        "movies": [
            {"title": "The Notebook", "poster": "https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg"},
            {"title": "La La Land", "poster": "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg"},
            {"title": "Titanic", "poster": "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg"},
            {"title": "500 Days of Summer", "poster": "https://image.tmdb.org/t/p/w500/6mBcAFmDzBxjmEScUFxbFijVbzV.jpg"},
            {"title": "Before Sunrise", "poster": "https://image.tmdb.org/t/p/w500/6rMSwSvqnCB6zYiOyWE2MWBZ9pK.jpg"},
        ]
    },
    "comedy": {
        "label": "Comedy",
        "keywords": ["comedy", "funny", "laugh", "humor", "comic", "fun", "silly", "joke"],
        "movies": [
            {"title": "The Grand Budapest Hotel", "poster": "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg"},
            {"title": "Superbad", "poster": "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lJ7eFTuOK.jpg"},
            {"title": "The Hangover", "poster": "https://image.tmdb.org/t/p/w500/uluhlXubGu1VxV6texYObIfnE0R.jpg"},
            {"title": "Knives Out", "poster": "https://image.tmdb.org/t/p/w500/pThyQovXQrqVeTh41GnSSHWhPVL.jpg"},
        ]
    },
    "crime": {
        "label": "Crime / Thriller",
        "keywords": ["crime", "murder", "detective", "police", "heist", "mafia", "gang", "mystery", "killer", "prison"],
        "movies": [
            {"title": "The Godfather", "poster": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLLeHjdIVqkP.jpg"},
            {"title": "Pulp Fiction", "poster": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg"},
            {"title": "Se7en", "poster": "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg"},
            {"title": "Parasite", "poster": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"},
            {"title": "Prisoners", "poster": "https://image.tmdb.org/t/p/w500/jsBNHNEqkNLsJvbE9NdHjCSmHPR.jpg"},
        ]
    },
    "animation": {
        "label": "Animation / Family",
        "keywords": ["anime", "animation", "cartoon", "pixar", "disney", "kids", "family", "studio ghibli"],
        "movies": [
            {"title": "Spirited Away", "poster": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg"},
            {"title": "Your Name", "poster": "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg"},
            {"title": "Spider-Man: Into the Spider-Verse", "poster": "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg"},
            {"title": "Coco", "poster": "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg"},
            {"title": "Up", "poster": "https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBBS0lywnj.jpg"},
        ]
    },
}

# Shown when user has no history at all
POPULAR_FALLBACK = [
    {"title": "The Dark Knight", "genre": "Action", "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", "reason": "All-time popular"},
    {"title": "Inception", "genre": "Sci-Fi", "poster": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", "reason": "All-time popular"},
    {"title": "Parasite", "genre": "Crime", "poster": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", "reason": "Award-winning film"},
    {"title": "Spirited Away", "genre": "Animation", "poster": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", "reason": "All-time popular"},
    {"title": "The Godfather", "genre": "Crime", "poster": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLLeHjdIVqkP.jpg", "reason": "Classic masterpiece"},
    {"title": "Interstellar", "genre": "Sci-Fi", "poster": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", "reason": "All-time popular"},
]


def get_recommendations(db, user_id):
    """
    Build recommendations based on the user's search history,
    favorites, and viewed movies. Uses frequency scoring per genre
    to surface the most relevant category first.
    """

    # Gather all user signals
    searches = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == user_id)
        .order_by(SearchHistory.searched_at.desc())
        .limit(30)
        .all()
    )

    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id)
        .all()
    )

    viewed_movies = (
        db.query(ViewedMovie)
        .filter(ViewedMovie.user_id == user_id)
        .all()
    )

    # If user has no data at all, return popular fallback
    if not searches and not favorites and not viewed_movies:
        return POPULAR_FALLBACK

    # Build keyword corpus from all signals
    keywords = []
    for s in searches:
        keywords.extend(s.keyword.lower().split())
    for fav in favorites:
        keywords.extend(fav.movie_title.lower().split())
    for mv in viewed_movies:
        keywords.extend(mv.movie_title.lower().split())

    keyword_text = " ".join(keywords)

    # Frequency scoring per genre
    genre_scores = {}
    for genre_key, genre_data in GENRE_MOVIES.items():
        score = sum(
            keyword_text.count(kw)
            for kw in genre_data["keywords"]
        )
        if score > 0:
            genre_scores[genre_key] = score

    # No matches at all → return popular fallback
    if not genre_scores:
        return POPULAR_FALLBACK

    # Sort genres by score (highest first)
    sorted_genres = sorted(
        genre_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    recommendations = []
    seen_titles = set()

    for genre_key, score in sorted_genres:
        genre_data = GENRE_MOVIES[genre_key]
        genre_label = genre_data["label"]

        # Score determines reason message
        if score >= 5:
            reason = f"Highly matches your taste in {genre_label}"
        elif score >= 2:
            reason = f"Based on your interest in {genre_label}"
        else:
            reason = f"You might enjoy {genre_label}"

        for movie in genre_data["movies"]:
            if movie["title"] not in seen_titles:
                seen_titles.add(movie["title"])
                recommendations.append({
                    "title": movie["title"],
                    "genre": genre_label,
                    "reason": reason,
                    "poster": movie["poster"],
                })

    return recommendations