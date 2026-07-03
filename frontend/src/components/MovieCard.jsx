import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useCompare } from "../context/CompareContext";
import {
  getCollections,
  addMovieToCollection,
} from "../services/collectionService";

function MovieCard({ movie }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const { isMovieSelected, addMovieToCompare, removeMovieFromCompare } = useCompare();

  const movieId = movie.imdbID || movie.movie_id || movie.title;
  const isSelected = isMovieSelected(movieId);

  const movieTitle = movie.title || movie.movie_title || "Unknown Title";
  const moviePoster = movie.poster || movie.poster_path || "";
  const movieGenre = movie.genre || "";

  const [isWatched, setIsWatched] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadCollections();
    checkStatus();
  }, [movieId]);

  const loadCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Failed to load collections:", error);
    }
  };

  const checkStatus = async () => {
    if (!movieId) return;
    try {
      const response = await API.get(`/watched/status/${movieId}`);
      setIsWatched(response.data.watched);
      setInWatchlist(response.data.watchlist);
    } catch (error) {
      console.warn("Failed to fetch watched/watchlist status", error);
    }
  };

  // FAVORITES
  const addToFavorites = async () => {
    try {
      const favoriteData = {
        movie_id: movieId,
        movie_title: movie.title,
        genre: movie.genre,
        poster: movie.poster,
      };

      // ✅ Use shared API instance (no hardcoded URL, token auto-attached)
      const response = await API.post("/favorites/", favoriteData);
      alert(response.data.message || "Added to Favorites ❤️");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Favorite failed ❌");
    }
  };

  // WATCHLIST
  const addToWatchlist = async () => {
    try {
      const watchlistData = {
        movie_id: String(movieId),
        movie_title: movieTitle,
        genre: movieGenre,
        poster: moviePoster,
      };

      // ✅ Use shared API instance
      const response = await API.post("/watchlist/", watchlistData);
      setInWatchlist(true);
      alert(response.data.message || "Added to Watchlist 📺");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Watchlist failed ❌");
    }
  };

  // WATCHED HISTORY
  const toggleWatched = async () => {
    try {
      if (isWatched) {
        await API.delete(`/watched/${movieId}`);
        setIsWatched(false);
        // If we are toggling in watchlist view, we might want to refresh.
        // Let's check status to sync
        await checkStatus();
        alert("Removed from Watched History 👁️");
      } else {
        const watchedData = {
          movie_id: String(movieId),
          movie_title: movieTitle,
          genre: movieGenre,
          poster: moviePoster,
          imdb_rating: movie.imdb_rating || movie.rating || "N/A"
        };
        await API.post("/watched/", watchedData);
        setIsWatched(true);
        setInWatchlist(false); // automatically removed from watchlist
        alert("Marked as Watched 👁️");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Action failed ❌");
    }
  };

  // ADD REVIEW
  const addReview = async () => {
    try {
      const reviewData = {
        movie_id: movieId,
        movie_title: movie.title,
        rating: 5,
        review: "Excellent Movie ⭐",
      };

      // ✅ Use shared API instance
      const response = await API.post("/reviews/", reviewData);
      alert(response.data.message || "Review Added ⭐");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Review failed ❌");
    }
  };

  // VIEW REVIEWS
  const getReviews = async () => {
    try {
      // ✅ Use shared API instance
      const response = await API.get(`/reviews/${movieId}`);

      if (response.data.reviews.length === 0) {
        alert("No reviews found");
        return;
      }

      const reviewsText = response.data.reviews
        .map((review) => `⭐ ${review.rating}/5\n${review.review}`)
        .join("\n\n");

      alert(reviewsText);
    } catch (error) {
      console.error(error);
      alert("Failed to load reviews");
    }
  };

  // ADD TO COLLECTION
  const addToCollection = async () => {
    if (!selectedCollection) {
      alert("Please select a collection");
      return;
    }

    try {
      await addMovieToCollection(selectedCollection, {
        movie_id: String(movieId),
        movie_title: movie.title,
        poster_path: movie.poster,
      });

      alert("Movie added to collection 📁");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to add movie");
    }
  };

  const handleCompareToggle = () => {
    if (isSelected) {
      removeMovieFromCompare(movieId);
    } else {
      addMovieToCompare({
        id: movieId,
        title: movieTitle,
        poster: moviePoster,
      });
    }
  };

  return (
    <div className="movie-card" style={{ position: "relative" }}>
      {isWatched && (
        <span
          className="watched-badge"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "#10b981",
            color: "white",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            zIndex: 2
          }}
        >
          ✓ Watched
        </span>
      )}
      {inWatchlist && (
        <span
          className="watchlist-badge"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            zIndex: 2
          }}
        >
          📺 Watchlist
        </span>
      )}
      <img
        src={
          moviePoster && moviePoster !== "N/A"
            ? moviePoster
            : "https://via.placeholder.com/300x450?text=No+Image"
        }
        alt={movieTitle}
      />

      <div className="movie-info">
        <h3>{movieTitle}</h3>
        <p>{movieGenre}</p>
        <p>{movie.reason}</p>

        <button className="fav-btn" onClick={addToFavorites}>
          ❤️ Favorite
        </button>

        <button className="watch-btn" onClick={addToWatchlist}>
          📺 Watchlist
        </button>

        <button
          className="watched-btn"
          onClick={toggleWatched}
          style={{
            backgroundColor: isWatched ? "#ef4444" : "#10b981",
            color: "white",
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            marginTop: "8px",
            fontWeight: "600",
            transition: "0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1.0";
          }}
        >
          {isWatched ? "❌ Remove Watched" : "👁️ Mark Watched"}
        </button>

        <button className="review-btn" onClick={addReview}>
          ⭐ Add Review
        </button>

        <button className="review-btn" onClick={getReviews}>
          👁 View Reviews
        </button>

        <select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
        >
          <option value="">Select Collection</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>

        <button className="collection-btn" onClick={addToCollection}>
          📁 Add to Collection
        </button>

        <div className="compare-checkbox-container">
          <button
            className={`compare-toggle-btn ${isSelected ? "selected" : ""}`}
            onClick={handleCompareToggle}
          >
            {isSelected ? "✓ Comparing" : "＋ Compare"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;