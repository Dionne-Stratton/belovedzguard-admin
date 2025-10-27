import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

// This needs to be set from a component that has Auth0 context
let getAccessToken = null;

export const setAuth0Getter = (tokenGetter) => {
  getAccessToken = tokenGetter;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    if (getAccessToken) {
      try {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error getting token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
