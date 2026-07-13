import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import API from "../services/api";
import { useCompare } from "../context/CompareContext";
import { useToast } from "../context/ToastContext";
import {
  getCollections,
  addMovieToCollection,
} from "../services/collectionService";

function MovieCard({ movie }) {
  const { showToast } = useToast();
  const [collections, setCollections] = useState([]);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const { isMovieSelected, addMovieToCompare, removeMovieFromCompare } = useCompare();
  const [reviewModal, setReviewModal] = useState(null); // null = closed, [] = list of reviews
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [addReviewModal, setAddReviewModal] = useState(false); // controls add-review form
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");


  const movieId = movie.imdbID || movie.movie_id || movie.title;
  const isSelected = isMovieSelected(movieId);

  const movieTitle = movie.title || movie.movie_title || "Unknown Title";
  const moviePoster = movie.poster || movie.poster_path || "";
  const movieGenre = movie.genre || "";

  const [isWatched, setIsWatched] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  const loadCollections = useCallback(async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch {
    }
  }, []);

  const checkStatus = useCallback(async () => {
    if (!movieId) return;
    try {
      const response = await API.get(`/watched/status/${movieId}`);
      setIsWatched(response.data.watched);
      setInWatchlist(response.data.watchlist);
    } catch (error) {
      console.warn("Failed to fetch watched/watchlist status", error);
    }
  }, [movieId]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadCollections();
      checkStatus();
    }, 0);
    return () => clearTimeout(t);
  }, [movieId, loadCollections, checkStatus]);

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
      alert(error.response?.data?.detail || "Action failed ❌");
    }
  };

  // ADD REVIEW — opens modal
  const openAddReview = () => {
    setNewRating(5);
    setNewReviewText("");
    setAddReviewModal(true);
  };

  const submitReview = async () => {
    try {
      const reviewData = {
        movie_id: movieId,
        movie_title: movie.title,
        rating: newRating,
        review: newReviewText.trim() || "No comment",
      };
      const response = await API.post("/reviews/", reviewData);
      setAddReviewModal(false);
      alert(response.data.message || "Review Added ⭐");
    } catch (error) {
      alert(error.response?.data?.detail || "Review failed ❌");
    }
  };

  // VIEW REVIEWS
  const getReviews = async () => {
    setReviewModal([]); // open modal immediately with empty state
    setReviewsLoading(true);
    try {
      const response = await API.get(`/reviews/${movieId}`);
      setReviewModal(response.data.reviews || []);
    } catch (error) {
      setReviewModal([]);
    } finally {
      setReviewsLoading(false);
    }
  };


  // ADD TO COLLECTION
  const addToCollection = async () => {
    if (selectedCollections.length === 0) {
      showToast("Please select at least one collection 📁", "warning");
      return;
    }

    try {
      const promises = selectedCollections.map((colId) =>
        addMovieToCollection(colId, {
          movie_id: String(movieId),
          movie_title: movieTitle,
          poster_path: moviePoster,
        })
      );
      await Promise.all(promises);
      showToast(`Added movie to ${selectedCollections.length} collection(s) successfully! 🎉`, "success");
      setIsCollectionModalOpen(false);
      setSelectedCollections([]);
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to add movie to some collections ❌", "error");
    }
  };

  const handleCollectionCheckboxChange = (collectionId) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
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

  // ── Portal modals (rendered at document.body to escape card stacking context) ──
  const addReviewPortal = addReviewModal ? createPortal(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.82)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "mcFadeIn 0.18s ease",
      }}
      onClick={() => setAddReviewModal(false)}
    >
      <style>{`
        @keyframes mcFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes mcSlideUp { from { opacity:0; transform: translateY(22px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes mcSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div
        style={{
          background: "linear-gradient(135deg, #1a1f35 0%, #111827 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "460px",
          width: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          animation: "mcSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ margin: 0, color: "#f0f0f5", fontSize: "1.15rem" }}>
            ⭐ Review — <em style={{ color: "#f7c44f" }}>{movieTitle}</em>
          </h3>
          <button
            onClick={() => setAddReviewModal(false)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none", color: "#9fa3b8",
              borderRadius: "50%", width: "32px", height: "32px",
              cursor: "pointer", fontSize: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", color: "#9fa3b8", fontSize: "0.85rem", marginBottom: "10px", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Your Rating
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewRating(star)}
                style={{
                  background: "none", border: "none",
                  fontSize: "2rem", cursor: "pointer",
                  color: star <= newRating ? "#f7c44f" : "#2e303a",
                  transition: "transform 0.15s, color 0.15s",
                  transform: star <= newRating ? "scale(1.2)" : "scale(1)",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = star <= newRating ? "scale(1.2)" : "scale(1)"; }}
              >★</button>
            ))}
            <span style={{ alignSelf: "center", color: "#9fa3b8", fontSize: "0.9rem", marginLeft: "8px" }}>
              {newRating} / 5
            </span>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", color: "#9fa3b8", fontSize: "0.85rem", marginBottom: "8px", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Your Review (optional)
          </label>
          <textarea
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="Write your thoughts about the movie..."
            rows={4}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              padding: "12px 14px",
              color: "#e0e3f0",
              fontSize: "0.9rem",
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              lineHeight: "1.5",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#f7c44f"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={submitReview}
            style={{
              flex: 1, padding: "12px",
              background: "linear-gradient(135deg, #f7c44f, #f59e0b)",
              border: "none", borderRadius: "10px",
              color: "#111", fontWeight: "700",
              fontSize: "0.95rem", cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            ⭐ Submit Review
          </button>
          <button
            onClick={() => setAddReviewModal(false)}
            style={{
              padding: "12px 20px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              color: "#9fa3b8", fontWeight: "600",
              fontSize: "0.9rem", cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  const viewReviewsPortal = reviewModal !== null ? createPortal(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.78)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "mcFadeIn 0.18s ease",
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
          animation: "mcSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
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

        {reviewsLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(255,255,255,0.1)",
                borderTop: "3px solid #4f8ef7",
                borderRadius: "50%",
                animation: "mcSpin 0.7s linear infinite",
                margin: "0 auto 14px",
              }}
            />
            <p style={{ margin: 0, color: "#5c607a", fontSize: "0.9rem" }}>Loading reviews…</p>
          </div>
        ) : reviewModal.length === 0 ? (
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
    </div>,
    document.body
  ) : null;

  const addCollectionPortal = isCollectionModalOpen ? createPortal(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "mcFadeIn 0.18s ease",
      }}
      onClick={() => setIsCollectionModalOpen(false)}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "28px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          animation: "mcSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: "1.2rem", fontWeight: "700" }}>
            📁 Add to Collection(s)
          </h3>
          <button
            onClick={() => setIsCollectionModalOpen(false)}
            style={{
              background: "none", border: "none", color: "#94a3b8",
              cursor: "pointer", fontSize: "1.2rem",
            }}
          >✕</button>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "20px" }}>
          Select one or more collections to add <strong>{movieTitle}</strong>:
        </p>

        {collections.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "#64748b", margin: "0 0 15px 0" }}>You haven't created any collections yet.</p>
            <button
              onClick={() => {
                setIsCollectionModalOpen(false);
                window.location.href = "/collections";
              }}
              style={{
                background: "linear-gradient(90deg, #6366f1, #4f46e5)",
                color: "white", border: "none", padding: "10px 20px",
                borderRadius: "8px", cursor: "pointer", fontWeight: "600",
              }}
            >
              Create Collection
            </button>
          </div>
        ) : (
          <div style={{ maxHeight: "240px", overflowY: "auto", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "5px" }}>
            {collections.map((col) => (
              <label
                key={col.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "10px",
                  padding: "12px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(col.id)}
                  onChange={() => handleCollectionCheckboxChange(col.id)}
                  style={{ width: "18px", height: "18px", accentColor: "#6366f1", cursor: "pointer" }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#f1f5f9", fontWeight: "600", fontSize: "0.95rem" }}>{col.name}</span>
                  <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{col.movies?.length || 0} movies • {col.visibility}</span>
                </div>
              </label>
            ))}
          </div>
        )}

        {collections.length > 0 && (
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={addToCollection}
              style={{
                flex: 1, padding: "12px",
                background: "linear-gradient(90deg, #6366f1, #4f46e5)",
                color: "white", border: "none", borderRadius: "10px",
                fontWeight: "700", cursor: "pointer",
              }}
            >
              Add to Selected
            </button>
            <button
              onClick={() => setIsCollectionModalOpen(false)}
              style={{
                padding: "12px 20px", background: "#334155",
                color: "#f1f5f9", border: "none", borderRadius: "10px",
                fontWeight: "600", cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="movie-card" style={{ position: "relative" }}>

      {/* Portals are rendered via createPortal above the return — injected at document.body */}
      {addReviewPortal}
      {viewReviewsPortal}
      {addCollectionPortal}

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

        <button className="review-btn" onClick={openAddReview}>
          ⭐ Add Review
        </button>

        <button className="review-btn" onClick={getReviews}>
          👁 View Reviews
        </button>

        <button className="collection-btn" onClick={() => setIsCollectionModalOpen(true)}>
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