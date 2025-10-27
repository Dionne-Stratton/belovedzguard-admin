import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setAuth0Getter } from "../services/api.js";

function AuthWrapper({ children }) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const hasSetGetter = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasSetGetter.current) {
      setAuth0Getter(getAccessTokenSilently);
      hasSetGetter.current = true;
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Also set it on every render to ensure it's always available
  if (isAuthenticated) {
    setAuth0Getter(getAccessTokenSilently);
  }

  return <>{children}</>;
}

export default AuthWrapper;
