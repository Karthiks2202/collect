import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./Watchlist.css";

function Watchlist() {
  const [activeTab, setActiveTab] = useState("watchlist");
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters & Sorting for Watched History
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (activeTab === "watchlist") {
      fetchWatchlist();
    } else {
      fetchWatched();
    }
  }, [activeTab]);

  const fetchWatchlist = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/watchlist/");
      setWatchlistMovies(response.data.watchlist || []);
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
      setError("Could not load watchlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWatched = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/watched/");
      setWatchedMovies(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch watched history:", err);
      setError("Could not load watched history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (id) => {
    try {
      await API.delete(`/watchlist/${id}`);
      setWatchlistMovies(watchlistMovies.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to remove watchlist movie:", err);
      alert("Failed to remove movie");
    }
  };

  const markAsWatched = async (movie) => {
    try {
      const watchedData = {
        movie_id: String(movie.movie_id),
        movie_title: movie.movie_title,
        genre: movie.genre || "",
        poster: movie.poster || "",
        imdb_rating: "N/A", // Default rating if not available
      };
      await API.post("/watched/", watchedData);
      setWatchlistMovies(watchlistMovies.filter((m) => m.id !== movie.id));
      alert(`"${movie.movie_title}" marked as watched!`);
    } catch (err) {
      console.error("Mark watched failed:", err);
      alert("Failed to mark movie as watched");
    }
  };

  const removeFromWatched = async (movieId) => {
    try {
      await API.delete(`/watched/${movieId}`);
      setWatchedMovies(watchedMovies.filter((m) => m.movie_id !== movieId));
    } catch (err) {
      console.error("Failed to remove watched movie:", err);
      alert("Failed to remove movie");
    }
  };

  const moveToWatchlist = async (movie) => {
    try {
      const watchlistData = {
        movie_id: String(movie.movie_id),
        movie_title: movie.movie_title,
        genre: movie.genre || "",
        poster: movie.poster || "",
      };
      await API.post("/watchlist/", watchlistData);
      await API.delete(`/watched/${movie.movie_id}`);
      setWatchedMovies(watchedMovies.filter((m) => m.movie_id !== movie.movie_id));
      alert(`"${movie.movie_title}" moved back to Watchlist!`);
    } catch (err) {
      console.error("Failed to move back to watchlist:", err);
      alert("Failed to move movie");
    }
  };

  // Get unique genres from watched history for filtering
  const allGenres = Array.from(
    new Set(
      watchedMovies.flatMap((m) =>
        m.genre ? m.genre.split(",").map((g) => g.trim()) : []
      )
    )
  ).sort();

  // Filter watched movies
  const filteredWatched = watchedMovies.filter((m) => {
    if (!selectedGenre) return true;
    return m.genre && m.genre.toLowerCase().includes(selectedGenre.toLowerCase());
  });

  // Sort watched movies
  const sortedWatched = [...filteredWatched].sort((a, b) => {
    const dateA = new Date(a.watched_date);
    const dateB = new Date(b.watched_date);
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) + " " + date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="watchlist-page" style={{ padding: "10px 0" }}>
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>🍿 My Library</h1>

      {/* Tabs */}
      <div
        className="watchlist-tabs"
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px",
          borderBottom: "1px solid #334155",
          paddingBottom: "10px",
        }}
      >
        <button
          onClick={() => setActiveTab("watchlist")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "watchlist" ? "#38bdf8" : "#94a3b8",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "8px 16px",
            position: "relative",
            transition: "0.3s",
          }}
        >
          📺 Watchlist ({watchlistMovies.length})
          {activeTab === "watchlist" && (
            <div
              style={{
                position: "absolute",
                bottom: "-11px",
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: "#38bdf8",
                borderRadius: "3px",
              }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("watched")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "watched" ? "#38bdf8" : "#94a3b8",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "8px 16px",
            position: "relative",
            transition: "0.3s",
          }}
        >
          👁️ Watched History ({watchedMovies.length})
          {activeTab === "watched" && (
            <div
              style={{
                position: "absolute",
                bottom: "-11px",
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: "#38bdf8",
                borderRadius: "3px",
              }}
            />
          )}
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="spinner" style={{ border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #38bdf8", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "auto" }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: "15px", color: "#cbd5e1" }}>Loading movies...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: "20px", backgroundColor: "rgba(224, 51, 51, 0.1)", border: "1px solid #e03333", borderRadius: "10px", color: "#fca5a5", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Empty States & Grids */}
      {!loading && !error && (
        <>
          {activeTab === "watchlist" ? (
            watchlistMovies.length === 0 ? (
              <div className="empty-watchlist" style={{ textAlign: "center", padding: "60px 20px", background: "#1e293b", borderRadius: "15px", color: "#cbd5e1" }}>
                <span style={{ fontSize: "50px", display: "block", marginBottom: "15px" }}>📺</span>
                <h3>Your watchlist is empty.</h3>
                <p style={{ color: "#94a3b8", marginTop: "5px" }}>Start adding movies from the home page to watch them later.</p>
              </div>
            ) : (
              <div className="watchlist-grid">
                {watchlistMovies.map((movie) => (
                  <div className="watchlist-card" key={movie.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <img
                        src={
                          movie.poster && movie.poster !== "N/A"
                            ? movie.poster
                            : "https://via.placeholder.com/300x450?text=No+Image"
                        }
                        alt={movie.movie_title}
                      />
                      <div className="watchlist-info">
                        <h3 style={{ fontSize: "18px", margin: "5px 0" }}>{movie.movie_title}</h3>
                        <p style={{ color: "#38bdf8", fontSize: "14px", fontWeight: "500" }}>{movie.genre || "Movie"}</p>
                      </div>
                    </div>

                    <div style={{ padding: "0 15px 15px 15px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        className="mark-watched-btn"
                        onClick={() => markAsWatched(movie)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "0.2s"
                        }}
                      >
                        👁️ Mark as Watched
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromWatchlist(movie.id)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          borderRadius: "8px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)"; e.currentTarget.style.color = "#f87171"; }}
                      >
                        ❌ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Watched History Tab */
            <>
              {watchedMovies.length === 0 ? (
                <div className="empty-watched" style={{ textAlign: "center", padding: "60px 20px", background: "#1e293b", borderRadius: "15px", color: "#cbd5e1" }}>
                  <span style={{ fontSize: "50px", display: "block", marginBottom: "15px" }}>👁️</span>
                  <h3>No watched movies yet.</h3>
                  <p style={{ color: "#94a3b8", marginTop: "5px" }}>Mark movies as watched to track your movie journey!</p>
                </div>
              ) : (
                <>
                  {/* Sorting and Filtering Bar */}
                  <div
                    className="filters-bar"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "15px",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#1e293b",
                      padding: "15px 20px",
                      borderRadius: "12px",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span style={{ color: "#94a3b8", fontSize: "14px" }}>Filter:</span>
                      <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        style={{
                          backgroundColor: "#0f172a",
                          color: "white",
                          border: "1px solid #334155",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">All Genres</option>
                        {allGenres.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ color: "#94a3b8", fontSize: "14px" }}>Sort:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          style={{
                            backgroundColor: "#0f172a",
                            color: "white",
                            border: "1px solid #334155",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="newest">Newest Watched</option>
                          <option value="oldest">Oldest Watched</option>
                        </select>
                      </div>
                      <span style={{ backgroundColor: "#38bdf8", color: "#0f172a", padding: "6px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
                        Total: {filteredWatched.length} watched
                      </span>
                    </div>
                  </div>

                  {sortedWatched.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No movies found matching your selected genre filter.
                    </div>
                  ) : (
                    <div className="watchlist-grid">
                      {sortedWatched.map((movie) => (
                        <div className="watchlist-card" key={movie.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <img
                              src={
                                movie.poster && movie.poster !== "N/A"
                                  ? movie.poster
                                  : "https://via.placeholder.com/300x450?text=No+Image"
                              }
                              alt={movie.movie_title}
                            />
                            <div className="watchlist-info">
                              <h3 style={{ fontSize: "18px", margin: "5px 0" }}>{movie.movie_title}</h3>
                              <p style={{ color: "#38bdf8", fontSize: "14px", fontWeight: "500", margin: "2px 0" }}>{movie.genre || "Movie"}</p>
                              
                              <div style={{ display: "flex", alignItems: "center", gap: "5px", margin: "8px 0" }}>
                                <span style={{ color: "#fbbf24", fontWeight: "bold" }}>⭐</span>
                                <span style={{ fontSize: "14px" }}>IMDb: {movie.imdb_rating || "N/A"}</span>
                              </div>

                              <div style={{ fontSize: "12px", color: "#94a3b8", borderTop: "1px solid #334155", paddingTop: "8px", marginTop: "8px" }}>
                                📅 {formatDate(movie.watched_date)}
                              </div>
                            </div>
                          </div>

                          <div style={{ padding: "0 15px 15px 15px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <button
                              onClick={() => moveToWatchlist(movie)}
                              style={{
                                width: "100%",
                                padding: "10px",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "0.2s"
                              }}
                            >
                              📺 Move to Watchlist
                            </button>
                            <button
                              className="remove-btn"
                              onClick={() => removeFromWatched(movie.movie_id)}
                              style={{
                                width: "100%",
                                padding: "10px",
                                backgroundColor: "rgba(239, 68, 68, 0.2)",
                                color: "#f87171",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "0.2s"
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "white"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)"; e.currentTarget.style.color = "#f87171"; }}
                            >
                              ❌ Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Watchlist;