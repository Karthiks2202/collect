import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const { showToast } = useToast();

  const fetchFavorites = useCallback(async () => {
    try {
      // ✅ Use shared API instance (token attached automatically)
      const response = await API.get("/favorites/");
      setFavorites(response.data.favorites || []);
    } catch {
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchFavorites();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (id) => {
    try {
      await API.delete(`/favorites/${id}`);
      setFavorites((prevFavs) => prevFavs.filter((movie) => movie.id !== id));
      showToast("Removed from favorites", "success");
    } catch {
      showToast("Failed to remove movie", "error");
    }
  }, [showToast]);

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