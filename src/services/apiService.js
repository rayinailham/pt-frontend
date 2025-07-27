import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

/**
 * API Service for handling all API calls
 * Provides centralized methods for interacting with the backend
 */
class ApiService {

  /**
   * Handle API errors consistently
   * @param {Error} error - Axios error object
   * @param {string} operation - Description of the operation that failed
   */
  handleApiError(error, operation) {
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const statusCode = error.response?.status;

    console.error(`API Error in ${operation}:`, {
      status: statusCode,
      message: errorMessage,
      url: error.config?.url,
      method: error.config?.method
    });

    // Re-throw with enhanced error information
    const enhancedError = new Error(errorMessage);
    enhancedError.status = statusCode;
    enhancedError.originalError = error;
    throw enhancedError;
  }
  
  // ==================== GATEWAY INFO ====================
  
  /**
   * Get API Gateway information
   */
  async getGatewayInfo() {
    const response = await axios.get(API_ENDPOINTS.GATEWAY_INFO);
    return response.data;
  }

  // ==================== AUTHENTICATION ====================
  
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   */
  async register(userData) {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'register');
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  async login(credentials) {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'login');
    }
  }

  /**
   * Get user profile
   */
  async getProfile() {
    const response = await axios.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   */
  async updateProfile(profileData) {
    const response = await axios.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
    return response.data;
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   */
  async changePassword(passwordData) {
    const response = await axios.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout() {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  }

  /**
   * Get user token balance
   */
  async getTokenBalance() {
    const response = await axios.get(API_ENDPOINTS.AUTH.TOKEN_BALANCE);
    return response.data;
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount() {
    const response = await axios.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT);
    return response.data;
  }

  // ==================== ASSESSMENTS ====================
  
  /**
   * Submit assessment data for AI analysis
   * @param {Object} assessmentData - Assessment data
   * @param {Object} assessmentData.riasec - RIASEC scores
   * @param {Object} assessmentData.ocean - Big Five (OCEAN) scores
   * @param {Object} assessmentData.viaIs - VIA Character Strengths scores
   */
  async submitAssessment(assessmentData) {
    try {
      const response = await axios.post(API_ENDPOINTS.ASSESSMENT.SUBMIT, assessmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check assessment processing status
   * @param {string} jobId - Assessment job ID
   */
  async getAssessmentStatus(jobId) {
    const response = await axios.get(API_ENDPOINTS.ASSESSMENT.STATUS(jobId));
    return response.data;
  }

  // ==================== ARCHIVE ====================
  
  /**
   * Get user's analysis results with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by status
   */
  async getResults(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    
    const url = `${API_ENDPOINTS.ARCHIVE.RESULTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await axios.get(url);
    return response.data;
  }

  /**
   * Get specific analysis result
   * @param {string} resultId - Result ID
   */
  async getResultById(resultId) {
    const response = await axios.get(API_ENDPOINTS.ARCHIVE.RESULT_BY_ID(resultId));
    return response.data;
  }

  /**
   * Update analysis result
   * @param {string} resultId - Result ID
   * @param {Object} updateData - Update data
   */
  async updateResult(resultId, updateData) {
    const response = await axios.put(API_ENDPOINTS.ARCHIVE.UPDATE_RESULT(resultId), updateData);
    return response.data;
  }

  /**
   * Delete analysis result
   * @param {string} resultId - Result ID
   */
  async deleteResult(resultId) {
    const response = await axios.delete(API_ENDPOINTS.ARCHIVE.DELETE_RESULT(resultId));
    return response.data;
  }

  /**
   * Get user statistics
   */
  async getStats() {
    const response = await axios.get(API_ENDPOINTS.ARCHIVE.STATS);
    return response.data;
  }

  /**
   * Get user results with pagination and filtering (replaces getUserJobs)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by status
   * @param {string} params.sort - Field for sorting
   * @param {string} params.order - Sort order
   */
  async getUserResults(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);

    const url = `${API_ENDPOINTS.ARCHIVE.RESULTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await axios.get(url);
    return response.data;
  }

  /**
   * Get user jobs with pagination and filtering (deprecated - use getUserResults instead)
   * @deprecated Use getUserResults instead
   */
  async getUserJobs(params = {}) {
    return this.getUserResults(params);
  }

  /**
   * Get user overview statistics (kept for backward compatibility)
   */
  async getStatsOverview() {
    // Get results data and transform it to provide overview statistics
    const resultsResponse = await this.getUserResults({ limit: 100 }); // Get more results for better stats

    if (resultsResponse.success && resultsResponse.data) {
      const results = resultsResponse.data.results || [];
      const total = resultsResponse.data.pagination?.total || 0;

      // Calculate statistics from results data
      const completedResults = results.filter(result => result.status === 'completed');
      const processingResults = results.filter(result => result.status === 'processing');
      const failedResults = results.filter(result => result.status === 'failed');

      const successRate = total > 0 ? (completedResults.length / total) : 0;

      // Get current month results
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthResults = results.filter(result => {
        const resultDate = new Date(result.created_at);
        return resultDate.getMonth() === currentMonth && resultDate.getFullYear() === currentYear;
      });

      // Get latest analysis date
      const latestResult = results.length > 0 ? results[0] : null; // Assuming results are sorted by created_at DESC

      const transformedData = {
        success: true,
        data: {
          summary: {
            total_assessments: total,
            this_month: thisMonthResults.length,
            success_rate: successRate
          },
          archetype_summary: {
            most_common: '',
            frequency: 0,
            last_archetype: '',
            unique_archetypes: 0,
            archetype_trend: 'stable'
          },
          recent_results: completedResults.slice(0, 5), // Get 5 most recent completed results
          raw_stats: {
            completed: completedResults.length,
            failed: failedResults.length,
            processing: processingResults.length,
            latest_analysis: latestResult ? latestResult.created_at : null
          }
        }
      };

      return transformedData;
    }

    return resultsResponse;
  }

  // ==================== CHATBOT ====================

  /**
   * Create conversation from assessment
   * @param {Object} conversationData - Conversation creation data
   * @param {string} conversationData.assessment_id - Assessment ID
   * @param {string} conversationData.conversation_type - Type of conversation
   * @param {boolean} conversationData.include_suggestions - Include suggestions
   */
  async createConversationFromAssessment(conversationData) {
    try {
      const response = await axios.post(API_ENDPOINTS.CHATBOT.CREATE_FROM_ASSESSMENT, conversationData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'createConversationFromAssessment');
    }
  }

  /**
   * Send message to chatbot
   * @param {string} conversationId - Conversation ID
   * @param {Object} messageData - Message data
   * @param {string} messageData.content - Message content
   * @param {string} messageData.type - Message type
   */
  async sendChatMessage(conversationId, messageData) {
    try {
      const response = await axios.post(API_ENDPOINTS.CHATBOT.SEND_MESSAGE(conversationId), messageData);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'sendChatMessage');
    }
  }

  /**
   * Get conversation details
   * @param {string} conversationId - Conversation ID
   * @param {Object} params - Query parameters
   * @param {boolean} params.includeMessages - Include message history
   * @param {number} params.messageLimit - Limit number of messages
   */
  async getConversation(conversationId, params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.includeMessages !== undefined) queryParams.append('includeMessages', params.includeMessages);
      if (params.messageLimit) queryParams.append('messageLimit', params.messageLimit);

      const url = `${API_ENDPOINTS.CHATBOT.GET_CONVERSATION(conversationId)}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'getConversation');
    }
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Comprehensive health check of all services
   */
  async getHealthStatus() {
    const response = await axios.get(API_ENDPOINTS.HEALTH.MAIN);
    return response.data;
  }

  /**
   * Simple liveness probe
   */
  async getLivenessStatus() {
    const response = await axios.get(API_ENDPOINTS.HEALTH.LIVE);
    return response.data;
  }

  /**
   * Readiness probe
   */
  async getReadinessStatus() {
    const response = await axios.get(API_ENDPOINTS.HEALTH.READY);
    return response.data;
  }

  /**
   * Extended health information
   */
  async getDetailedHealthStatus() {
    const response = await axios.get(API_ENDPOINTS.HEALTH.DETAILED);
    return response.data;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
