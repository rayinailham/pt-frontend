# Debug Authentication 403 Error

## Problem
API call ke `/api/archive/jobs` mendapat response 403 (Forbidden), yang menandakan masalah authentication.

## Debugging Steps

### 1. Gunakan Debug Panel
Saya telah menambahkan debug panel di Dashboard (hanya muncul di development mode):
- Buka Dashboard
- Klik tombol "🔍 Debug Auth" di pojok kanan bawah
- Klik "Full Auth Check" untuk comprehensive check

### 2. Manual Debug di Browser Console

Buka browser console dan jalankan:

```javascript
// Import debug utilities
import { debugAuth, checkAuthStatus } from './src/utils/authDebug.js';

// Check auth status
debugAuth();

// Test API call
checkAuthStatus();
```

### 3. Check Authentication Status

#### A. Periksa Token di Cookies
```javascript
// Di browser console
document.cookie.split(';').find(c => c.trim().startsWith('authToken='))
```

#### B. Periksa Axios Headers
```javascript
// Di browser console
console.log(axios.defaults.headers.common['Authorization']);
```

#### C. Periksa User Login Status
```javascript
// Di browser console - check if user is logged in
const userData = document.cookie.split(';').find(c => c.trim().startsWith('userData='));
console.log('User data:', userData);
```

### 4. Common Issues & Solutions

#### Issue 1: Token Tidak Ada
**Symptoms:** Debug panel menunjukkan "❌ Missing" untuk token
**Solution:** User perlu login ulang
```javascript
// Redirect to login
window.location.href = '/auth';
```

#### Issue 2: Token Expired
**Symptoms:** Token ada tapi API call tetap 403
**Solution:** Clear cookies dan login ulang
```javascript
// Clear auth cookies
document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
// Then redirect to login
window.location.href = '/auth';
```

#### Issue 3: Axios Headers Tidak Ter-set
**Symptoms:** Token ada di cookies tapi Authorization header tidak ter-set
**Solution:** Refresh page atau set manual
```javascript
// Get token from cookies
const token = document.cookie.split(';').find(c => c.trim().startsWith('authToken='))?.split('=')[1];
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
```

#### Issue 4: Wrong API Base URL
**Symptoms:** Request dikirim ke URL yang salah
**Solution:** Check environment variables
```javascript
// Check current base URL
console.log('Base URL:', axios.defaults.baseURL);
console.log('Expected:', 'https://api.chhrone.web.id');
```

### 5. Server-Side Issues

Jika client-side sudah benar, kemungkinan masalah di server:

#### A. Token Validation
- Server mungkin tidak mengenali format token
- Token signature tidak valid
- Token sudah expired di server

#### B. API Endpoint
- Endpoint `/api/archive/jobs` mungkin belum tersedia
- Endpoint memerlukan permission khusus
- Server configuration issue

### 6. Quick Fix Commands

#### Reset Authentication
```javascript
// Clear all auth data
localStorage.clear();
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
// Reload page
window.location.reload();
```

#### Force Re-login
```javascript
// Redirect to login page
window.location.href = '/auth';
```

### 7. Monitoring

Saya telah menambahkan logging di method `getJobs()` yang akan menampilkan:
- URL yang dipanggil
- Parameters yang dikirim
- Status auth header
- Response status dan error details

Check browser console untuk informasi detail saat API call dilakukan.

### 8. Next Steps

1. **Immediate**: Gunakan debug panel untuk identify masalah
2. **If token missing**: Login ulang
3. **If token exists but 403**: Check server logs atau contact backend team
4. **If persistent**: Fallback ke endpoint lama (`/api/archive/results`)

### 9. Fallback Option

Jika masalah persist, bisa temporary fallback ke API lama:

```javascript
// Di useDashboard.js, ganti:
const response = await apiService.getJobs(params);
// Menjadi:
const response = await apiService.getResults(params);
```
