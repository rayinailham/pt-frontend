# 🔒 Security Guidelines

## Overview

This document outlines the security measures and best practices implemented in the ATMA Frontend application.

## Security Features Implemented

### 1. Content Security Policy (CSP)
- **Location**: `vite.config.js`, `index.html`
- **Purpose**: Prevents XSS attacks and code injection
- **Configuration**: 
  - Restricts script sources to self and safe domains
  - Blocks inline scripts and eval() in production
  - Allows only HTTPS external resources

### 2. Input Sanitization with DOMPurify
- **Location**: `src/utils/sanitizationUtils.js`
- **Purpose**: Sanitizes user input to prevent XSS attacks
- **Features**:
  - HTML sanitization with configurable policies
  - Text-only sanitization for user input
  - Rich text sanitization for content areas
  - URL, email, and filename sanitization

### 3. Enhanced Email Validation
- **Location**: `src/utils/validationUtils.js`
- **Purpose**: Strict email validation to prevent injection attacks
- **Features**:
  - RFC 5322 compliant email validation
  - Disposable email detection
  - Domain blacklisting support
  - Comprehensive validation with detailed error messages

### 4. Automated Security Scanning
- **Location**: `scripts/security-audit.js`, `.github/workflows/security-audit.yml`
- **Purpose**: Continuous security monitoring
- **Features**:
  - Dependency vulnerability scanning
  - Outdated package detection
  - Security report generation
  - GitHub Actions integration

## Security Scripts

### Available Commands

```bash
# Run comprehensive security audit
npm run security:audit

# Fix known vulnerabilities automatically
npm run security:fix

# Check for vulnerabilities and outdated packages
npm run security:check

# Pre-commit security check
npm run precommit
```

### Security Audit Reports

The security audit generates two types of reports:

1. **JSON Report**: `security-reports/security-audit-report.json`
   - Machine-readable format
   - Detailed vulnerability information
   - Suitable for CI/CD integration

2. **HTML Report**: `security-reports/security-audit-report.html`
   - Human-readable format
   - Visual dashboard with charts
   - Easy to share with stakeholders

## Security Best Practices

### For Developers

1. **Input Validation**
   ```javascript
   import { sanitizeText, validateEmail } from '../utils/sanitizationUtils';
   
   // Always sanitize user input
   const cleanInput = sanitizeText(userInput);
   
   // Validate emails properly
   const emailResult = validateEmail(email);
   if (!emailResult.isValid) {
     // Handle validation errors
   }
   ```

2. **URL Handling**
   ```javascript
   import { sanitizeURL } from '../utils/sanitizationUtils';
   
   // Sanitize URLs before using them
   const safeURL = sanitizeURL(userProvidedURL);
   if (safeURL) {
     // Use the sanitized URL
   }
   ```

3. **Content Rendering**
   ```javascript
   import { sanitizeHTML } from '../utils/sanitizationUtils';
   
   // Sanitize HTML content before rendering
   const safeHTML = sanitizeHTML(htmlContent);
   ```

### For Content Security Policy

1. **Adding New External Resources**
   - Update CSP directives in `vite.config.js`
   - Test in both development and production
   - Use HTTPS-only resources

2. **Inline Scripts/Styles**
   - Avoid inline scripts and styles
   - Use nonces for necessary inline content
   - Prefer external files with proper CSP headers

### For Dependencies

1. **Regular Updates**
   ```bash
   # Check for outdated packages weekly
   npm outdated
   
   # Update packages carefully
   npm update
   
   # Run security audit after updates
   npm run security:audit
   ```

2. **New Package Evaluation**
   - Check package reputation and maintenance status
   - Review security advisories
   - Use `npm audit` before adding new dependencies

## Security Monitoring

### Automated Checks

1. **GitHub Actions**
   - Runs on every push and pull request
   - Weekly scheduled scans
   - Dependency review for PRs
   - CodeQL analysis for code security

2. **Local Development**
   - Pre-commit hooks run security checks
   - IDE integration for real-time feedback
   - Manual audit commands available

### Security Thresholds

The security audit fails if:
- Any critical vulnerabilities are found
- More than 5 high-severity vulnerabilities
- More than 10 moderate-severity vulnerabilities
- More than 20 low-severity vulnerabilities

## Incident Response

### If Vulnerabilities Are Found

1. **Immediate Actions**
   ```bash
   # Try automatic fix first
   npm audit fix
   
   # If automatic fix isn't available, update manually
   npm update [package-name]
   
   # Run security audit to verify fix
   npm run security:audit
   ```

2. **Manual Review Required**
   - Check if the vulnerability affects your usage
   - Look for alternative packages if needed
   - Consider temporary workarounds
   - Document decisions in security reports

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. Email security concerns to: [security@company.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fixes (if any)

## Security Headers

The application implements the following security headers:

```
Content-Security-Policy: [Configured in vite.config.js]
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains (production)
```

## Environment Security

### Development
- CSP allows `unsafe-inline` and `unsafe-eval` for Vite
- Detailed error messages for debugging
- Source maps enabled

### Production
- Strict CSP without unsafe directives
- Error messages sanitized
- Source maps disabled
- HSTS header enabled

## Compliance

This security implementation helps meet:
- OWASP Top 10 security requirements
- Common web security standards
- Modern browser security features
- Industry best practices for React applications

## Regular Security Tasks

### Weekly
- [ ] Run `npm run security:audit`
- [ ] Check for outdated packages
- [ ] Review security reports

### Monthly
- [ ] Update dependencies
- [ ] Review CSP violations (if any)
- [ ] Update security documentation

### Quarterly
- [ ] Security architecture review
- [ ] Penetration testing (if applicable)
- [ ] Security training updates

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Guide](https://content-security-policy.com/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

---

For questions about security implementation, contact the development team or refer to the security audit reports.
