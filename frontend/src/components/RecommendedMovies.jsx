import { useEffect, useState, useCallback } from "react";

import API from "../services/api";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import MovieCard from "./MovieCard";

import "./RecommendedMovies.css";

function RecommendedMovies() {

  const [movies, setMovies] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  // fetch recommendation API
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ Use shared API instance (no hardcoded URL, token auto-attached)
      const response = await API.get("/recommendations");
      setMovies(response.data.recommended_movies || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchRecommendations();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchRecommendations]);

  return (
    <div className="layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="main-section">

        {/* Navbar */}
        <Navbar />

        {/* Search */}
        <SearchBar
          search={search}
          setSearch={setSearch}
        />

        {/* Header */}
        <div className="header">

          <div>

            <h1>
              Recommended For You
            </h1>

            <p>
              Movies recommended based on
              your search history and
              favorites.
            </p>

          </div>

          <button
            className="refresh-btn"
            onClick={
              fetchRecommendations
            }
          >
            Refresh
          </button>

        </div>

        {/* Loading */}
        {loading ? (
          <p>Loading...</p>
        ) : movies.length === 0 ? (

          <div className="empty-state">

            <h2>
              No Recommendations Yet
            </h2>

            <p>
              Start searching and adding
              favorites to get personalized
              recommendations.
            </p>

          </div>

        ) : (

          <div className="movie-grid">

            {movies.map((movie, index) => (

              <MovieCard
                key={index}
                movie={movie}
              />

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default RecommendedMovies;