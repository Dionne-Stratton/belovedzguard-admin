import { Link, useLocation, Outlet } from "react-router-dom";
import Login from "./Login.jsx";
import "./Layout.css";

function Layout() {
  const location = useLocation();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>BelovedZGuard Admin</h2>
        </div>
        <div className="nav-links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Dashboard
          </Link>
          <Link
            to="/songs"
            className={location.pathname === "/songs" ? "active" : ""}
          >
            Songs
          </Link>
          <Link
            to="/albums"
            className={location.pathname === "/albums" ? "active" : ""}
          >
            Albums
          </Link>
        </div>
      </nav>
      <main className="main-content">
        <div className="content-wrapper">
          <Login />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
