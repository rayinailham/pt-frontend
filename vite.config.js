import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: 'unsafe-inline' and 'unsafe-eval' needed for Vite dev mode
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.ipify.org ws: wss:",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),

      // Additional security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },
  preview: {
    headers: {
      // Production CSP (more restrictive)
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.ipify.org",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),

      // Additional security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  }
})
