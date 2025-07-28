#!/usr/bin/env node

/**
 * Security Audit Script
 * Automated security scanning and vulnerability checking
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  outputDir: './security-reports',
  reportFile: 'security-audit-report.json',
  htmlReportFile: 'security-audit-report.html',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  severityThresholds: {
    critical: 0, // Fail if any critical vulnerabilities
    high: 5,     // Fail if more than 5 high vulnerabilities
    moderate: 10, // Fail if more than 10 moderate vulnerabilities
    low: 20      // Fail if more than 20 low vulnerabilities
  }
};

/**
 * Create output directory if it doesn't exist
 */
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

/**
 * Run npm audit and return results
 */
function runNpmAudit() {
  console.log('🔍 Running npm audit...');
  
  try {
    const auditOutput = execSync('npm audit --json', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return JSON.parse(auditOutput);
  } catch (error) {
    // npm audit returns non-zero exit code when vulnerabilities are found
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (parseError) {
        console.error('❌ Failed to parse npm audit output:', parseError);
        return null;
      }
    }
    console.error('❌ Failed to run npm audit:', error.message);
    return null;
  }
}

/**
 * Check for outdated packages
 */
function checkOutdatedPackages() {
  console.log('📦 Checking for outdated packages...');
  
  try {
    const outdatedOutput = execSync('npm outdated --json', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return JSON.parse(outdatedOutput || '{}');
  } catch (error) {
    // npm outdated returns non-zero exit code when outdated packages are found
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout || '{}');
      } catch (parseError) {
        return {};
      }
    }
    return {};
  }
}

/**
 * Analyze package.json for security best practices
 */
function analyzePackageJson() {
  console.log('📋 Analyzing package.json...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return { error: 'package.json not found' };
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const issues = [];
  const recommendations = [];
  
  // Check for security-related scripts
  if (!packageJson.scripts || !packageJson.scripts['security:audit']) {
    recommendations.push('Add security:audit script for regular security checks');
  }
  
  // Check for engines specification
  if (!packageJson.engines) {
    recommendations.push('Specify Node.js and npm versions in engines field');
  }
  
  // Check for private flag
  if (packageJson.private !== true) {
    issues.push('Consider setting "private": true to prevent accidental publishing');
  }
  
  // Check for known vulnerable packages (basic check)
  const knownVulnerablePackages = [
    'lodash', 'moment', 'request', 'node-sass'
  ];
  
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const vulnerableFound = knownVulnerablePackages.filter(pkg => dependencies[pkg]);
  
  if (vulnerableFound.length > 0) {
    issues.push(`Found potentially vulnerable packages: ${vulnerableFound.join(', ')}`);
  }
  
  return { issues, recommendations };
}

/**
 * Generate security report
 */
function generateReport(auditResults, outdatedPackages, packageAnalysis) {
  const timestamp = new Date().toISOString();
  
  const report = {
    timestamp,
    summary: {
      totalVulnerabilities: 0,
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      moderateVulnerabilities: 0,
      lowVulnerabilities: 0,
      outdatedPackages: Object.keys(outdatedPackages).length,
      packageIssues: packageAnalysis.issues?.length || 0
    },
    vulnerabilities: [],
    outdatedPackages,
    packageAnalysis,
    recommendations: []
  };
  
  if (auditResults && auditResults.vulnerabilities) {
    // Process npm audit results
    Object.values(auditResults.vulnerabilities).forEach(vuln => {
      report.vulnerabilities.push({
        name: vuln.name,
        severity: vuln.severity,
        title: vuln.title,
        url: vuln.url,
        range: vuln.range,
        fixAvailable: vuln.fixAvailable
      });
      
      report.summary.totalVulnerabilities++;
      
      switch (vuln.severity) {
        case 'critical':
          report.summary.criticalVulnerabilities++;
          break;
        case 'high':
          report.summary.highVulnerabilities++;
          break;
        case 'moderate':
          report.summary.moderateVulnerabilities++;
          break;
        case 'low':
          report.summary.lowVulnerabilities++;
          break;
      }
    });
  }
  
  // Generate recommendations
  if (report.summary.totalVulnerabilities > 0) {
    report.recommendations.push('Run "npm audit fix" to automatically fix vulnerabilities');
  }
  
  if (report.summary.outdatedPackages > 0) {
    report.recommendations.push('Update outdated packages to latest versions');
  }
  
  if (packageAnalysis.recommendations) {
    report.recommendations.push(...packageAnalysis.recommendations);
  }
  
  return report;
}

/**
 * Generate HTML report
 */
function generateHtmlReport(report) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
        .critical { background-color: #dc3545; color: white; }
        .high { background-color: #fd7e14; color: white; }
        .moderate { background-color: #ffc107; color: black; }
        .low { background-color: #28a745; color: white; }
        .section { margin-bottom: 30px; }
        .vulnerability { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .vulnerability.critical { background: #f8d7da; border-color: #f5c6cb; }
        .vulnerability.high { background: #ffeaa7; border-color: #ffd93d; }
        .recommendation { background: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Security Audit Report</h1>
            <p class="timestamp">Generated: ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card critical">
                <h3>Critical</h3>
                <p>${report.summary.criticalVulnerabilities}</p>
            </div>
            <div class="summary-card high">
                <h3>High</h3>
                <p>${report.summary.highVulnerabilities}</p>
            </div>
            <div class="summary-card moderate">
                <h3>Moderate</h3>
                <p>${report.summary.moderateVulnerabilities}</p>
            </div>
            <div class="summary-card low">
                <h3>Low</h3>
                <p>${report.summary.lowVulnerabilities}</p>
            </div>
            <div class="summary-card">
                <h3>Outdated</h3>
                <p>${report.summary.outdatedPackages}</p>
            </div>
        </div>
        
        <div class="section">
            <h2>🚨 Vulnerabilities</h2>
            ${report.vulnerabilities.length === 0 ? '<p>✅ No vulnerabilities found!</p>' : 
              report.vulnerabilities.map(vuln => `
                <div class="vulnerability ${vuln.severity}">
                    <h4>${vuln.name} - ${vuln.title}</h4>
                    <p><strong>Severity:</strong> ${vuln.severity}</p>
                    <p><strong>Range:</strong> ${vuln.range}</p>
                    <p><strong>Fix Available:</strong> ${vuln.fixAvailable ? 'Yes' : 'No'}</p>
                    ${vuln.url ? `<p><a href="${vuln.url}" target="_blank">More Info</a></p>` : ''}
                </div>
              `).join('')
            }
        </div>
        
        <div class="section">
            <h2>💡 Recommendations</h2>
            ${report.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
        </div>
    </div>
</body>
</html>`;
  
  return html;
}

/**
 * Check if report should fail based on severity thresholds
 */
function shouldFail(report) {
  const { summary } = report;
  
  if (summary.criticalVulnerabilities > CONFIG.severityThresholds.critical) {
    return { fail: true, reason: `Critical vulnerabilities found: ${summary.criticalVulnerabilities}` };
  }
  
  if (summary.highVulnerabilities > CONFIG.severityThresholds.high) {
    return { fail: true, reason: `Too many high vulnerabilities: ${summary.highVulnerabilities}` };
  }
  
  if (summary.moderateVulnerabilities > CONFIG.severityThresholds.moderate) {
    return { fail: true, reason: `Too many moderate vulnerabilities: ${summary.moderateVulnerabilities}` };
  }
  
  if (summary.lowVulnerabilities > CONFIG.severityThresholds.low) {
    return { fail: true, reason: `Too many low vulnerabilities: ${summary.lowVulnerabilities}` };
  }
  
  return { fail: false };
}

/**
 * Main execution function
 */
function main() {
  console.log('🔒 Starting security audit...\n');
  
  ensureOutputDir();
  
  // Run security checks
  const auditResults = runNpmAudit();
  const outdatedPackages = checkOutdatedPackages();
  const packageAnalysis = analyzePackageJson();
  
  // Generate report
  const report = generateReport(auditResults, outdatedPackages, packageAnalysis);
  
  // Save JSON report
  const reportPath = path.join(CONFIG.outputDir, CONFIG.reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Save HTML report
  const htmlReport = generateHtmlReport(report);
  const htmlReportPath = path.join(CONFIG.outputDir, CONFIG.htmlReportFile);
  fs.writeFileSync(htmlReportPath, htmlReport);
  
  // Print summary
  console.log('\n📊 Security Audit Summary:');
  console.log(`   Critical: ${report.summary.criticalVulnerabilities}`);
  console.log(`   High: ${report.summary.highVulnerabilities}`);
  console.log(`   Moderate: ${report.summary.moderateVulnerabilities}`);
  console.log(`   Low: ${report.summary.lowVulnerabilities}`);
  console.log(`   Outdated packages: ${report.summary.outdatedPackages}`);
  console.log(`\n📄 Reports saved to:`);
  console.log(`   JSON: ${reportPath}`);
  console.log(`   HTML: ${htmlReportPath}`);
  
  // Check if we should fail
  const failCheck = shouldFail(report);
  if (failCheck.fail) {
    console.error(`\n❌ Security audit failed: ${failCheck.reason}`);
    process.exit(1);
  } else {
    console.log('\n✅ Security audit passed!');
  }
}

// Run if called directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

export { main, CONFIG };
