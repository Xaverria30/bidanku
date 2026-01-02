/**
 * API Service - Base API configuration and utilities
 * Provides centralized API configuration and request handling
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bidanku.site/api';

/**
 * Mengambil token autentikasi dari localStorage atau sessionStorage
 * @returns {string|null} Token JWT
 */
export const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

/**
 * Menyimpan token autentikasi di penyimpanan
 * @param {string} token - Token JWT
 * @param {boolean} remember - Jika true, gunakan localStorage (permanen). Jika false, gunakan sessionStorage (hanya sesi ini).
 */
export const setToken = (token, remember = true) => {
  if (remember) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token'); // Hapus dari penyimpanan lain
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token'); // Hapus dari penyimpanan lain
  }
};

/**
 * Menghapus token autentikasi dari semua penyimpanan
 */
export const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

/**
 * Mengambil data pengguna dari localStorage atau sessionStorage
 * @returns {object|null} Data pengguna
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Menyimpan data pengguna di penyimpanan
 * @param {object} user - Data pengguna
 * @param {boolean} remember - Jika true, gunakan localStorage. Jika false, gunakan sessionStorage.
 */
export const setStoredUser = (user, remember = true) => {
  const userStr = JSON.stringify(user);
  if (remember) {
    localStorage.setItem('user', userStr);
    sessionStorage.removeItem('user');
  } else {
    sessionStorage.setItem('user', userStr);
    localStorage.removeItem('user');
  }
};

/**
 * Menghapus data pengguna dari semua penyimpanan
 */
export const removeStoredUser = () => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};

/**
 * Membersihkan semua data autentikasi
 */
export const clearAuth = () => {
  removeToken();
  removeStoredUser();
};

/**
 * Build headers for API requests
 * @param {boolean} withAuth - Include authorization header
 * @returns {object} Headers object
 */
const buildHeaders = (withAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (withAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @param {string} endpoint - API endpoint (for error handling logic)
 * @returns {Promise<object>} Parsed response data
 */
const handleResponse = async (response, endpoint = '') => {
  const data = await response.json();

  if (!response.ok) {
    // Handle specific error codes
    if (response.status === 401) {
      // For password change endpoint, just throw error without redirect
      if (!endpoint.includes('/auth/me') && !endpoint.includes('/auth/login')) {
        clearAuth();
        window.location.href = '/';
      }
    }

    // Build error message including validation details if available
    let errorMessage = data.message || 'Terjadi kesalahan';
    if (data.errors) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        // For validation errors (Array), include first field error
        const firstError = data.errors[0];
        if (firstError.message) {
          errorMessage = firstError.message;
        }
      } else if (typeof data.errors === 'object' && data.errors.message) {
        // For server errors (Object), use the inner message
        errorMessage = data.errors.message;
      }
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    error.validationErrors = data.errors;
    throw error;
  }

  return data;
};

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options
 * @returns {Promise<object>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    withAuth = true,
    headers: customHeaders = {},
  } = options;

  const config = {
    method,
    headers: {
      ...buildHeaders(withAuth),
      ...customHeaders,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await handleResponse(response, endpoint);
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

/**
 * Download file from API
 * @param {string} endpoint - API endpoint
 * @param {string} filename - Filename for download
 * @returns {Promise<void>}
 */
export const downloadFile = async (endpoint, filename) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = new Error('Gagal mendownload file');
    error.status = response.status;
    throw error;
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default {
  apiRequest,
  downloadFile,
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAuth,
};
