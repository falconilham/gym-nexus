/**
 * API Configuration Utility
 *
 * Centralized API URL management for local and production environments.
 * This utility automatically selects the correct API URL based on the environment.
 */

// Get the API URL from environment variables with fallback
const getApiUrl = () => {
  // First, try to get from environment variable
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envApiUrl) {
    return envApiUrl;
  }

  // Fallback based on __DEV__ flag
  if (__DEV__) {
    // Development fallback
    return 'http://localhost:5000/api/client';
  } else {
    // Production fallback - update this with your production URL
    return 'https://gym-nexus-backend-production.up.railway.app/api/client';
  }
};

// Export the API URL
export const API_URL = getApiUrl();

// Export environment info
export const IS_DEV = __DEV__;
export const APP_ENV = process.env.EXPO_PUBLIC_ENV || (__DEV__ ? 'development' : 'production');

// API Endpoints helper
export const API_ENDPOINTS = {
  // Auth
  login: `${API_URL}/login`,
  forgotPassword: `${API_URL}/forgot-password`,

  // Dashboard
  dashboard: (userId, membershipId) => `${API_URL}/dashboard/${userId}/${membershipId}`,

  // QR Code
  qr: (userId, membershipId, timestamp) => `${API_URL}/qr/${userId}/${membershipId}?t=${timestamp}`,

  // Check-in/Check-out (admin endpoint but accessible for client checkout)
  checkIn: `${API_URL.replace('/api/client', '/api/admin')}/check-in`,

  // Classes
  classes: `${API_URL}/classes`,
  bookClass: `${API_URL}/book-class`,

  // Trainers
  trainers: `${API_URL}/trainers`,
  bookTrainer: `${API_URL}/book-trainer`,
  specialties: `${API_URL}/specialties`,

  // Config
  config: `${API_URL}/config`,

  // Profile
  updateProfile: userId => `${API_URL}/profile/${userId}`,
};

// Log the current API URL in development
if (__DEV__) {
  console.log('🌐 API Configuration:');
  console.log('  Environment:', APP_ENV);
  console.log('  API URL:', API_URL);
}

export default {
  API_URL,
  IS_DEV,
  APP_ENV,
  API_ENDPOINTS,
};
