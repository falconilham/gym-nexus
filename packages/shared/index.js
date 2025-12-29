/**
 * Shared utilities for GymNexus
 * 
 * This package contains shared code that can be used across
 * the client, admin, and backend workspaces.
 */

// Example: Shared constants
export const API_VERSION = 'v1';

// Example: Shared utility functions
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Example: Shared validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Example: Shared types/constants
export const USER_ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  MEMBER: 'member',
};

export default {
  API_VERSION,
  formatCurrency,
  validateEmail,
  USER_ROLES,
};
