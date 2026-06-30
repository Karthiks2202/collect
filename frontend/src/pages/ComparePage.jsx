import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useCompare } from "../context/CompareContext";
import "./Compare.css";

function ComparePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedMovies, clearCompare } = useCompare();

  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Determine which movie IDs to compare:
  // Either from the URL query param `?movies=id1,id2,id3` or from the context state.
  const getMovieIdsToCompare = () => {
    const urlMovies = searchParams.get("movies");
    if (urlMovies) {
      return urlMovies.split(",").filter(Boolean);
    }
    return selectedMovies.map((m) => m.id);
  };

  const movieIds = getMovieIdsToCompare();

  useEffect(() => {
    const fetchComparison = async () => {
      if (movieIds.length < 2) {
        setError("Please select at least 2 movies to compare.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = {
          movie1: movieIds[0],
          movie2: movieIds[1],
        };
        if (movieIds[2]) {
          params.movie3 = movieIds[2];
        }

        const response = await API.get("/movies/compare", { params });
        setCompareData(response.data);
      } catch (err) {
        console.error("Comparison fetch error:", err);
        setError(
          err.response?.data?.detail || "Failed to load movie comparison data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [searchParams, selectedMovies]);

  // Determine highest metrics for highlighting
  const getComparisonMetrics = () => {
    if (!compareData) return {};

    const movies = [compareData.movie1, compareData.movie2];
    if (compareData.movie3) {
      movies.push(compareData.movie3);
    }

    const imdbRatings = movies
      .map((m) => m.imdb_rating)
      .filter((r) => r !== null && !isNaN(r));
    const maxImdb = imdbRatings.length ? Math.max(...imdbRatings) : -1;

    const userRatings = movies
      .map((m) => m.avg_rating)
      .filter((r) => r !== null && !isNaN(r));
    const maxUser = userRatings.length ? Math.max(...userRatings) : -1;

    const reviewCounts = movies.map((m) => m.total_reviews || 0);
    const maxReviews = Math.max(...reviewCounts);

    return { maxImdb, maxUser, maxReviews };
  };

  const { maxImdb, maxUser, maxReviews } = getComparisonMetrics();

  const handleShareLink = () => {
    const ids = movieIds.join(",");
    const shareUrl = `${window.location.origin}/compare?movies=${ids}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGoBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="compare-page-container">
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <h2>Loading Movie Comparison...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || movieIds.length < 2) {
    return (
      <div className="compare-page-container">
        <div className="compare-header">
          <h1>Movie Comparison</h1>
          <button className="compare-btn-secondary" onClick={handleGoBack}>
            ← Back to Home
          </button>
        </div>
        <div className="comparison-summary-card" style={{ borderColor: "#ef4444" }}>
          <h3 style={{ color: "#ef4444" }}>Cannot Perform Comparison</h3>
          <p>{error || "Please select at least 2 movies first."}</p>
        </div>
      </div>
    );
  }

  const comparedMovies = [compareData.movie1, compareData.movie2];
  if (compareData.movie3) {
    comparedMovies.push(compareData.movie3);
  }

  const gridClass = comparedMovies.length === 3 ? "compare-grid-3" : "compare-grid-2";

  return (
    <div className="compare-page-container">
      <div className="compare-header">
        <h1>Compare Movies</h1>
        <div className="compare-header-actions">
          <button className="compare-btn-secondary" onClick={handleShareLink}>
            {copied ? "✓ Copied!" : "🔗 Share Link"}
          </button>
          <button className="compare-btn-secondary" onClick={clearCompare}>
            Clear Selection
          </button>
          <button className="compare-btn-secondary" onClick={handleGoBack}>
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Comparison Summary Section */}
      <div className="comparison-summary-card">
        <h3>📊 Quick Insights</h3>
        <div className="summary-items">
          {compareData.summary && compareData.summary.length > 0 ? (
            compareData.summary.map((sum, index) => (
              <div key={index} className="summary-item">
                {sum.text}
              </div>
            ))
          ) : (
            <div className="summary-item">No significant differences to list.</div>
          )}
        </div>
      </div>

      {/* Side-by-Side Grid */}
      <div className={`compare-grid ${gridClass}`}>
        {comparedMovies.map((movie, index) => {
          const isImdbWinner =
            movie.imdb_rating !== null && movie.imdb_rating === maxImdb;
          const isUserWinner =
            movie.avg_rating !== null && movie.avg_rating === maxUser;
          const isReviewWinner =
            movie.total_reviews > 0 && movie.total_reviews === maxReviews;

          return (
            <div key={movie.movie_id || index} className="compare-column">
              <div className="compare-movie-header">
                <img
                  src={
                    movie.poster && movie.poster !== "N/A"
                      ? movie.poster
                      : "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={movie.title}
                  className="compare-poster"
                />
                <h2 className="compare-movie-title">{movie.title}</h2>
                <span className="compare-movie-year">Released: {movie.year}</span>
              </div>

              <div className="compare-details-list">
                <div className="compare-detail-row">
                  <div className="detail-label">Genre</div>
                  <div className="detail-value">{movie.genre}</div>
                </div>

                <div className="compare-detail-row">
                  <div className="detail-label">Runtime</div>
                  <div className="detail-value">{movie.runtime}</div>
                </div>

                <div className="compare-detail-row">
                  <div className="detail-label">Director</div>
                  <div className="detail-value">{movie.director}</div>
                </div>

                <div className="compare-detail-row">
                  <div className="detail-label">Cast</div>
                  <div className="detail-value">{movie.actors}</div>
                </div>

                <div className="compare-detail-row">
                  <div className="detail-label">IMDb Rating</div>
                  <div className="rating-pill-container">
                    <span className="detail-value" style={{ marginRight: "8px" }}>
                      {movie.imdb_rating !== null ? `${movie.imdb_rating} / 10` : "N/A"}
                    </span>
                    {movie.imdb_rating !== null && (
                      <span
                        className={
                          isImdbWinner ? "winner-highlight" : "loser-highlight"
                        }
                      >
                        {isImdbWinner ? "★ Highest" : "Standard"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="compare-detail-row">
                  <div className="detail-label">User Rating</div>
                  <div className="rating-pill-container">
                    <span className="detail-value" style={{ marginRight: "8px" }}>
                      {movie.avg_rating !== null ? `${movie.avg_rating} / 10` : "No Ratings"}
                    </span>
                    {movie.avg_rating !== null && (
                      <span
                        className={
                          isUserWinner ? "winner-highlight" : "loser-highlight"
                        }
                      >
                        {isUserWinner ? "★ Highest" : "Standard"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="compare-detail-row">
                  <div className="detail-label">Total Reviews</div>
                  <div className="rating-pill-container">
                    <span className="detail-value" style={{ marginRight: "8px" }}>
                      {movie.total_reviews} reviews
                    </span>
                    {movie.total_reviews > 0 && (
                      <span
                        className={
                          isReviewWinner ? "winner-highlight" : "loser-highlight"
                        }
                      >
                        {isReviewWinner ? "★ Most" : "Standard"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="compare-detail-row">
                  <div className="detail-label">Plot Outline</div>
                  <div className="detail-value" style={{ fontSize: "14px", color: "#94a3b8" }}>
                    {movie.plot}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ComparePage;
