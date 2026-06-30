import React, { useEffect, useState } from "react";
import API from "../services/api";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // ✅ Use shared API instance (token attached automatically)
      const response = await API.get("/favorites/");
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const removeFavorite = async (id) => {
    try {
      await API.delete(`/favorites/${id}`);
      setFavorites(favorites.filter((movie) => movie.id !== id));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      alert("Failed to remove movie");
    }
  };

  return (
    <div className="page">
      <h1>Your Favorite Movies</h1>

      {favorites.length === 0 ? (
        <p>No favorite movies yet.</p>
      ) : (
        <div className="movies-grid">
          {favorites.map((movie) => (
            <div className="movie-card" key={movie.id}>
              <img
                src={
                  movie.poster && movie.poster !== "N/A"
                    ? movie.poster
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.movie_title}
              />

              <div className="movie-info">
                <h3>{movie.movie_title}</h3>
                <p>{movie.genre || "Movie"}</p>
                <button
                  className="remove-btn"
                  onClick={() => removeFavorite(movie.id)}
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

export default Favorites;