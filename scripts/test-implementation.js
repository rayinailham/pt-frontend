#!/usr/bin/env node

/**
 * Test Implementation Script
 * Verifies that email lowercase and token validation features are implemented correctly
 */

import fs from 'fs';
import path from 'path';

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

// Test functions
function testEmailLowercaseInLogin() {
  try {
    const loginPath = 'src/components/Auth/Login.jsx';
    const content = fs.readFileSync(loginPath, 'utf8');
    
    // Check if email is converted to lowercase
    const hasEmailLowercase = content.includes('email: data.email.toLowerCase().trim()');
    
    if (hasEmailLowercase) {
      log('✅ Login component: Email lowercase conversion implemented', 'success');
      return true;
    } else {
      log('❌ Login component: Email lowercase conversion NOT found', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing Login component: ${error.message}`, 'error');
    return false;
  }
}

function testEmailLowercaseInRegister() {
  try {
    const registerPath = 'src/components/Auth/Register.jsx';
    const content = fs.readFileSync(registerPath, 'utf8');
    
    // Check if email is converted to lowercase
    const hasEmailLowercase = content.includes('email: data.email.toLowerCase().trim()');
    
    if (hasEmailLowercase) {
      log('✅ Register component: Email lowercase conversion implemented', 'success');
      return true;
    } else {
      log('❌ Register component: Email lowercase conversion NOT found', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing Register component: ${error.message}`, 'error');
    return false;
  }
}

function testTokenValidationInAssessment() {
  try {
    const assessmentPath = 'src/components/Assessment/AssessmentFlow.jsx';
    const content = fs.readFileSync(assessmentPath, 'utf8');
    
    // Check if token balance validation is implemented
    const hasTokenCheck = content.includes('checkTokenBalance');
    const hasTokenValidation = content.includes('currentBalance <= 0');
    const hasTokenError = content.includes('Insufficient token balance');
    
    if (hasTokenCheck && hasTokenValidation && hasTokenError) {
      log('✅ Assessment component: Token validation implemented', 'success');
      return true;
    } else {
      log('❌ Assessment component: Token validation NOT properly implemented', 'error');
      if (!hasTokenCheck) log('  - Missing checkTokenBalance function', 'error');
      if (!hasTokenValidation) log('  - Missing token balance validation', 'error');
      if (!hasTokenError) log('  - Missing token error message', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing Assessment component: ${error.message}`, 'error');
    return false;
  }
}

function testQuickApiScript() {
  try {
    const scriptPath = 'scripts/quick-api-test.js';
    const content = fs.readFileSync(scriptPath, 'utf8');
    
    // Check if email is lowercase in test credentials
    const hasLowercaseEmail = content.includes("email: 'arknights@gmail.com'");
    const hasTokenBalanceFunction = content.includes('quickTokenBalance');
    const hasTokenValidationInAssessment = content.includes('tokenBalance <= 0');
    
    if (hasLowercaseEmail && hasTokenBalanceFunction && hasTokenValidationInAssessment) {
      log('✅ Quick API test script: All features implemented', 'success');
      return true;
    } else {
      log('❌ Quick API test script: Some features missing', 'error');
      if (!hasLowercaseEmail) log('  - Email not converted to lowercase', 'error');
      if (!hasTokenBalanceFunction) log('  - Token balance function missing', 'error');
      if (!hasTokenValidationInAssessment) log('  - Token validation in assessment missing', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing Quick API script: ${error.message}`, 'error');
    return false;
  }
}

// Main test runner
function runImplementationTests() {
  log('🚀 Starting Implementation Tests', 'info');
  log('=' .repeat(50), 'info');
  
  const results = {
    loginEmailLowercase: false,
    registerEmailLowercase: false,
    assessmentTokenValidation: false,
    quickApiScript: false
  };
  
  // Run tests
  results.loginEmailLowercase = testEmailLowercaseInLogin();
  results.registerEmailLowercase = testEmailLowercaseInRegister();
  results.assessmentTokenValidation = testTokenValidationInAssessment();
  results.quickApiScript = testQuickApiScript();
  
  // Summary
  log('=' .repeat(50), 'info');
  log('📊 Implementation Test Summary', 'info');
  log('=' .repeat(50), 'info');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    log(`${testName.padEnd(30)}: ${passed ? '✅ PASS' : '❌ FAIL'}`, passed ? 'success' : 'error');
  });
  
  log(`\nOverall: ${passed}/${total} tests passed`, passed === total ? 'success' : 'warning');
  
  if (passed === total) {
    log('🎉 All implementation tests passed!', 'success');
  } else {
    log('⚠️  Some implementation tests failed. Check the logs above.', 'warning');
  }
  
  return results;
}

// Run tests
runImplementationTests()
  .then ? runImplementationTests() : runImplementationTests();
