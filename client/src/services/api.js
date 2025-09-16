import axios from "axios"

// API Configuration - Fixed for proper connection
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL + "/api" ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000/api"

console.log(" API Base URL:", API_BASE_URL)
console.log(" Environment:", import.meta.env.MODE || "development")

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Added credentials for CORS
})

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pmis-auth-token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(" API Request:", config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error(" API Request Error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(" API Response:", response.status, response.config.url)
    return response
  },
  (error) => {
    console.error(" API Response Error:", error.response?.status, error.config?.url, error.message)

    if (error.response?.status === 401) {
      localStorage.removeItem("pmis-auth-token")
      window.location.href = "/login"
    }

    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      console.error(" Backend connection failed. Make sure the server is running on port 4000")
    }

    return Promise.reject(error)
  },
)

export const testConnection = async () => {
  try {
    console.log(" Testing backend connection to:", API_BASE_URL)
    const response = await api.get("/test")
    console.log(" Backend connection test successful:", response.data)
    return {
      success: true,
      data: response.data,
      status: response.status,
      url: API_BASE_URL,
    }
  } catch (error) {
    console.error(" Backend connection test failed:", error.message)
    const errorInfo = {
      success: false,
      error: error.message,
      code: error.code,
      status: error.response?.status,
      url: API_BASE_URL,
      details: error.response?.data || "No additional details",
    }
    console.error(" Error details:", errorInfo)
    throw errorInfo
  }
}

// API Services
// Add these to your existing authAPI object
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh"),
};


export const candidatesAPI = {
  getProfile: () => api.get("/candidates/profile"),
  updateProfile: (data) => api.put("/candidates/profile", data),
  uploadResume: (formData) =>
    api.post("/candidates/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getApplications: () => api.get("/candidates/applications"),
  applyToInternship: (internshipId, data) => api.post(`/candidates/apply/${internshipId}`, data),
}

export const internshipsAPI = {
  getAll: (params) => api.get("/internships", { params }),
  getById: (id) => api.get(`/internships/${id}`),
  search: (query) => api.get("/internships/search", { params: query }),
  getCategories: () => api.get("/internships/categories"),
}

export const recommendationsAPI = {
  getRecommendations: (candidateId) => api.get(`/recommendations/${candidateId}`),
  getBatchRecommendations: (candidateIds) => api.post("/recommendations/batch", { candidateIds }),
  getAnalytics: () => api.get("/recommendations/analytics"),
}

export const applicationsAPI = {
  getAll: (params) => api.get("/applications", { params }),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, status, feedback) => api.put(`/applications/${id}/status`, { status, feedback }),
  bulkUpdate: (updates) => api.put("/applications/bulk-update", { updates }),
}

export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  getPreferences: () => api.get("/notifications/preferences"),
  updatePreferences: (preferences) => api.put("/notifications/preferences", preferences),
}

export const mlAPI = {
  trainModel: (modelType) => api.post(`/ml/train/${modelType}`),
  getModelStatus: () => api.get("/ml/status"),
  getPredictions: (data) => api.post("/ml/predict", data),
  getModelMetrics: () => api.get("/ml/metrics"),
}

export default api
