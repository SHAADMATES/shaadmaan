import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Create custom axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global high-speed in-memory cache engine (60s TTL)
const _apiCache = new Map();
const CACHE_TTL_MS = 60000;

// Export helper to allow clearing cache manually or from SystemHealth
export const clearApiCache = () => _apiCache.clear();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // Configure axios interceptors for auth token, GET caching, and auto-invalidation
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        const activeToken = localStorage.getItem('token');
        if (activeToken) {
          config.headers['Authorization'] = `Bearer ${activeToken}`;
        }

        // Check if GET request exists in hot cache
        if (config.method?.toLowerCase() === 'get' && !config.params?._noCache) {
          const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}_${activeToken}`;
          const cached = _apiCache.get(cacheKey);
          if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            // Return synthetic adapter to serve directly from RAM (<2ms)
            config.adapter = () => Promise.resolve({
              data: cached.data,
              status: 200,
              statusText: 'OK (Cached)',
              headers: cached.headers || {},
              config,
              request: {}
            });
          }
        } else if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
          // Mutating request: invalidate relevant namespace entries in cache
          const urlPrefix = config.url?.split('/')[1] || '';
          for (const key of _apiCache.keys()) {
            if (key.includes(urlPrefix) || key.includes('/stats') || key.includes('/dashboard')) {
              _apiCache.delete(key);
            }
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        const config = response.config;
        if (config.method?.toLowerCase() === 'get' && response.status === 200) {
          const activeToken = localStorage.getItem('token');
          const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}_${activeToken}`;
          _apiCache.set(cacheKey, {
            data: response.data,
            headers: response.headers,
            timestamp: Date.now()
          });
        }
        return response;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load user on startup
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/profile');
        setUser(res.data.user);
        setProfileDetails(res.data.profileDetails);
      } catch (err) {
        console.error('Failed to load user profile on startup', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      
      // Load full profile details
      const profileRes = await api.get('/auth/profile');
      setProfileDetails(profileRes.data.profileDetails);
      
      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: errMsg };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setProfileDetails(null);
  };

  // Update Student Profile
  const updateProfile = async (profileData) => {
    try {
      let endpoint = '';
      if (user?.role === 'student') {
        endpoint = '/student/profile';
      } else {
        return { success: false, error: 'Only student profiles can be updated here.' };
      }

      const res = await api.put(endpoint, profileData);
      setProfileDetails(res.data);
      return { success: true };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update profile.' };
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const value = {
    user,
    profileDetails,
    token,
    loading,
    darkMode,
    login,
    logout,
    updateProfile,
    toggleDarkMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
