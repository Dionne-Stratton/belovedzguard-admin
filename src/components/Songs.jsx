import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useToast } from "../context/ToastContext.jsx";
import {
  getSongs,
  createSong,
  updateSong,
  deleteSong,
} from "../services/songsAPI.js";
import { presignUpload } from "../services/uploadsAPI.js";
import GenreFilter from "./GenreFilter.jsx";
import "./Songs.css";

const assetConfigs = [
  {
    id: "mp3",
    label: "MP3 Audio",
    description: "Upload the mastered MP3 file for this song.",
    accept: ".mp3,audio/mpeg",
    allowedExtensions: [".mp3"],
  },
  {
    id: "songThumbnail",
    label: "Song Thumbnail (Image)",
    description: "Static cover image shown in listings. JPG or PNG.",
    accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
    allowedExtensions: [".jpg", ".jpeg", ".png"],
  },
  {
    id: "animatedThumbnail",
    label: "Animated Song Thumbnail (Video)",
    description: "Optional animated preview clip. MP4, WEBM, or GIF.",
    accept: ".mp4,.webm,.gif,video/mp4,video/webm,image/gif",
    allowedExtensions: [".mp4", ".webm", ".gif"],
  },
  {
    id: "videoThumbnail",
    label: "Video Thumbnail (Image)",
    description: "Thumbnail used for embedded video players. JPG or PNG.",
    accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
    allowedExtensions: [".jpg", ".jpeg", ".png"],
  },
  {
    id: "lyrics",
    label: "Lyrics File",
    description: "Optional lyrics file. TXT, MD, or PDF.",
    accept: ".txt,.md,.pdf,text/plain,text/markdown,application/pdf",
    allowedExtensions: [".txt", ".md", ".pdf"],
  },
];

const getInitialAssetUploads = () =>
  assetConfigs.reduce((acc, asset) => {
    acc[asset.id] = {
      uploading: false,
      progress: 0,
      error: null,
      success: false,
      fileName: "",
      key: "",
      publicUrl: "",
      field: null,
    };
    return acc;
  }, {});

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
  const [assetUploads, setAssetUploads] = useState(getInitialAssetUploads());
  const [pendingAssets, setPendingAssets] = useState({});

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

      if (Object.keys(pendingAssets).length > 0) {
        songData.assets = pendingAssets;
      }

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
    if (isUploadingAssets) {
      showToast("Please wait for uploads to finish before saving.", "info");
      return;
    }
    await saveSong(false);
  };

  const handleSaveDraft = async () => {
    if (isSubmitting || isUploadingAssets) {
      showToast("Hold on—uploads are still running.", "info");
      return;
    }
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
    setPendingAssets({});
    setAssetUploads(getInitialAssetUploads());
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
    setPendingAssets({});
    setAssetUploads(getInitialAssetUploads());
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

  const slugifyFileName = (fileName) => {
    if (!fileName) return "";
    const lastDotIndex = fileName.lastIndexOf(".");
    const baseName =
      lastDotIndex >= 0 ? fileName.slice(0, lastDotIndex) : fileName;
    const extension =
      lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";

    const slug = baseName
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    const safeSlug = slug || "upload";
    return `${safeSlug}${extension}`;
  };

  const validateExtension = (assetConfig, extension) => {
    if (!extension) return false;
    return assetConfig.allowedExtensions.includes(extension.toLowerCase());
  };

  const handleAssetUpload = async (assetConfig, file) => {
    if (!file) return;

    const extension = (() => {
      const dotIndex = file.name.lastIndexOf(".");
      return dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : "";
    })();

    if (
      assetConfig.allowedExtensions.length > 0 &&
      !validateExtension(assetConfig, extension)
    ) {
      setAssetUploads((prev) => ({
        ...prev,
        [assetConfig.id]: {
          ...prev[assetConfig.id],
          error: `Invalid file type. Allowed: ${assetConfig.allowedExtensions.join(", ")}`,
          uploading: false,
          success: false,
        },
      }));
      showToast(
        `Please upload a supported ${assetConfig.label.toLowerCase()}.`,
        "error"
      );
      return;
    }

    const normalizedFileName = slugifyFileName(file.name);

    setAssetUploads((prev) => ({
      ...prev,
      [assetConfig.id]: {
        ...prev[assetConfig.id],
        uploading: true,
        progress: 0,
        error: null,
        success: false,
        fileName: normalizedFileName,
        field: null,
      },
    }));

    try {
      const presignData = await presignUpload(
        assetConfig.id,
        normalizedFileName
      );

      const uploadField = presignData.field || assetConfig.id;

      await axios.put(presignData.uploadUrl, file, {
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          setAssetUploads((prev) => ({
            ...prev,
            [assetConfig.id]: {
              ...prev[assetConfig.id],
              progress: percent,
            },
          }));
        },
      });

      setAssetUploads((prev) => ({
        ...prev,
        [assetConfig.id]: {
          ...prev[assetConfig.id],
          uploading: false,
          progress: 100,
          error: null,
          success: true,
          key: presignData.key,
          publicUrl: presignData.publicUrl,
          field: uploadField,
        },
      }));

      setPendingAssets((prev) => ({
        ...prev,
        [uploadField]: {
          key: presignData.key,
          publicUrl: presignData.publicUrl,
        },
      }));

      showToast(`${assetConfig.label} uploaded successfully.`, "success");
    } catch (error) {
      console.error("Error uploading asset:", error);
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Upload failed. Please try again.";

      setAssetUploads((prev) => ({
        ...prev,
        [assetConfig.id]: {
          ...prev[assetConfig.id],
          uploading: false,
          progress: 0,
          error: message,
          success: false,
          field: null,
        },
      }));

      showToast(message, "error");
    }
  };

  const handleAssetClear = (assetId) => {
    const fieldName = assetUploads[assetId]?.field || assetId;

    setAssetUploads((prev) => ({
      ...prev,
      [assetId]: {
        ...getInitialAssetUploads()[assetId],
      },
    }));
    setPendingAssets((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const isUploadingAssets = Object.values(assetUploads).some(
    (asset) => asset.uploading
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

          <div className="asset-section">
            <h3>Media Assets</h3>
            <p className="form-help">
              Upload only the files you want to replace. Existing media stays in
              place unless you upload a new file.
            </p>

            {assetConfigs.map((asset) => {
              const uploadState = assetUploads[asset.id];
              return (
                <div className="form-group asset-upload" key={asset.id}>
                  <label>{asset.label}</label>
                  <input
                    type="file"
                    accept={asset.accept}
                    onChange={(e) =>
                      handleAssetUpload(asset, e.target.files?.[0] || null)
                    }
                    disabled={uploadState.uploading || isSubmitting}
                  />
                  <p className="form-help-text">{asset.description}</p>

                  {editingSong && editingSong[asset.id] && (
                    <p className="current-asset">
                      Current:{" "}
                      <a
                        href={editingSong[asset.id]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View file
                      </a>
                    </p>
                  )}

                  {uploadState.uploading && (
                    <p className="upload-status">
                      Uploading...{" "}
                      <span className="upload-progress">
                        {uploadState.progress}%
                      </span>
                    </p>
                  )}

                  {uploadState.success && (
                    <p className="upload-status success">
                      Uploaded:{" "}
                      <a
                        href={uploadState.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {uploadState.fileName}
                      </a>
                      <button
                        type="button"
                        className="btn btn-sm btn-remove-upload"
                        onClick={() => handleAssetClear(asset.id)}
                        disabled={isSubmitting}
                      >
                        Clear
                      </button>
                    </p>
                  )}

                  {uploadState.error && (
                    <p className="upload-status error">{uploadState.error}</p>
                  )}
                </div>
              );
            })}
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
              disabled={isSubmitting || isUploadingAssets}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting || isUploadingAssets}
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
              disabled={isSubmitting || isUploadingAssets}
            >
              Cancel
            </button>
          </div>
          {isUploadingAssets && (
            <p className="upload-warning">
              Please wait for uploads to finish before saving changes.
            </p>
          )}
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
