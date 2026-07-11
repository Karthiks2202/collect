import { useState, useEffect } from "react";
import "./CreateCollectionModal.css";

function CreateCollectionModal({ isOpen, onClose, onSave, initialData }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setVisibility(initialData.visibility || "private");
      setCoverImageUrl(initialData.cover_image_url || "");
    } else {
      setName("");
      setDescription("");
      setVisibility("private");
      setCoverImageUrl("");
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Collection name is required");
      return;
    }
    setError("");
    onSave({
      name: name.trim(),
      description: description.trim(),
      visibility,
      cover_image_url: coverImageUrl.trim() || null,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? "✏️ Edit Collection" : "➕ Create Collection"}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="collection-name">Collection Name <span className="required">*</span></label>
            <input
              id="collection-name"
              type="text"
              placeholder="e.g., Sci-Fi Favorites"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="collection-desc">Description</label>
            <textarea
              id="collection-desc"
              placeholder="Describe your collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="collection-visibility">Visibility</label>
            <select
              id="collection-visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="private">🔒 Private</option>
              <option value="public">🌐 Public</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="collection-cover">Cover Image URL (Optional)</label>
            <input
              id="collection-cover"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {initialData ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCollectionModal;
