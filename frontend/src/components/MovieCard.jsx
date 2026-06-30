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

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Failed to load collections:", error);
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
        movie_id: movieId,
        movie_title: movie.title,
        genre: movie.genre,
        poster: movie.poster,
      };

      // ✅ Use shared API instance
      const response = await API.post("/watchlist/", watchlistData);
      alert(response.data.message || "Added to Watchlist 📺");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Watchlist failed ❌");
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
        title: movie.title,
        poster: movie.poster,
      });
    }
  };

  return (
    <div className="movie-card">
      <img
        src={
          movie.poster && movie.poster !== "N/A"
            ? movie.poster
            : "https://via.placeholder.com/300x450?text=No+Image"
        }
        alt={movie.title}
      />

      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>{movie.genre}</p>
        <p>{movie.reason}</p>

        <button className="fav-btn" onClick={addToFavorites}>
          ❤️ Favorite
        </button>

        <button className="watch-btn" onClick={addToWatchlist}>
          📺 Watchlist
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