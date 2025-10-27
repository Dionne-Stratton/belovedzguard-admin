import api from "./api.js";

// Get all songs
export const getSongs = async () => {
  const response = await api.get("/songs");
  return response.data;
};

// Get single song
export const getSong = async (id) => {
  const response = await api.get(`/songs/${id}`);
  return response.data;
};

// Create song (Admin only)
export const createSong = async (songData) => {
  const response = await api.post("/songs", songData);
  return response.data;
};

// Update song (Admin only)
export const updateSong = async (id, songData) => {
  const response = await api.put(`/songs/${id}`, songData);
  return response.data;
};

// Delete song (Admin only)
export const deleteSong = async (id) => {
  const response = await api.delete(`/songs/${id}`);
  return response.data;
};
