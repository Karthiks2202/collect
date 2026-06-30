import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import "../pages/Compare.css";

function CompareBar() {
  const { selectedMovies, removeMovieFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (selectedMovies.length === 0) return null;

  const handleCompareClick = () => {
    if (selectedMovies.length < 2) {
      alert("Please select at least 2 movies to compare.");
      return;
    }
    navigate("/compare");
  };

  return (
    <div className="compare-bar">
      <div className="compare-bar-content">
        <div className="compare-items-list">
          {selectedMovies.map((movie) => (
            <div key={movie.id} className="compare-item-chip">
              <img
                src={
                  movie.poster && movie.poster !== "N/A"
                    ? movie.poster
                    : "https://via.placeholder.com/50x75?text=No+Image"
                }
                alt={movie.title}
                className="compare-item-thumb"
              />
              <span className="compare-item-title">{movie.title}</span>
              <button
                className="compare-item-remove"
                onClick={() => removeMovieFromCompare(movie.id)}
                title="Remove movie"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="compare-actions">
          <button className="compare-clear-btn" onClick={clearCompare}>
            Clear All
          </button>
          <button
            className={`compare-submit-btn ${
              selectedMovies.length < 2 ? "disabled" : ""
            }`}
            onClick={handleCompareClick}
            disabled={selectedMovies.length < 2}
          >
            Compare ({selectedMovies.length}/3)
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompareBar;
