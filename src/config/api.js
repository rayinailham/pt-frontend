// API Configuration
export const API_CONFIG = {
  // API Gateway URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

  // Notification Service URL
  NOTIFICATION_URL: import.meta.env.VITE_NOTIFICATION_URL || 'http://localhost:3005',

  // Request timeout
  TIMEOUT: 30000,

  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Gateway info
  GATEWAY_INFO: '/api',

  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    UPDATE_PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    DELETE_ACCOUNT: '/api/auth/account',
    LOGOUT: '/api/auth/logout',
    TOKEN_BALANCE: '/api/auth/token-balance',
  },

  // Assessment endpoints
  ASSESSMENT: {
    SUBMIT: '/api/assessment/submit',
    STATUS: (jobId) => `/api/assessment/status/${jobId}`,
  },

  // Archive endpoints
  ARCHIVE: {
    RESULTS: '/api/archive/results',
    RESULT_BY_ID: (id) => `/api/archive/results/${id}`,
    UPDATE_RESULT: (id) => `/api/archive/results/${id}`,
    DELETE_RESULT: (id) => `/api/archive/results/${id}`,
    STATS: '/api/archive/stats',
    STATS_OVERVIEW: '/api/archive/stats/overview',
    JOBS: '/api/archive/jobs', // New endpoint for jobs with archetype data
    // JOBS endpoint deprecated - use RESULTS instead
  },

  // Chatbot endpoints
  CHATBOT: {
    CREATE_FROM_ASSESSMENT: '/api/chatbot/assessment/from-assessment',
    SEND_MESSAGE: (conversationId) => `/api/chatbot/conversations/${conversationId}/messages`,
    GET_CONVERSATION: (conversationId) => `/api/chatbot/conversations/${conversationId}`,
  },

  // Health check endpoints
  HEALTH: {
    MAIN: '/api/health',
    LIVE: '/api/health/live',
    READY: '/api/health/ready',
    DETAILED: '/api/health/detailed',
  },
};

export default API_CONFIG;
