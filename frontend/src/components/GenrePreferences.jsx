import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useToast } from "../context/ToastContext";

const COMMON_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Western",
  "Biography",
  "Family",
  "History",
  "Music",
  "Sport",
  "War",
];

function GenrePreferences() {
  const { showToast } = useToast();

  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/preferences/");
      setPreferences(res.data.data || []);
    } catch {
      showToast("Failed to load genre preferences", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchPreferences();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchPreferences]);

  const handleAdd = async () => {
    if (!selectedGenre.trim()) {
      showToast("Please select a genre to add", "warning");
      return;
    }

    // Check client-side duplicate before hitting API
    const alreadyExists = preferences.some(
      (p) => p.genre.toLowerCase() === selectedGenre.trim().toLowerCase()
    );
    if (alreadyExists) {
      showToast(`"${selectedGenre}" is already in your preferences`, "warning");
      return;
    }

    try {
      setAdding(true);
      const res = await API.post("/preferences/", { genre: selectedGenre.trim() });
      setPreferences((prev) => [...prev, res.data.data]);
      setSelectedGenre("");
      showToast(res.data.message || `"${selectedGenre}" added!`, "success");
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to add genre";
      showToast(detail, "error");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (pref) => {
    try {
      setRemovingId(pref.id);
      await API.delete(`/preferences/${pref.id}`);
      setPreferences((prev) => prev.filter((p) => p.id !== pref.id));
      showToast(`"${pref.genre}" removed from preferences`, "success");
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to remove genre";
      showToast(detail, "error");
    } finally {
      setRemovingId(null);
    }
  };

  // Only show genres not yet in preferences
  const availableGenres = COMMON_GENRES.filter(
    (g) => !preferences.some((p) => p.genre.toLowerCase() === g.toLowerCase())
  );

  return (
    <div className="genre-section">
      <h2 className="section-title">Genre Preferences</h2>
      <p className="section-subtitle">
        Personalize your recommendations by selecting the genres you love.
      </p>

      {/* Add Genre Dropdown */}
      <div className="genre-add-row">
        <select
          className="genre-select"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          disabled={adding}
        >
          <option value="">— Pick a genre to add —</option>
          {availableGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button
          className="btn btn--primary btn--sm"
          onClick={handleAdd}
          disabled={adding || !selectedGenre}
        >
          {adding ? "Adding…" : "+ Add"}
        </button>
      </div>

      {/* Genre Chips */}
      {loading ? (
        <div className="genre-chips">
          {[1, 2, 3].map((i) => (
            <div key={i} className="genre-chip genre-chip--skeleton" />
          ))}
        </div>
      ) : preferences.length === 0 ? (
        <div className="genre-empty">
          <span className="genre-empty__icon">🎭</span>
          <p>No genre preferences yet. Add some above!</p>
        </div>
      ) : (
        <div className="genre-chips">
          {preferences.map((pref) => (
            <div
              key={pref.id}
              className={`genre-chip ${removingId === pref.id ? "genre-chip--removing" : ""}`}
            >
              <span className="genre-chip__label">{pref.genre}</span>
              <button
                className="genre-chip__remove"
                onClick={() => handleRemove(pref)}
                disabled={removingId === pref.id}
                aria-label={`Remove ${pref.genre}`}
                title={`Remove ${pref.genre}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GenrePreferences;
