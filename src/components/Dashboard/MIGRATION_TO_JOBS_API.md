# Migration to Jobs API

## Overview
Dashboard telah diupdate untuk menggunakan API endpoint `/api/archive/jobs` yang baru, menggantikan endpoint `/api/archive/results` yang lama.

## Changes Made

### 1. API Configuration (`src/config/api.js`)
- Menambahkan endpoint baru: `JOBS: '/api/archive/jobs'`

### 2. API Service (`src/services/apiService.js`)
- **New Method**: `getJobs(params)` - Menggunakan endpoint `/api/archive/jobs`
- **New Method**: `getStatsFromJobs()` - Menghitung statistik dari data jobs
- **Enhanced Parameters**: Support untuk `assessment_name`, `status` filtering yang lebih lengkap

### 3. Dashboard Hook (`src/hooks/useDashboard.js`)
- **Updated**: `fetchResults()` sekarang menggunakan `apiService.getJobs()`
- **Updated**: `fetchStats()` sekarang menggunakan `apiService.getStatsFromJobs()`
- **Enhanced Data Transformation**: Mapping field jobs ke struktur results yang kompatibel

### 4. Results Table (`src/components/Dashboard/components/ResultsTable.jsx`)
- **Enhanced Status Badges**: Support untuk status `processing`, `queued`, `failed`, `completed`
- **New Features**: 
  - Processing time display
  - Retry count information
  - Direct archetype display dari API response
- **Improved Mobile View**: Menampilkan informasi tambahan di mobile

### 5. Stats Cards (`src/components/Dashboard/components/StatsCards.jsx`)
- **New Card**: "Processing" status dengan icon Loader
- **Enhanced**: Support untuk 4 status: completed, processing, failed, token balance

### 6. Dashboard Component (`src/components/Dashboard/Dashboard.jsx`)
- **Updated**: `getStatusCounts()` untuk menghitung semua status (completed, processing, queued, failed)

## New API Response Structure

### Jobs Endpoint Response
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "job_id": "job_12345abcdef",
        "user_id": "uuid",
        "status": "completed|processing|queued|failed",
        "result_id": "uuid",
        "assessment_name": "AI-Driven Talent Mapping",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:32:00.000Z",
        "completed_at": "2024-01-15T10:32:00.000Z",
        "error_message": null,
        "priority": 0,
        "retry_count": 0,
        "max_retries": 3,
        "processing_started_at": "2024-01-15T10:31:00.000Z",
        "archetype": "The Analytical Innovator"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## Benefits

1. **Enhanced Status Tracking**: Lebih banyak status yang dapat dilacak
2. **Direct Archetype Access**: Archetype tersedia langsung tanpa perlu fetch terpisah
3. **Better Processing Info**: Informasi waktu processing dan retry count
4. **Improved Error Handling**: Error message tersedia di response
5. **Enhanced Statistics**: Statistik yang lebih akurat dari data jobs

## Backward Compatibility

- Struktur data internal tetap kompatibel dengan komponen yang ada
- Method lama (`getResults`, `getStats`) masih tersedia sebagai fallback
- UI components dapat menangani kedua struktur data (lama dan baru)

## Testing

Untuk testing, pastikan:
1. API endpoint `/api/archive/jobs` tersedia dan berfungsi
2. Response structure sesuai dengan dokumentasi
3. Semua status (completed, processing, queued, failed) dapat ditangani dengan baik
4. Archetype data ditampilkan dengan benar
5. Processing time dan retry count muncul sesuai kondisi

## Rollback Plan

Jika terjadi masalah, rollback dapat dilakukan dengan:
1. Mengembalikan `fetchResults()` untuk menggunakan `apiService.getResults()`
2. Mengembalikan `fetchStats()` untuk menggunakan `apiService.getStats()`
3. Menghapus field baru dari UI components
