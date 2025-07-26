/**
 * API Testing Script for ATMA Backend
 * Tests all available API endpoints with proper authentication
 */

import axios from 'axios';

// API Configuration for Node.js
const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
};

// API Endpoints
const API_ENDPOINTS = {
  GATEWAY_INFO: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
    TOKEN_BALANCE: '/auth/token-balance',
  },
  ASSESSMENT: {
    SUBMIT: '/assessment/submit',
    STATUS: (jobId) => `/assessment/status/${jobId}`,
  },
  ARCHIVE: {
    RESULTS: '/archive/results',
    RESULT_BY_ID: (id) => `/archive/results/${id}`,
    UPDATE_RESULT: (id) => `/archive/results/${id}`,
    DELETE_RESULT: (id) => `/archive/results/${id}`,
    STATS: '/archive/stats',
    STATS_OVERVIEW: '/archive/stats/overview',
  },
  HEALTH: {
    MAIN: '/health',
    LIVE: '/health/live',
    READY: '/health/ready',
    DETAILED: '/health/detailed',
  }
};

// Test credentials
const TEST_CREDENTIALS = {
  email: 'Arknights@gmail.com',
  password: 'Amiya123'
};

// Configure axios
axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = API_CONFIG.TIMEOUT;

let authToken = null;
let testResults = [];

// Helper functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const addResult = (endpoint, method, success, message, data = null) => {
  testResults.push({
    endpoint,
    method,
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testGatewayInfo() {
  log('Testing Gateway Info...');
  try {
    const response = await axios.get(API_ENDPOINTS.GATEWAY_INFO);
    log('Gateway Info: SUCCESS', 'success');
    addResult('/', 'GET', true, 'Gateway info retrieved successfully', response.data);
    return response.data;
  } catch (error) {
    log(`Gateway Info: FAILED - ${error.message}`, 'error');
    addResult('/', 'GET', false, error.message);
    return null;
  }
}

async function testLogin() {
  log('Testing Login...');
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, TEST_CREDENTIALS);
    
    if (response.data.success) {
      authToken = response.data.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      log('Login: SUCCESS', 'success');
      addResult('/auth/login', 'POST', true, 'Login successful', {
        user: response.data.data.user,
        hasToken: !!authToken
      });
      return response.data;
    } else {
      throw new Error('Login failed: Invalid response format');
    }
  } catch (error) {
    log(`Login: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/auth/login', 'POST', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testRegister() {
  log('Testing Register (with test email)...');
  const testEmail = `test_${Date.now()}@example.com`;
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
      email: testEmail,
      password: 'TestPassword123'
    });
    
    log('Register: SUCCESS', 'success');
    addResult('/auth/register', 'POST', true, 'Registration successful', {
      email: testEmail,
      hasToken: !!response.data.data?.token
    });
    return response.data;
  } catch (error) {
    log(`Register: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/auth/register', 'POST', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testProfile() {
  log('Testing Get Profile...');
  try {
    const response = await axios.get(API_ENDPOINTS.AUTH.PROFILE);
    log('Get Profile: SUCCESS', 'success');
    addResult('/auth/profile', 'GET', true, 'Profile retrieved successfully', response.data.data);
    return response.data;
  } catch (error) {
    log(`Get Profile: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/auth/profile', 'GET', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testUpdateProfile() {
  log('Testing Update Profile...');
  try {
    const updateData = {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      gender: 'other',
      education: 'bachelor',
      experience: '1-3'
    };
    
    const response = await axios.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, updateData);
    log('Update Profile: SUCCESS', 'success');
    addResult('/auth/profile', 'PUT', true, 'Profile updated successfully', response.data.data);
    return response.data;
  } catch (error) {
    log(`Update Profile: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/auth/profile', 'PUT', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testTokenBalance() {
  log('Testing Token Balance...');
  try {
    const response = await axios.get(API_ENDPOINTS.AUTH.TOKEN_BALANCE);
    log('Token Balance: SUCCESS', 'success');
    addResult('/auth/token-balance', 'GET', true, 'Token balance retrieved successfully', response.data.data);
    return response.data;
  } catch (error) {
    log(`Token Balance: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/auth/token-balance', 'GET', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testSubmitAssessment() {
  log('Testing Submit Assessment...');
  try {
    const assessmentData = {
      riasec: {
        realistic: 75,
        investigative: 85,
        artistic: 60,
        social: 50,
        enterprising: 70,
        conventional: 55
      },
      ocean: {
        openness: 80,
        conscientiousness: 65,
        extraversion: 55,
        agreeableness: 45,
        neuroticism: 30
      },
      viaIs: {
        creativity: 85,
        curiosity: 78,
        judgment: 70,
        loveOfLearning: 82,
        perspective: 60,
        bravery: 55,
        perseverance: 68,
        honesty: 73,
        zest: 66,
        love: 80,
        kindness: 75,
        socialIntelligence: 65,
        teamwork: 60,
        fairness: 70,
        leadership: 67,
        forgiveness: 58,
        humility: 62,
        prudence: 69,
        selfRegulation: 61,
        appreciationOfBeauty: 50,
        gratitude: 72,
        hope: 77,
        humor: 65,
        spirituality: 55
      }
    };
    
    const response = await axios.post(API_ENDPOINTS.ASSESSMENT.SUBMIT, assessmentData);
    log('Submit Assessment: SUCCESS', 'success');
    addResult('/assessment/submit', 'POST', true, 'Assessment submitted successfully', {
      jobId: response.data.data.jobId,
      status: response.data.data.status
    });
    return response.data;
  } catch (error) {
    log(`Submit Assessment: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/assessment/submit', 'POST', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testAssessmentStatus(jobId) {
  log(`Testing Assessment Status for job: ${jobId}...`);
  try {
    const response = await axios.get(API_ENDPOINTS.ASSESSMENT.STATUS(jobId));
    log('Assessment Status: SUCCESS', 'success');
    addResult(`/assessment/status/${jobId}`, 'GET', true, 'Assessment status retrieved successfully', response.data.data);
    return response.data;
  } catch (error) {
    log(`Assessment Status: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult(`/assessment/status/${jobId}`, 'GET', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testArchiveResults() {
  log('Testing Archive Results...');
  try {
    const response = await axios.get(API_ENDPOINTS.ARCHIVE.RESULTS);
    log('Archive Results: SUCCESS', 'success');
    addResult('/archive/results', 'GET', true, 'Archive results retrieved successfully', {
      count: response.data.data?.results?.length || 0,
      pagination: response.data.data?.pagination
    });
    return response.data;
  } catch (error) {
    log(`Archive Results: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/archive/results', 'GET', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testStats() {
  log('Testing Stats...');
  try {
    const response = await axios.get(API_ENDPOINTS.ARCHIVE.STATS);
    log('Stats: SUCCESS', 'success');
    addResult('/archive/stats', 'GET', true, 'Stats retrieved successfully', response.data.data);
    return response.data;
  } catch (error) {
    log(`Stats: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/archive/stats', 'GET', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testStatsOverview() {
  log('Testing Stats Overview...');
  try {
    const response = await axios.get(API_ENDPOINTS.ARCHIVE.STATS_OVERVIEW);
    log('Stats Overview: SUCCESS', 'success');
    addResult('/archive/stats/overview', 'GET', true, 'Stats overview retrieved successfully', response.data.data);
    return response.data;
  } catch (error) {
    log(`Stats Overview: FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/archive/stats/overview', 'GET', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testHealthChecks() {
  log('Testing Health Checks...');
  
  // Main health check
  try {
    const response = await axios.get(API_ENDPOINTS.HEALTH.MAIN);
    log('Health Check (Main): SUCCESS', 'success');
    addResult('/health', 'GET', true, 'Main health check successful', response.data);
  } catch (error) {
    log(`Health Check (Main): FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/health', 'GET', false, error.response?.data?.message || error.message);
  }
  
  // Liveness check
  try {
    const response = await axios.get(API_ENDPOINTS.HEALTH.LIVE);
    log('Health Check (Live): SUCCESS', 'success');
    addResult('/health/live', 'GET', true, 'Liveness check successful', response.data);
  } catch (error) {
    log(`Health Check (Live): FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/health/live', 'GET', false, error.response?.data?.message || error.message);
  }
  
  // Readiness check
  try {
    const response = await axios.get(API_ENDPOINTS.HEALTH.READY);
    log('Health Check (Ready): SUCCESS', 'success');
    addResult('/health/ready', 'GET', true, 'Readiness check successful', response.data);
  } catch (error) {
    log(`Health Check (Ready): FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/health/ready', 'GET', false, error.response?.data?.message || error.message);
  }
  
  // Detailed health check
  try {
    const response = await axios.get(API_ENDPOINTS.HEALTH.DETAILED);
    log('Health Check (Detailed): SUCCESS', 'success');
    addResult('/health/detailed', 'GET', true, 'Detailed health check successful', response.data);
  } catch (error) {
    log(`Health Check (Detailed): FAILED - ${error.response?.data?.message || error.message}`, 'error');
    addResult('/health/detailed', 'GET', false, error.response?.data?.message || error.message);
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting API Tests for ATMA Backend');
  log(`Base URL: ${API_CONFIG.BASE_URL}`);
  log('='.repeat(50));
  
  // Test gateway info (no auth required)
  await testGatewayInfo();
  await sleep(1000);
  
  // Test authentication
  const loginResult = await testLogin();
  if (!loginResult) {
    log('❌ Cannot proceed with authenticated tests - login failed', 'error');
    return;
  }
  await sleep(1000);
  
  // Test registration (optional)
  await testRegister();
  await sleep(1000);
  
  // Test profile endpoints
  await testProfile();
  await sleep(1000);
  
  await testUpdateProfile();
  await sleep(1000);
  
  await testTokenBalance();
  await sleep(1000);
  
  // Test assessment endpoints
  const assessmentResult = await testSubmitAssessment();
  if (assessmentResult?.data?.jobId) {
    await sleep(2000); // Wait a bit before checking status
    await testAssessmentStatus(assessmentResult.data.jobId);
  }
  await sleep(1000);
  
  // Test archive endpoints
  await testArchiveResults();
  await sleep(1000);
  
  await testStats();
  await sleep(1000);
  
  await testStatsOverview();
  await sleep(1000);
  
  // Test health endpoints
  await testHealthChecks();
  
  // Print summary
  log('='.repeat(50));
  log('📊 Test Summary');
  log('='.repeat(50));
  
  const successCount = testResults.filter(r => r.success).length;
  const failCount = testResults.filter(r => !r.success).length;
  
  log(`Total Tests: ${testResults.length}`);
  log(`Successful: ${successCount}`, 'success');
  log(`Failed: ${failCount}`, failCount > 0 ? 'error' : 'info');
  
  if (failCount > 0) {
    log('\n❌ Failed Tests:');
    testResults.filter(r => !r.success).forEach(result => {
      log(`  ${result.method} ${result.endpoint}: ${result.message}`, 'error');
    });
  }
  
  // Save results to file
  const fs = await import('fs');
  const resultsFile = `api-test-results-${Date.now()}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
  log(`\n📄 Detailed results saved to: ${resultsFile}`);
}

// Run tests
runAllTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
