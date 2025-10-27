import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { getSongs } from "../services/songsAPI.js";
import { getAlbums } from "../services/albumsAPI.js";
import "./Dashboard.css";

function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const [stats, setStats] = useState({ songs: 0, albums: 0 });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadStats();
    }
  }, [isAuthenticated, authLoading]);

  const loadStats = async () => {
    try {
      const [songs, albums] = await Promise.all([
        getSongs(),
        getAlbums(),
      ]);
      setStats({ songs: songs.length, albums: albums.length });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  return (
    <div className="dashboard">
      <h1>BelovedZGuard Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎵</div>
          <div className="stat-info">
            <h2>{stats.songs}</h2>
            <p>Total Songs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💿</div>
          <div className="stat-info">
            <h2>{stats.albums}</h2>
            <p>Total Albums</p>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        <Link to="/songs" className="dashboard-card">
          <div className="card-icon">🎵</div>
          <h2>Songs</h2>
          <p>Manage songs, genres, and media files</p>
        </Link>

        <Link to="/albums" className="dashboard-card">
          <div className="card-icon">💿</div>
          <h2>Albums</h2>
          <p>Manage albums and collections</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
