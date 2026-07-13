import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import {
  getCollection,
  removeMovieFromCollection,
} from "../services/collectionService";
import ConfirmDialog from "../components/ConfirmDialog";

import "./CollectionDetails.css";

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || "8b2506ba";

const CollectionDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [collection, setCollection] = useState(null);
  const [moviesDetails, setMoviesDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) {
        setCurrentUser(JSON.parse(u));
      }
    } catch {
      // Silently ignore parse errors — currentUser defaults to null
    }
  }, []);

  const loadCollection = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCollection(id);
      setCollection(data);

      // Fetch OMDB details for movies in parallel to get Year and IMDb Rating
      if (data.movies && data.movies.length > 0) {
        const detailsPromises = data.movies.map(async (movie) => {
          try {
            const res = await axios.get(
              `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.movie_id}`
            );
            return { [movie.movie_id]: res.data };
          } catch {
            return { [movie.movie_id]: null };
          }
        });
        const results = await Promise.all(detailsPromises);
        const mergedDetails = Object.assign({}, ...results);
        setMoviesDetails(mergedDetails);
      }
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to load collection details ❌", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadCollection();
    }, 0);
    return () => clearTimeout(t);
  }, [loadCollection]);

  const handleRemoveConfirmed = useCallback(async () => {
    if (!pendingRemoveId) return;
    const movieId = pendingRemoveId;
    setPendingRemoveId(null);
    try {
      await removeMovieFromCollection(id, movieId);
      showToast("Movie removed from collection successfully! 🍿", "success");
      loadCollection();
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to remove movie ❌", "error");
    }
  }, [pendingRemoveId, id, loadCollection, showToast]);

  if (loading) {
    return (
      <div className="collection-details-loading">
        <div className="spinner"></div>
        <p>Loading collection details...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="collection-details-error">
        <h2>Collection not found 🔍</h2>
        <Link to="/collections" className="back-link">
          ← Back to My Collections
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && collection.user_id === currentUser.id;

  return (
    <div className="collection-details-page">
      <div className="details-header">
        <Link to="/collections" className="back-link">
          ← Back to Collections
        </Link>
        <div className="header-main">
          <div className="header-info">
            <h2 className="title">{collection.name}</h2>
            {collection.description && <p className="desc">{collection.description}</p>}
            <div className="badges">
              <span className={`badge visibility ${collection.visibility}`}>
                {collection.visibility === "public" ? "🌐 Public" : "🔒 Private"}
              </span>
              <span className="badge count">
                🎬 {collection.movies?.length || 0} movies
              </span>
            </div>
          </div>
          {collection.cover_image_url && (
            <div className="header-cover">
              <img src={collection.cover_image_url} alt={collection.name} />
            </div>
          )}
        </div>
      </div>

      <div className="movies-section">
        {collection.movies?.length === 0 ? (
          <div className="empty-movies">
            <div className="empty-icon">🍿</div>
            <h3>No movies in this collection yet</h3>
            <p>Go to the Home page, search for movies, and add them to this collection!</p>
            <Link to="/" className="search-movies-btn">
              Search Movies
            </Link>
          </div>
        ) : (
          <div className="collection-movies-grid">
            {collection.movies.map((movie) => {
              const omdbInfo = moviesDetails[movie.movie_id] || {};
              const rating = omdbInfo.imdbRating || "N/A";
              const year = omdbInfo.Year || "N/A";

              return (
                <div className="col-movie-card" key={movie.movie_id}>
                  <div className="movie-poster-wrap">
                    <img
                      src={
                        movie.poster_path && movie.poster_path !== "N/A"
                          ? movie.poster_path
                          : "https://via.placeholder.com/300x450?text=No+Image"
                      }
                      alt={movie.movie_title}
                    />
                    {rating !== "N/A" && (
                      <span className="imdb-rating-badge">
                        ⭐ {rating}
                      </span>
                    )}
                  </div>

                  <div className="movie-details-info">
                    <h4 className="movie-title">{movie.movie_title}</h4>
                    <div className="movie-meta">
                      <span className="movie-year">📅 {year}</span>
                    </div>
                    {isOwner && (
                      <button
                        className="remove-from-col-btn"
                        onClick={() => setPendingRemoveId(movie.movie_id)}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingRemoveId !== null}
        title="Remove Movie?"
        message="This movie will be removed from the collection."
        confirmLabel="Remove"
        icon="🍿"
        onConfirm={handleRemoveConfirmed}
        onCancel={() => setPendingRemoveId(null)}
      />
    </div>
  );
};

export default CollectionDetails;