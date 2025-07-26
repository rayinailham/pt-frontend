#!/usr/bin/env node

/**
 * Quick API Test Script for ATMA Backend
 * A simplified version for quick testing and debugging
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = 'https://api.chhrone.web.id';
const TEST_CREDENTIALS = {
  email: 'arknights@gmail.com', // Convert to lowercase
  password: 'Amiya123'
};

// Configure axios
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000;

let authToken = null;

// Helper functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m'  // Yellow
  };
  const reset = '\x1b[0m';
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[type]}[${timestamp}] ${message}${reset}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Quick test functions
async function quickLogin() {
  try {
    log('Testing login...', 'info');

    // Ensure email is lowercase before sending
    const loginCredentials = {
      ...TEST_CREDENTIALS,
      email: TEST_CREDENTIALS.email.toLowerCase().trim()
    };

    const response = await axios.post('/auth/login', loginCredentials);

    if (response.data.success) {
      authToken = response.data.data.token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      log('✅ Login successful', 'success');
      return true;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    log(`❌ Login failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function quickHealthCheck() {
  try {
    log('Testing health check...', 'info');
    const response = await axios.get('/health');
    log('✅ Health check passed', 'success');
    return true;
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'error');
    return false;
  }
}

async function quickProfile() {
  try {
    log('Testing profile...', 'info');
    const response = await axios.get('/auth/profile');
    log(`✅ Profile retrieved for: ${response.data.data.email}`, 'success');
    return true;
  } catch (error) {
    log(`❌ Profile failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function quickTokenBalance() {
  try {
    log('Testing token balance...', 'info');
    const response = await axios.get('/auth/token-balance');
    const balance = response.data.data.token_balance;
    log(`✅ Token balance retrieved: ${balance} tokens`, 'success');
    return balance;
  } catch (error) {
    log(`❌ Token balance failed: ${error.response?.data?.message || error.message}`, 'error');
    return null;
  }
}

async function quickAssessment() {
  try {
    log('Testing assessment submission...', 'info');

    // Check token balance first
    const tokenBalance = await quickTokenBalance();
    if (tokenBalance === null) {
      log('❌ Cannot check token balance, skipping assessment', 'error');
      return false;
    }

    if (tokenBalance <= 0) {
      log('❌ Insufficient token balance (0 tokens), cannot submit assessment', 'error');
      return false;
    }

    log(`✅ Token balance sufficient: ${tokenBalance} tokens`, 'success');

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
    
    const response = await axios.post('/assessment/submit', assessmentData);
    const jobId = response.data.data.jobId;
    log(`✅ Assessment submitted with job ID: ${jobId}`, 'success');
    
    // Quick status check
    await sleep(1000);
    const statusResponse = await axios.get(`/assessment/status/${jobId}`);
    log(`✅ Assessment status: ${statusResponse.data.data.status}`, 'success');
    
    return true;
  } catch (error) {
    log(`❌ Assessment failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function quickArchive() {
  try {
    log('Testing archive...', 'info');
    const response = await axios.get('/archive/results');
    const count = response.data.data?.results?.length || 0;
    log(`✅ Archive retrieved: ${count} results`, 'success');
    return true;
  } catch (error) {
    log(`❌ Archive failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Main test runner
async function runQuickTests() {
  log('🚀 Starting Quick API Tests', 'info');
  log(`Base URL: ${API_BASE_URL}`, 'info');
  log('=' .repeat(50), 'info');
  
  const results = {
    health: false,
    login: false,
    profile: false,
    tokenBalance: false,
    assessment: false,
    archive: false
  };
  
  // Test health (no auth required)
  results.health = await quickHealthCheck();
  await sleep(500);
  
  // Test login
  results.login = await quickLogin();
  if (!results.login) {
    log('❌ Skipping authenticated tests due to login failure', 'error');
    return results;
  }
  await sleep(500);
  
  // Test authenticated endpoints
  results.profile = await quickProfile();
  await sleep(500);

  // Test token balance
  const tokenBalance = await quickTokenBalance();
  results.tokenBalance = tokenBalance !== null;
  await sleep(500);

  results.assessment = await quickAssessment();
  await sleep(500);

  results.archive = await quickArchive();
  
  // Summary
  log('=' .repeat(50), 'info');
  log('📊 Quick Test Summary', 'info');
  log('=' .repeat(50), 'info');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    log(`${test.padEnd(12)}: ${passed ? '✅ PASS' : '❌ FAIL'}`, passed ? 'success' : 'error');
  });
  
  log(`\nOverall: ${passed}/${total} tests passed`, passed === total ? 'success' : 'warning');
  
  if (passed === total) {
    log('🎉 All quick tests passed!', 'success');
  } else {
    log('⚠️  Some tests failed. Check the logs above.', 'warning');
  }
  
  return results;
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Quick API Test Script for ATMA Backend

Usage:
  node scripts/quick-api-test.js [options]

Options:
  --help, -h     Show this help message
  --url <url>    Set custom API base URL (default: http://localhost:3000)

Environment Variables:
  VITE_API_BASE_URL    API base URL

Examples:
  node scripts/quick-api-test.js
  node scripts/quick-api-test.js --url http://localhost:3001
  VITE_API_BASE_URL=http://localhost:3001 node scripts/quick-api-test.js
`);
  process.exit(0);
}

// Handle custom URL
const urlIndex = args.indexOf('--url');
if (urlIndex !== -1 && args[urlIndex + 1]) {
  axios.defaults.baseURL = args[urlIndex + 1];
  log(`Using custom URL: ${args[urlIndex + 1]}`, 'info');
}

// Run tests
runQuickTests()
  .then(results => {
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    process.exit(passed === total ? 0 : 1);
  })
  .catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
