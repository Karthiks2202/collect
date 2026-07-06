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
  const [reviewModal, setReviewModal] = useState(null); // null = closed, [] = list of reviews


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
      const response = await API.get(`/reviews/${movieId}`);
      setReviewModal(response.data.reviews || []);
    } catch (error) {
      console.error(error);
      setReviewModal([]);
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

      {/* ── Review Modal Overlay ── */}
      {reviewModal !== null && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setReviewModal(null)}
        >
          <div
            style={{
              background: "#1a1f35",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "28px",
              maxWidth: "480px",
              width: "100%",
              maxHeight: "70vh",
              overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#f0f0f5", fontSize: "1.1rem" }}>
                Reviews for <em style={{ color: "#4f8ef7" }}>{movieTitle}</em>
              </h3>
              <button
                onClick={() => setReviewModal(null)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#9fa3b8",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >✕</button>
            </div>

            {reviewModal.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#5c607a" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🎬</div>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>No reviews yet for this movie.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {reviewModal.map((r, i) => (
                  <div
                    key={r.id || i}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                      {[1,2,3,4,5].map((star) => (
                        <span key={star} style={{ fontSize: "1.1rem", color: star <= r.rating ? "#f7c44f" : "#2e303a" }}>★</span>
                      ))}
                      <span style={{ marginLeft: "6px", fontSize: "0.8rem", color: "#9fa3b8" }}>{r.rating}/5</span>
                    </div>
                    <p style={{ margin: 0, color: "#d0d3e8", fontSize: "0.9rem", lineHeight: "1.5" }}>
                      {r.review || <em style={{ color: "#5c607a" }}>No text provided</em>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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