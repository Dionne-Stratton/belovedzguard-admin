import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "../context/ToastContext.jsx";
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
  const { showToast } = useToast();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [formData, setFormData] = useState({
    title: "",
    genre: "All",
    description: "",
    verse: "",
    youTube: "",
    bandcamp: "",
    isDraft: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("published");

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
      showToast("Error loading songs: " + error.message, "error");
      console.error("Error loading songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSong = async (isDraft) => {
    setIsSubmitting(true);
    try {
      // Only send user-input fields, exclude auto-generated fields
      const songData = {
        title: formData.title,
        genre: formData.genre,
        description: formData.description,
        verse: formData.verse,
        youTube: formData.youTube,
      };

      // Only include bandcamp when editing (for existing songs)
      if (editingSong) {
        songData.bandcamp = formData.bandcamp;
      }

      songData.isDraft = !!isDraft;

      console.log("Submitting song data:", songData);

      if (editingSong) {
        await updateSong(editingSong._id, songData);
      } else {
        await createSong(songData);
      }
      await loadSongs();
      setActiveTab(isDraft ? "drafts" : "published");
      resetForm();
      showToast(
        isDraft
          ? editingSong
            ? "Song updated as draft"
            : "Song saved as draft"
          : editingSong
            ? "Song updated successfully"
            : "Song created successfully",
        "success"
      );
    } catch (error) {
      showToast("Error saving song: " + error.message, "error");
      console.error("Error saving song:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSong(false);
  };

  const handleSaveDraft = async () => {
    if (isSubmitting) return;
    await saveSong(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this song?")) return;
    try {
      await deleteSong(id);
      await loadSongs();
      showToast("Song deleted successfully", "success");
    } catch (error) {
      showToast("Error deleting song: " + error.message, "error");
      console.error("Error deleting song:", error);
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
      bandcamp: song.bandcamp || "",
      isDraft: !!song.isDraft,
    });
    setActiveTab(song.isDraft ? "drafts" : "published");
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
      bandcamp: "",
      isDraft: false,
    });
    setEditingSong(null);
    setShowForm(false);
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="loading">Loading songs...</div>;
  }

  // Filter songs based on search term and genre
  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGenre =
      genreFilter === "All" || song.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const tabFilteredSongs = filteredSongs.filter((song) =>
    activeTab === "drafts" ? !!song.isDraft : !song.isDraft
  );

  const emptyStateMessage =
    tabFilteredSongs.length === 0
      ? activeTab === "drafts"
        ? "No draft songs yet. Save a song as draft to see it here."
        : "No songs found. Create your first song!"
      : "";

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
          <GenreFilter
            value={genreFilter}
            onChange={(value) => setGenreFilter(value)}
            ariaLabel="Filter by genre"
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
          {editingSong && (
            <p className="draft-indicator">
              Current status:{" "}
              <span
                className={
                  formData.isDraft ? "status-badge draft" : "status-badge published"
                }
              >
                {formData.isDraft ? "Draft" : "Published"}
              </span>
            </p>
          )}

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

          {editingSong && (
            <div className="form-group">
              <label>Bandcamp URL</label>
              <input
                type="url"
                value={formData.bandcamp}
                onChange={(e) =>
                  setFormData({ ...formData, bandcamp: e.target.value })
                }
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editingSong
                  ? "Update Song"
                  : "Create Song"}
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

      <div className="songs-list">
        <div className="tab-bar" role="tablist" aria-label="Song status filter">
          <button
            className={`tab ${activeTab === "published" ? "active" : ""}`}
            role="tab"
            aria-selected={activeTab === "published"}
            onClick={() => setActiveTab("published")}
          >
            Published
          </button>
          <button
            className={`tab ${activeTab === "drafts" ? "active" : ""}`}
            role="tab"
            aria-selected={activeTab === "drafts"}
            onClick={() => setActiveTab("drafts")}
          >
            Drafts
          </button>
        </div>
        {tabFilteredSongs.length === 0 ? (
          <p className="empty-state">{emptyStateMessage}</p>
        ) : (
          <table className="songs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tabFilteredSongs.map((song) => (
                <tr key={song._id}>
                  <td>{song.title}</td>
                  <td>{song.genre}</td>
                  <td>
                    <span
                      className={
                        song.isDraft ? "status-badge draft" : "status-badge published"
                      }
                    >
                      {song.isDraft ? "Draft" : "Published"}
                    </span>
                  </td>
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
