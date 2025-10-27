import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>BelovedZGuard Admin Dashboard</h1>
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
