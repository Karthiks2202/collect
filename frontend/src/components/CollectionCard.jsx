import { Link } from "react-router-dom";

/**
 * CollectionCard — displays a single collection with cover, metadata,
 * and Open / Edit / Delete actions.
 *
 * Props:
 *   collection   {object}   — the collection data object
 *   onEdit       {function} — called with the collection when Edit is clicked
 *   onDelete     {function} — called with collection.id when Delete is clicked
 */

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

const CollectionCard = ({ collection, onEdit, onDelete }) => {
  return (
    <div className="collection-card">
      {/* Cover image / fallback */}
      <div className="card-cover">
        {collection.cover_image_url ? (
          <img src={collection.cover_image_url} alt={collection.name} />
        ) : (
          <div className="card-cover-fallback">
            <span className="fallback-icon">🎬</span>
          </div>
        )}
        <span className={`visibility-badge ${collection.visibility}`}>
          {collection.visibility === "public" ? "🌐 Public" : "🔒 Private"}
        </span>
      </div>

      {/* Body */}
      <div className="collection-body">
        <h3>{collection.name}</h3>
        <p className="description">
          {collection.description || "No description provided."}
        </p>

        <div className="meta-info">
          <span className="movie-count">
            🎥 {collection.movies?.length || 0} movies
          </span>
          <span className="created-date">
            📅 {formatDate(collection.created_at)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="card-buttons">
          <Link to={`/collections/${collection.id}`} className="view-btn">
            📂 Open
          </Link>
          <button
            type="button"
            className="edit-btn"
            onClick={() => onEdit(collection)}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            className="delete-btn"
            onClick={() => onDelete(collection.id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
