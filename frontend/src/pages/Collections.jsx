import { useEffect, useState, useCallback } from "react";
import { useToast } from "../context/ToastContext";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../services/collectionService";
import CreateCollectionModal from "../components/CreateCollectionModal";
import ConfirmDialog from "../components/ConfirmDialog";
import CollectionCard from "../components/CollectionCard";

import "./Collection.css";

const Collections = () => {
  const { showToast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
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
      const detail = error.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Operation failed ❌", "error");
    }
  };

  const handleDeleteConfirmed = useCallback(async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await deleteCollection(id);
      showToast("Collection deleted successfully! 🗑️", "success");
      loadCollections();
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to delete collection ❌", "error");
    }
  }, [pendingDeleteId, loadCollections, showToast]);


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
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={handleOpenEditModal}
                onDelete={setPendingDeleteId}
              />
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

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete Collection?"
        message="This will permanently delete the collection and cannot be undone."
        confirmLabel="Delete"
        icon="🗑️"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default Collections;