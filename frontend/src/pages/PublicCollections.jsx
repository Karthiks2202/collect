import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import {
  getPublicCollections,
  searchCollections,
} from "../services/collectionService";

import "./PublicCollections.css";

const PublicCollections = () => {
  const { showToast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const loadPublicCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicCollections();
      setCollections(data);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.detail || "Failed to load public collections ❌", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadPublicCollections();
    }, 0);
    return () => clearTimeout(t);
  }, [loadPublicCollections]);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadPublicCollections();
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchCollections(searchQuery.trim());
      setCollections(data);
    } catch (error) {
      console.error(error);
      showToast("Search failed. Please try again ❌", "error");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, loadPublicCollections, showToast]);

  const handleClearSearch = () => {
    setSearchQuery("");
    loadPublicCollections();
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="public-collections-page">
      <div className="page-header">
        <h2>🌐 Public Movie Collections</h2>
        <p className="subtitle">Discover custom collections shared by other movie lovers</p>
      </div>

      <form onSubmit={handleSearch} className="search-collections-form">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search collections by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-btn" onClick={handleClearSearch}>
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="search-submit-btn" disabled={isSearching}>
          {isSearching ? "Searching..." : "🔍 Search"}
        </button>
      </form>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching public collections...</p>
        </div>
      ) : (
        <div className="public-grid">
          {collections.length === 0 ? (
            <div className="no-results">
              <div className="empty-icon">🔍</div>
              <h3>No collections found</h3>
              <p>We couldn't find any public collections matching your criteria.</p>
              {searchQuery && (
                <button className="reset-btn" onClick={handleClearSearch}>
                  View All Collections
                </button>
              )}
            </div>
          ) : (
            collections.map((collection) => (
              <Link
                to={`/collections/${collection.id}`}
                className="public-card-link"
                key={collection.id}
              >
                <div className="public-card">
                  <div className="card-cover">
                    {collection.cover_image_url ? (
                      <img src={collection.cover_image_url} alt={collection.name} />
                    ) : (
                      <div className="card-cover-fallback">
                        <span className="fallback-icon">🎬</span>
                      </div>
                    )}
                    <span className="movies-count-badge">
                      🎥 {collection.movies?.length || 0} movies
                    </span>
                  </div>

                  <div className="card-body">
                    <h3>{collection.name}</h3>
                    <p className="description">
                      {collection.description || "No description provided."}
                    </p>
                    <div className="card-meta">
                      <span className="owner">
                        👤 Created by: <strong>{collection.user?.username || `User #${collection.user_id}`}</strong>
                      </span>
                      <span className="created-at">
                        📅 {formatDate(collection.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PublicCollections;
