// API Configuration
// IMPORTANT: Update this with your actual Cloudflare Worker URL
export const API_BASE = import.meta.env.VITE_API_BASE || 'https://rednox.ubixsnow08.workers.dev/';

// Optional: Add environment-specific configs
export const CONFIG = {
  apiBase: API_BASE,
  refreshInterval: 30000, // 30 seconds
  environment: import.meta.env.MODE
};
