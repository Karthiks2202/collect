import API from "./api";


// Get all collections
export const getCollections = async () => {
  const response = await API.get("/collections/");
  return response.data;
};

// Get single collection
export const getCollection = async (collectionId) => {
  const response = await API.get(`/collections/${collectionId}`);
  return response.data;
};

// Create collection
export const createCollection = async (data) => {
  const response = await API.post("/collections/", data);
  return response.data;
};

// Update collection
export const updateCollection = async (collectionId, data) => {
  const response = await API.put(`/collections/${collectionId}`, data);
  return response.data;
};

// Delete collection
export const deleteCollection = async (collectionId) => {
  const response = await API.delete(`/collections/${collectionId}`);
  return response.data;
};

// Add movie to collection
export const addMovieToCollection = async (collectionId, movie) => {
  const response = await API.post(`/collections/${collectionId}/movies`, movie);
  return response.data;
};

// Remove movie from collection
export const removeMovieFromCollection = async (collectionId, movieId) => {
  const response = await API.delete(`/collections/${collectionId}/movies/${movieId}`);
  return response.data;
};