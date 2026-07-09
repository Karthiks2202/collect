import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../services/collectionService";

import "./Collection.css";

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadCollections = useCallback(async () => {
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadCollections();
    }, 0);
    return () => clearTimeout(t);
  }, [loadCollections]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const payload = {
      name,
      description,
    };

    try {
      if (editingId) {
        await updateCollection(editingId, payload);
      } else {
        await createCollection(payload);
      }

      setName("");
      setDescription("");
      setEditingId(null);

      loadCollections();
    } catch (error) {
      console.error(error);
    }
  }, [name, description, editingId, loadCollections]);

  const handleEdit = useCallback((collection) => {
    setEditingId(collection.id);
    setName(collection.name);
    setDescription(collection.description || "");
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this collection?")) return;

    try {
      await deleteCollection(id);
      loadCollections();
    } catch (error) {
      console.error(error);
    }
  }, [loadCollections]);

return (
  <div className="collections-page">
    <h2>🎬 My Collections</h2>

    <form onSubmit={handleSubmit} className="collection-form">
      <input
        type="text"
        placeholder="Collection Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit">
        {editingId ? "✏️ Update Collection" : "➕ Create Collection"}
      </button>
    </form>

    <div className="collection-grid">
      {collections.length === 0 ? (
        <p>No collections found.</p>
      ) : (
        collections.map((collection) => (
          <div className="collection-card" key={collection.id}>

            <div className="collection-header"></div>

            <div className="collection-body">

              <h3>{collection.name}</h3>

              <p>
                {collection.description || "No description available."}
              </p>

              <p className="movie-count">
                🎬 Movies: {collection.movies?.length || 0}
              </p>

              <div className="card-buttons">
                <Link
                  to={`/collections/${collection.id}`}
                  className="view-btn"
                >
                  📂 Open
                </Link>

                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => handleEdit(collection)}
                >
                  ✏️ Edit
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDelete(collection.id)}
                >
                  🗑 Delete
                </button>
              </div>

            </div>

          </div>
        ))
      )}
    </div>
  </div>
);
};

export default Collections;