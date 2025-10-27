import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getSongs,
  createSong,
  updateSong,
  deleteSong,
} from "../services/songsAPI.js";
import "./Songs.css";

function Songs() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    description: "",
    verse: "",
    mp3: "",
    songThumbnail: "",
    animatedSongThumbnail: "",
    videoThumbnail: "",
    youTube: "",
    lyrics: "",
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
      // Only send user-input fields, exclude auto-generated fields (_id, createdAt, updatedAt)
      const songData = {
        title: formData.title,
        genre: formData.genre,
        description: formData.description,
        verse: formData.verse,
        mp3: formData.mp3,
        songThumbnail: formData.songThumbnail,
        animatedSongThumbnail: formData.animatedSongThumbnail,
        videoThumbnail: formData.videoThumbnail,
        youTube: formData.youTube,
        lyrics: formData.lyrics,
      };

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
      mp3: song.mp3 || "",
      songThumbnail: song.songThumbnail || "",
      animatedSongThumbnail: song.animatedSongThumbnail || "",
      videoThumbnail: song.videoThumbnail || "",
      youTube: song.youTube || "",
      lyrics: song.lyrics || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      genre: "",
      description: "",
      verse: "",
      mp3: "",
      songThumbnail: "",
      animatedSongThumbnail: "",
      videoThumbnail: "",
      youTube: "",
      lyrics: "",
    });
    setEditingSong(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">Loading songs...</div>;
  }

  return (
    <div className="songs-container">
      <div className="header">
        <h1>Songs Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? "Cancel" : "+ Add Song"}
        </button>
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
            <input
              type="text"
              value={formData.genre}
              onChange={(e) =>
                setFormData({ ...formData, genre: e.target.value })
              }
              required
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
            <label>MP3 URL</label>
            <input
              type="url"
              value={formData.mp3}
              onChange={(e) =>
                setFormData({ ...formData, mp3: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Song Thumbnail</label>
            <input
              type="url"
              value={formData.songThumbnail}
              onChange={(e) =>
                setFormData({ ...formData, songThumbnail: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Animated Thumbnail</label>
            <input
              type="url"
              value={formData.animatedSongThumbnail}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  animatedSongThumbnail: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Video Thumbnail</label>
            <input
              type="url"
              value={formData.videoThumbnail}
              onChange={(e) =>
                setFormData({ ...formData, videoThumbnail: e.target.value })
              }
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

          <div className="form-group">
            <label>Lyrics URL</label>
            <input
              type="url"
              value={formData.lyrics}
              onChange={(e) =>
                setFormData({ ...formData, lyrics: e.target.value })
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
        {songs.length === 0 ? (
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
              {songs.map((song) => (
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
