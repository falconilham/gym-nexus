/**
 * Environment Configuration
 *
 * This file provides easy access to environment variables
 * across the mobile application.
 */

// Note: In React Native/Expo, environment variables need to be accessed differently
// For now, we'll use a simple configuration object
// You can integrate with react-native-dotenv or expo-constants for better env management

const ENV = {
  development: {
    API_URL: 'http://localhost:5000',
    APP_NAME: 'GymNexus (Dev)',
    APP_VERSION: '1.0.0',
  },
  production: {
    API_URL: 'https://gym-nexus-backend-production.up.railway.app',
    APP_NAME: 'GymNexus',
    APP_VERSION: '1.0.0',
  },
};

// Determine current environment
// In Expo, you can use __DEV__ to check if running in development
const getEnvVars = () => {
  if (__DEV__) {
    return ENV.development;
  }
  return ENV.production;
};

const config = getEnvVars();

export default config;

// Export individual values for convenience
export const API_URL = config.API_URL;
export const APP_NAME = config.APP_NAME;
export const APP_VERSION = config.APP_VERSION;

// API endpoints helper
export const API_ENDPOINTS = {
  // Admin endpoints
  admin: {
    trainers: `${API_URL}/api/admin/trainers`,
    members: `${API_URL}/api/admin/members`,
    classes: `${API_URL}/api/admin/classes`,
    equipment: `${API_URL}/api/admin/equipment`,
  },
  // Client endpoints
  client: {
    trainers: `${API_URL}/api/client/trainers`,
    classes: `${API_URL}/api/client/classes`,
    schedule: `${API_URL}/api/client/schedule`,
  },
};

// Usage example:
// import config, { API_URL, API_ENDPOINTS } from './config/env';
//
// fetch(API_ENDPOINTS.client.trainers)
//   .then(response => response.json())
//   .then(data => console.log(data));
