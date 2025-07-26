#!/usr/bin/env node

/**
 * Test Dashboard Modifications Script
 * Verifies that dashboard modifications are implemented correctly
 */

import fs from 'fs';

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
function testButtonsRemoved() {
  try {
    const dashboardPath = 'src/components/Dashboard/Dashboard.jsx';
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check that "New Assessment" button is removed
    const hasNewAssessmentButton = content.includes('New Assessment');
    const hasHealthButton = content.includes('Health');
    const hasStartAssessmentButton = content.includes('Start Assessment');
    
    if (!hasNewAssessmentButton && !hasHealthButton && !hasStartAssessmentButton) {
      log('✅ Dashboard: All unwanted buttons removed', 'success');
      return true;
    } else {
      log('❌ Dashboard: Some buttons still exist', 'error');
      if (hasNewAssessmentButton) log('  - "New Assessment" button still exists', 'error');
      if (hasHealthButton) log('  - "Health" button still exists', 'error');
      if (hasStartAssessmentButton) log('  - "Start Assessment" button still exists', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing button removal: ${error.message}`, 'error');
    return false;
  }
}

function testAutoRefreshImplemented() {
  try {
    const dashboardPath = 'src/components/Dashboard/Dashboard.jsx';
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check for auto-refresh implementation
    const hasAutoRefreshInterval = content.includes('setInterval');
    const hasRefreshFunction = content.includes('handleRefresh');
    const hasRefreshButton = content.includes('Refresh');
    const hasAutoRefreshIndicator = content.includes('automatically refreshes');
    
    if (hasAutoRefreshInterval && hasRefreshFunction && hasRefreshButton && hasAutoRefreshIndicator) {
      log('✅ Dashboard: Auto-refresh functionality implemented', 'success');
      return true;
    } else {
      log('❌ Dashboard: Auto-refresh functionality incomplete', 'error');
      if (!hasAutoRefreshInterval) log('  - Missing setInterval for auto-refresh', 'error');
      if (!hasRefreshFunction) log('  - Missing handleRefresh function', 'error');
      if (!hasRefreshButton) log('  - Missing refresh button', 'error');
      if (!hasAutoRefreshIndicator) log('  - Missing auto-refresh indicator', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing auto-refresh: ${error.message}`, 'error');
    return false;
  }
}

function testFetchResultsModified() {
  try {
    const dashboardPath = 'src/components/Dashboard/Dashboard.jsx';
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check that fetchResults function supports manual refresh
    const hasFetchResultsWithParam = content.includes('fetchResults = async (isManualRefresh = false)');
    const hasRefreshingState = content.includes('setIsRefreshing');
    const hasErrorClearing = content.includes('setError(\'\')');
    
    if (hasFetchResultsWithParam && hasRefreshingState && hasErrorClearing) {
      log('✅ Dashboard: fetchResults function properly modified', 'success');
      return true;
    } else {
      log('❌ Dashboard: fetchResults function not properly modified', 'error');
      if (!hasFetchResultsWithParam) log('  - fetchResults missing isManualRefresh parameter', 'error');
      if (!hasRefreshingState) log('  - Missing refreshing state management', 'error');
      if (!hasErrorClearing) log('  - Missing error clearing on successful fetch', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing fetchResults modification: ${error.message}`, 'error');
    return false;
  }
}

function testUnusedFunctionsRemoved() {
  try {
    const dashboardPath = 'src/components/Dashboard/Dashboard.jsx';
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check that handleStartAssessment function is removed
    const hasHandleStartAssessment = content.includes('handleStartAssessment');
    
    if (!hasHandleStartAssessment) {
      log('✅ Dashboard: Unused functions removed', 'success');
      return true;
    } else {
      log('❌ Dashboard: Unused functions still exist', 'error');
      if (hasHandleStartAssessment) log('  - handleStartAssessment function still exists', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing unused functions: ${error.message}`, 'error');
    return false;
  }
}

function testEmptyStateModified() {
  try {
    const dashboardPath = 'src/components/Dashboard/Dashboard.jsx';
    const content = fs.readFileSync(dashboardPath, 'utf8');
    
    // Check that empty state message is updated
    const hasUpdatedEmptyMessage = content.includes('Your assessment results will appear here once completed');
    const hasOldEmptyMessage = content.includes('Get started by taking your first assessment');
    
    if (hasUpdatedEmptyMessage && !hasOldEmptyMessage) {
      log('✅ Dashboard: Empty state message updated', 'success');
      return true;
    } else {
      log('❌ Dashboard: Empty state message not properly updated', 'error');
      if (!hasUpdatedEmptyMessage) log('  - New empty state message not found', 'error');
      if (hasOldEmptyMessage) log('  - Old empty state message still exists', 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Error testing empty state: ${error.message}`, 'error');
    return false;
  }
}

// Main test runner
function runDashboardTests() {
  log('🚀 Starting Dashboard Modification Tests', 'info');
  log('=' .repeat(50), 'info');
  
  const results = {
    buttonsRemoved: false,
    autoRefreshImplemented: false,
    fetchResultsModified: false,
    unusedFunctionsRemoved: false,
    emptyStateModified: false
  };
  
  // Run tests
  results.buttonsRemoved = testButtonsRemoved();
  results.autoRefreshImplemented = testAutoRefreshImplemented();
  results.fetchResultsModified = testFetchResultsModified();
  results.unusedFunctionsRemoved = testUnusedFunctionsRemoved();
  results.emptyStateModified = testEmptyStateModified();
  
  // Summary
  log('=' .repeat(50), 'info');
  log('📊 Dashboard Modification Test Summary', 'info');
  log('=' .repeat(50), 'info');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    log(`${testName.padEnd(30)}: ${passed ? '✅ PASS' : '❌ FAIL'}`, passed ? 'success' : 'error');
  });
  
  log(`\nOverall: ${passed}/${total} tests passed`, passed === total ? 'success' : 'warning');
  
  if (passed === total) {
    log('🎉 All dashboard modification tests passed!', 'success');
  } else {
    log('⚠️  Some dashboard modification tests failed. Check the logs above.', 'warning');
  }
  
  return results;
}

// Run tests
runDashboardTests();
