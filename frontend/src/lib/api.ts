import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (refresh) {
          const { data } = await axios.post(
            `${API_URL}/api/v1/auth/refresh`,
            null,
            { params: { refresh_token: refresh } }
          );
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post("/auth/register", data),
  login: (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  me: () => api.get("/auth/me"),
};

// ─── Movies ───────────────────────────────────────────────────────────────────
export const moviesApi = {
  list: (params?: Record<string, any>) => api.get("/movies", { params }),
  getById: (id: string) => api.get(`/movies/${id}`),
  topRated: (limit = 10) => api.get("/movies/top-rated", { params: { limit } }),
  recent: (limit = 10) => api.get("/movies/recent", { params: { limit } }),
  genres: () => api.get("/movies/genres"),
  create: (data: any) => api.post("/movies", data),
  update: (id: string, data: any) => api.patch(`/movies/${id}`, data),
  delete: (id: string) => api.delete(`/movies/${id}`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
  getByMovie: (movieId: string, params?: { page?: number; page_size?: number }) =>
    api.get(`/reviews/movie/${movieId}`, { params }),
  getByUser: (userId: string, params?: { page?: number; page_size?: number }) =>
    api.get(`/reviews/user/${userId}`, { params }),
  getMyReview: (movieId: string) => api.get(`/reviews/movie/${movieId}/my`),
  create: (movieId: string, data: { rating: number; content: string; title?: string; is_spoiler?: boolean }) =>
    api.post(`/reviews/movie/${movieId}`, data),
  update: (reviewId: string, data: any) => api.patch(`/reviews/${reviewId}`, data),
  delete: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
};

// ─── Favorites ────────────────────────────────────────────────────────────────
export const favoritesApi = {
  list: (params?: { page?: number; page_size?: number }) =>
    api.get("/favorites", { params }),
  add: (movieId: string) => api.post(`/favorites/movie/${movieId}`),
  remove: (movieId: string) => api.delete(`/favorites/movie/${movieId}`),
  check: (movieId: string) => api.get(`/favorites/movie/${movieId}/check`),
  watchlist: (params?: { status?: string; page?: number }) =>
    api.get("/favorites/watchlist", { params }),
  addToWatchlist: (movieId: string, status: string) =>
    api.post(`/favorites/watchlist/movie/${movieId}`, { status }),
  removeFromWatchlist: (movieId: string) =>
    api.delete(`/favorites/watchlist/movie/${movieId}`),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  me: () => api.get("/users/me"),
  updateMe: (data: any) => api.patch("/users/me", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/users/me/change-password", data),
  myStats: () => api.get("/users/me/stats"),
  getByUsername: (username: string) => api.get(`/users/${username}`),
  getUserStats: (username: string) => api.get(`/users/${username}/stats`),
};
