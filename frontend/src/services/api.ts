import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Interface to manage the queue of requests that failed while the token was refreshing
interface FailedRequest {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}

let isRefreshing = false;
let failedRequestsQueue: FailedRequest[] = [];

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create the axios instance for the api
export const api = axios.create({
  baseURL,
});

// Ensures the current access token is sent with every call
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@MyClub:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handles token expiration and automatic refreshing
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 (Unauthorized), attempt to refresh the token
    if (error.response?.status === 401 && !originalConfig._retry) {
      // If a refresh is already in progress, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      }

      // Mark request as a retry to avoid infinite loops
      originalConfig._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('@MyClub:refreshToken');

        // Direct axios call to avoid the interceptor logic for the refresh itself
        const response = await axios.post(`${baseURL}/users/refresh`, {
          refreshToken,
        });

        const { token } = response.data;

        // Update local storage with the new access token
        localStorage.setItem('@MyClub:token', token);

        // Update the default authorization header for the current instance
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Process all queued requests with the new token
        failedRequestsQueue.forEach((request) => request.onSuccess(token));
        failedRequestsQueue = [];

        // Retry the original request that triggered the 401
        return api(originalConfig);
      } catch (refreshError) {
        failedRequestsQueue.forEach((request) =>
          request.onFailure(refreshError as AxiosError),
        );
        failedRequestsQueue = [];

        localStorage.removeItem('@MyClub:token');
        localStorage.removeItem('@MyClub:refreshToken');
        localStorage.removeItem('@MyClub:user');

        if (typeof window !== 'undefined') {
          // Isso permite que o AuthProvider escute e limpe o estado do React
          window.dispatchEvent(new Event('logout'));
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
