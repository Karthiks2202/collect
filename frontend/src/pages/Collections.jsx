import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../services/collectionService";
import CreateCollectionModal from "../components/CreateCollectionModal";

import "./Collection.css";

const Collections = () => {
  const { showToast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.detail || "Failed to load collections ❌", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadCollections();
    }, 0);
    return () => clearTimeout(t);
  }, [loadCollections]);

  const handleOpenCreateModal = () => {
    setEditingCollection(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (collection) => {
    setEditingCollection(collection);
    setIsModalOpen(true);
  };

  const handleSaveCollection = async (payload) => {
    try {
      if (editingCollection) {
        await updateCollection(editingCollection.id, payload);
        showToast("Collection updated successfully! 🎉", "success");
      } else {
        await createCollection(payload);
        showToast("Collection created successfully! 🎉", "success");
      }
      setIsModalOpen(false);
      setEditingCollection(null);
      loadCollections();
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Operation failed ❌", "error");
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;

    try {
      await deleteCollection(id);
      showToast("Collection deleted successfully! 🗑️", "success");
      loadCollections();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.detail || "Failed to delete collection ❌", "error");
    }
  }, [loadCollections, showToast]);

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
    <div className="collections-page">
      <div className="collections-header">
        <div>
          <h2>🎬 My Collections</h2>
          <p className="subtitle">Organize and share your favorite movies</p>
        </div>
        <button className="create-collection-btn" onClick={handleOpenCreateModal}>
          ➕ Create Collection
        </button>
      </div>

      {loading ? (
        <div className="collections-loading">
          <div className="spinner"></div>
          <p>Loading your collections...</p>
        </div>
      ) : (
        <div className="collection-grid">
          {collections.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No collections yet</h3>
              <p>Create your first collection to start organizing movies!</p>
              <button className="create-collection-btn" onClick={handleOpenCreateModal}>
                Create Collection
              </button>
            </div>
          ) : (
            collections.map((collection) => (
              <div className="collection-card" key={collection.id}>
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

                  <div className="card-buttons">
                    <Link to={`/collections/${collection.id}`} className="view-btn">
                      📂 Open
                    </Link>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleOpenEditModal(collection)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(collection.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <CreateCollectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCollection(null);
        }}
        onSave={handleSaveCollection}
        initialData={editingCollection}
      />
    </div>
  );
};

export default Collections;