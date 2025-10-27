import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getSongs,
  createSong,
  updateSong,
  deleteSong,
} from "../services/songsAPI.js";
import GenreFilter from "./GenreFilter.jsx";
import "./Songs.css";

function Songs() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    genre: "All",
    description: "",
    verse: "",
    youTube: "",
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadSongs();
    }
  }, [isAuthenticated, authLoading]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const data = await getSongs();
      setSongs(data);
    } catch (error) {
      console.error("Error loading songs:", error);
      console.error("Error loading songs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send user-input fields, exclude auto-generated fields
      const songData = {
        title: formData.title,
        genre: formData.genre,
        description: formData.description,
        verse: formData.verse,
        youTube: formData.youTube,
      };

      console.log("Submitting song data:", songData);

      if (editingSong) {
        await updateSong(editingSong._id, songData);
      } else {
        await createSong(songData);
      }
      await loadSongs();
      resetForm();
      console.log(
        editingSong ? "Song updated successfully" : "Song created successfully"
      );
    } catch (error) {
      console.error("Error saving song:", error);
      console.error("Error saving song: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this song?")) return;
    try {
      await deleteSong(id);
      await loadSongs();
      console.log("Song deleted successfully");
    } catch (error) {
      console.error("Error deleting song:", error);
      console.error("Error deleting song: " + error.message);
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title || "",
      genre: song.genre || "",
      description: song.description || "",
      verse: song.verse || "",
      youTube: song.youTube || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      genre: "All",
      description: "",
      verse: "",
      youTube: "",
    });
    setEditingSong(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading songs...</div>;
  }

  // Filter songs based on search term
  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="songs-container">
      <div className="header">
        <h1>Songs Management</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "+ Add Song"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="song-form">
          <h2>{editingSong ? "Edit Song" : "Create New Song"}</h2>

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
            <label>Genre *</label>
            <GenreFilter
              value={formData.genre}
              onChange={(value) => setFormData({ ...formData, genre: value })}
              ariaLabel="Select song genre"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Verse</label>
            <textarea
              value={formData.verse}
              onChange={(e) =>
                setFormData({ ...formData, verse: e.target.value })
              }
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>YouTube URL</label>
            <input
              type="url"
              value={formData.youTube}
              onChange={(e) =>
                setFormData({ ...formData, youTube: e.target.value })
              }
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              {editingSong ? "Update Song" : "Create Song"}
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

      <div className="songs-list">
        {filteredSongs.length === 0 ? (
          <p className="empty-state">No songs found. Create your first song!</p>
        ) : (
          <table className="songs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSongs.map((song) => (
                <tr key={song._id}>
                  <td>{song.title}</td>
                  <td>{song.genre}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(song)}
                      className="btn btn-sm btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(song._id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Songs;
