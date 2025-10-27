import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "../services/albumsAPI.js";
import "./Albums.css";

function Albums() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    songs: "",
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadAlbums();
    }
  }, [isAuthenticated, authLoading]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await getAlbums();
      setAlbums(data);
    } catch (error) {
      console.error("Error loading albums:", error);
      console.error("Error loading albums: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send user-input fields, exclude auto-generated fields (_id, createdAt, updatedAt)
      const albumData = {
        title: formData.title,
        songs: formData.songs
          ? formData.songs
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [],
      };

      if (editingAlbum) {
        await updateAlbum(editingAlbum._id, albumData);
      } else {
        await createAlbum(albumData);
      }
      await loadAlbums();
      resetForm();
      console.log(
        editingAlbum
          ? "Album updated successfully"
          : "Album created successfully"
      );
    } catch (error) {
      console.error("Error saving album:", error);
      console.error("Error saving album: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this album?")) return;
    try {
      await deleteAlbum(id);
      await loadAlbums();
      console.log("Album deleted successfully");
    } catch (error) {
      console.error("Error deleting album:", error);
      console.error("Error deleting album: " + error.message);
    }
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title || "",
      songs: Array.isArray(album.songs) ? album.songs.join(", ") : "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      songs: "",
    });
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

          <div className="form-group">
            <label>Songs (comma-separated IDs)</label>
            <input
              type="text"
              value={formData.songs}
              onChange={(e) =>
                setFormData({ ...formData, songs: e.target.value })
              }
              placeholder="song_id_1, song_id_2, song_id_3"
            />
            <small className="form-help">
              Enter song IDs separated by commas
            </small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingAlbum ? "Update Album" : "Create Album"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
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
                  Songs: {Array.isArray(album.songs) ? album.songs.length : 0}
                </p>
                <p className="album-meta">
                  Created: {new Date(album.createdAt).toLocaleDateString()}
                </p>
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
