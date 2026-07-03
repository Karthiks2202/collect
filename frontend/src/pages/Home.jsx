import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../services/api";

import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";

// ✅ OMDB API key from environment variable
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || "8b2506ba";

function Home() {
  const [movies, setMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [searchError, setSearchError] = useState("");

  // =========================
  // SEARCH MOVIES
  // =========================
  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setSearchError("");

    try {
      // 1. Fetch results from OMDB (external movie database)
      const response = await axios.get(
        `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`
      );

      setMovies(response.data.Search || []);

      if (!response.data.Search) {
        setSearchError("No movies found for that search.");
      }

      // 2. ✅ Save search to backend so recommendations stay accurate
      try {
        await API.get("/movies/search", {
          params: { query },
        });
      } catch {
        // Search history save failure should not break the UI
        console.warn("Could not save search history");
      }

    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Search failed. Please try again.");
    }
  };

  // =========================
  // LOAD RECOMMENDATIONS
  // =========================
  const fetchRecommendations = async () => {
    try {
      const response = await API.get("/recommendations/");
      setRecommendedMovies(response.data.recommended_movies || []);
    } catch (error) {
      console.error("Recommendations error:", error);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <>
      <SearchBar onSearch={handleSearch} />

        <h1 className="section-title">Search Results</h1>

        {searchError && <p style={{ color: "#e03333" }}>{searchError}</p>}

        <div className="movies-grid">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div key={movie.imdbID}>
                <MovieCard
                  movie={{
                    imdbID: movie.imdbID,
                    title: movie.Title,
                    genre: movie.Type,
                    poster: movie.Poster,
                    reason: movie.Year,
                  }}
                />
              </div>
            ))
          ) : (
            <p>No search results</p>
          )}
        </div>

        <h1 className="section-title">Recommended Movies</h1>

        <div className="movies-grid">
          {recommendedMovies.length > 0 ? (
            recommendedMovies.map((movie, index) => (
              <div key={index}>
                <MovieCard
                  movie={{
                    imdbID: movie.imdbID,
                    title: movie.title,
                    genre: movie.genre,
                    poster:
                      movie.poster ||
                      "https://via.placeholder.com/300x450?text=No+Image",
                    reason: movie.reason,
                  }}
                />
              </div>
            ))
          ) : (
            <p>No recommendations yet</p>
          )}
        </div>
      </>
  );
}

export default Home;