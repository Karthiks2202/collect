import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./Watchlist.css";

function Watchlist() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      // ✅ Use shared API instance (token attached automatically)
      const response = await API.get("/watchlist/");
      setMovies(response.data.watchlist || []);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    }
  };

  const removeMovie = async (id) => {
    try {
      await API.delete(`/watchlist/${id}`);
      setMovies(movies.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      alert("Failed to remove movie");
    }
  };

  return (
    <div className="watchlist-page">
      <h1>🎬 My Watchlist</h1>

      {movies.length === 0 ? (
        <div className="empty-watchlist">
          Your watchlist is empty.
          <br />
          Start adding movies to watch later.
        </div>
      ) : (
        <div className="watchlist-grid">
          {movies.map((movie) => (
            <div className="watchlist-card" key={movie.id}>
              <img
                src={
                  movie.poster && movie.poster !== "N/A"
                    ? movie.poster
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.movie_title}
              />

              <div className="watchlist-info">
                <h3>{movie.movie_title}</h3>
                <p>{movie.genre}</p>
                <button
                  className="remove-btn"
                  onClick={() => removeMovie(movie.id)}
                >
                  ❌ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Watchlist;