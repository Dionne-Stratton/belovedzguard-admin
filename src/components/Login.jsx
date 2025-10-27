import { useAuth0 } from "@auth0/auth0-react";
import "./Login.css";

function Login() {
  const { loginWithPopup, isAuthenticated, isLoading, user, logout } =
    useAuth0();

  if (isLoading) {
    return (
      <div className="auth-status">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="auth-status authenticated">
        <div className="user-info">
          <span className="user-icon">👤</span>
          <div className="user-details">
            <strong>{user?.name || user?.email}</strong>
            {user?.email && <small>{user.email}</small>}
          </div>
        </div>
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          className="btn btn-sm btn-danger"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="auth-status not-authenticated">
      <p>⚠️ Please sign in to manage content</p>
      <button onClick={() => loginWithPopup()} className="btn btn-primary">
        Sign In with Auth0
      </button>
    </div>
  );
}

export default Login;
