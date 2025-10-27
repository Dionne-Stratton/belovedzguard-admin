import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "../context/ToastContext.jsx";
import {
  getAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "../services/albumsAPI.js";
import { getSongs } from "../services/songsAPI.js";
import "./Albums.css";

function Albums() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const { showToast } = useToast();
  const [albums, setAlbums] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadAlbums();
      loadAllSongs();
    }
  }, [isAuthenticated, authLoading]);

  const loadAllSongs = async () => {
    try {
      const data = await getSongs();
      setAllSongs(data);
    } catch (error) {
      console.error("Error loading songs:", error);
    }
  };

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await getAlbums();
      setAlbums(data);
    } catch (error) {
      showToast("Error loading albums: " + error.message, "error");
      console.error("Error loading albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Only send user-input fields, exclude auto-generated fields (_id, createdAt, updatedAt)
      const albumData = {
        title: formData.title,
        songs: selectedSongs,
      };

      if (editingAlbum) {
        await updateAlbum(editingAlbum._id, albumData);
      } else {
        await createAlbum(albumData);
      }
      await loadAlbums();
      resetForm();
      showToast(
        editingAlbum
          ? "Album updated successfully"
          : "Album created successfully",
        "success"
      );
    } catch (error) {
      showToast("Error saving album: " + error.message, "error");
      console.error("Error saving album:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this album?")) return;
    try {
      await deleteAlbum(id);
      await loadAlbums();
      showToast("Album deleted successfully", "success");
    } catch (error) {
      showToast("Error deleting album: " + error.message, "error");
      console.error("Error deleting album:", error);
    }
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title || "",
    });
    // Extract song IDs from the album's songs (which are full objects)
    const songIds = Array.isArray(album.songs)
      ? album.songs.map((song) => (typeof song === "object" ? song._id : song))
      : [];
    setSelectedSongs(songIds);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddSong = (songId) => {
    if (!selectedSongs.includes(songId)) {
      setSelectedSongs([...selectedSongs, songId]);
    }
  };

  const handleRemoveSong = (songId) => {
    setSelectedSongs(selectedSongs.filter((id) => id !== songId));
  };

  const handleMoveSongUp = (index) => {
    if (index > 0) {
      const newSongs = [...selectedSongs];
      [newSongs[index - 1], newSongs[index]] = [
        newSongs[index],
        newSongs[index - 1],
      ];
      setSelectedSongs(newSongs);
    }
  };

  const handleMoveSongDown = (index) => {
    if (index < selectedSongs.length - 1) {
      const newSongs = [...selectedSongs];
      [newSongs[index], newSongs[index + 1]] = [
        newSongs[index + 1],
        newSongs[index],
      ];
      setSelectedSongs(newSongs);
    }
  };

  const getSongById = (songId) => {
    return allSongs.find((song) => song._id === songId);
  };

  const resetForm = () => {
    setFormData({
      title: "",
    });
    setSelectedSongs([]);
    setEditingAlbum(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading albums...</div>;
  }

  return (
    <div className="albums-container">
      <div className="header">
        <h1>Albums Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? "Cancel" : "+ Add Album"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="album-form">
          <h2>{editingAlbum ? "Edit Album" : "Create New Album"}</h2>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="songs-selection">
            <div className="available-songs">
              <h3>Available Songs</h3>
              <input
                type="text"
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{ marginBottom: "1rem" }}
              />
              <ul className="song-list">
                {allSongs
                  .filter(
                    (song) =>
                      !selectedSongs.includes(song._id) &&
                      song.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((song) => (
                    <li key={song._id} className="song-item">
                      <span>{song.title}</span>
                      <button
                        type="button"
                        onClick={() => handleAddSong(song._id)}
                        className="btn btn-sm btn-add"
                      >
                        +
                      </button>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="selected-songs">
              <h3>Songs in Album</h3>
              {selectedSongs.length === 0 ? (
                <p className="empty-state">No songs selected</p>
              ) : (
                <ul className="song-list">
                  {selectedSongs.map((songId, index) => {
                    const song = getSongById(songId);
                    return song ? (
                      <li key={songId} className="song-item selected">
                        <div className="song-controls">
                          <button
                            type="button"
                            onClick={() => handleMoveSongUp(index)}
                            className="btn btn-sm btn-move"
                            disabled={index === 0}
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSongDown(index)}
                            className="btn btn-sm btn-move"
                            disabled={index === selectedSongs.length - 1}
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                        <span>{song.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSong(songId)}
                          className="btn btn-sm btn-remove"
                        >
                          ×
                        </button>
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editingAlbum
                  ? "Update Album"
                  : "Create Album"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="albums-list">
        {albums.length === 0 ? (
          <p className="empty-state">
            No albums found. Create your first album!
          </p>
        ) : (
          <div className="albums-grid">
            {albums.map((album) => (
              <div key={album._id} className="album-card">
                <h3>{album.title}</h3>
                <p className="album-meta">
                  Created: {new Date(album.createdAt).toLocaleDateString()}
                </p>
                {Array.isArray(album.songs) && album.songs.length > 0 && (
                  <div className="album-songs-preview">
                    <p className="album-meta">Songs: {album.songs.length}</p>
                    <ul className="album-songs-list">
                      {album.songs.slice(0, 5).map((song, index) => {
                        // songs can be either objects (from API) or IDs (legacy)
                        const songData =
                          typeof song === "object" ? song : getSongById(song);
                        const songId =
                          typeof song === "object" ? song._id : song;
                        return songData ? (
                          <li key={songId || index} className="album-song-item">
                            {songData.title}
                          </li>
                        ) : (
                          <li key={songId || index} className="album-song-item">
                            Unknown Song
                          </li>
                        );
                      })}
                      {album.songs.length > 5 && (
                        <li className="album-song-item more">
                          ...and {album.songs.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                <div className="album-actions">
                  <button
                    onClick={() => handleEdit(album)}
                    className="btn btn-sm btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(album._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Albums;
