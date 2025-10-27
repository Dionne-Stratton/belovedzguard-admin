import api from "./api.js";

// Get all albums
export const getAlbums = async () => {
  const response = await api.get("/albums");
  return response.data;
};

// Get single album
export const getAlbum = async (id) => {
  const response = await api.get(`/albums/${id}`);
  return response.data;
};

// Create album (Admin only)
export const createAlbum = async (albumData) => {
  const response = await api.post("/albums", albumData);
  return response.data;
};

// Update album (Admin only)
export const updateAlbum = async (id, albumData) => {
  const response = await api.put(`/albums/${id}`, albumData);
  return response.data;
};

// Delete album (Admin only)
export const deleteAlbum = async (id) => {
  const response = await api.delete(`/albums/${id}`);
  return response.data;
};
