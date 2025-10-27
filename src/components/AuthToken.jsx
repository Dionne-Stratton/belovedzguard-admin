import { useState, useEffect } from "react";
import { setAuthToken, getAuthToken, clearAuthToken } from "../config/api.js";
import "./AuthToken.css";

function AuthToken() {
  const [token, setToken] = useState(getAuthToken());
  const [showInput, setShowInput] = useState(!token);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    // Listen for token expiration events
    const handleTokenExpired = () => {
      setTokenExpired(true);
      setShowInput(true);
      setToken("");
      console.log(
        "Your authentication token has expired. Please enter a new token."
      );
    };

    window.addEventListener("tokenExpired", handleTokenExpired);

    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
    };
  }, []);

  const handleSave = () => {
    const input = document.getElementById("token-input");
    if (input && input.value.trim()) {
      setAuthToken(input.value.trim());
      setToken(input.value.trim());
      setShowInput(false);
      setTokenExpired(false);
      console.log("Token saved successfully!");
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the auth token?")) {
      clearAuthToken();
      setToken("");
      setShowInput(true);
      setTokenExpired(false);
      console.log("Token cleared successfully!");
    }
  };

  return (
    <div className="auth-token-container">
      {tokenExpired && (
        <div className="token-expired-warning">
          ⚠ Your token has expired. Please enter a new one.
        </div>
      )}
      {token ? (
        <div className="token-display">
          <span className="token-status">✓ Token configured</span>
          <button
            onClick={() => setShowInput(!showInput)}
            className="btn btn-sm btn-secondary"
          >
            {showInput ? "Cancel" : "Change Token"}
          </button>
          <button onClick={handleClear} className="btn btn-sm btn-danger">
            Clear Token
          </button>
        </div>
      ) : (
        <div className="token-warning">⚠ No authentication token set</div>
      )}

      {showInput && (
        <div className="token-input-container">
          <label htmlFor="token-input">Auth0 JWT Token:</label>
          <div className="token-input-group">
            <input
              id="token-input"
              type="password"
              placeholder="Enter your Auth0 JWT token"
              defaultValue={token}
            />
            <button onClick={handleSave} className="btn btn-success">
              Save
            </button>
          </div>
          <small className="token-help">
            Get your token from Auth0 authentication. Admin operations require a
            valid JWT token.
          </small>
        </div>
      )}
    </div>
  );
}

export default AuthToken;
