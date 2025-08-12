# Assessment Flow Logic Documentation

## Overview
Dokumentasi ini menjelaskan logika flow assessment dari mulai hingga mendapatkan hasil, mencakup semua fitur inti dan mekanisme yang terlibat dalam proses assessment AI-Driven Talent Mapping.

## Assessment Structure

### 1. Tiga Jenis Assessment
- **VIA Character Strengths**: 96 pertanyaan, mengukur 24 kekuatan karakter
- **RIASEC Holland Codes**: 60 pertanyaan, mengukur 6 minat karir
- **Big Five Personality**: 44 pertanyaan, mengukur 5 trait kepribadian

### 2. Total Questions: 200 pertanyaan

## Core Flow Logic

### Phase 1: Assessment Initialization
```
1. Load saved progress dari encrypted localStorage
2. Migrate unencrypted data ke encrypted storage
3. Initialize assessment state:
   - answers: {} (semua jawaban)
   - assessmentData: {via: {}, riasec: {}, bigFive: {}}
   - flaggedQuestions: {} (pertanyaan yang di-flag)
   - currentAssessmentType: "via" (mulai dari VIA)
```

### Phase 2: User Input & Real-time Processing
```
handleAnswer(questionKey, value):
1. Update answers state dengan jawaban baru
2. Auto-scroll ke pertanyaan berikutnya (hanya untuk jawaban baru)
3. Trigger auto-save ke encrypted localStorage
4. Real-time score calculation untuk kategori terkait
5. Update completion status untuk assessment
```

### Phase 3: Scoring & Calculation Logic

#### VIA Character Strengths Scoring
```
calculateScores(assessmentType):
1. Iterasi setiap kategori dalam assessment
2. Hitung total score dari semua pertanyaan dalam kategori
3. Handle reverse questions (untuk Big Five)
4. Convert dari skala 1-5 ke skala 0-100:
   score = ((average - 1) / 4) * 100
```

#### Score Transformation untuk API
```
transformAssessmentScores():
1. VIA: Transform kategori scores ke 24 character strengths
2. RIASEC: Direct mapping ke 6 Holland codes
3. Big Five: Direct mapping ke OCEAN traits
4. Calculate industry scores berdasarkan weighted mapping
```

### Phase 4: Auto-Save & Data Persistence
```
Auto-save Mechanism:
1. Encrypted localStorage untuk answers & flagged questions
2. Fallback ke unencrypted storage jika encryption gagal
3. Real-time save setiap ada perubahan jawaban
4. Migration dari unencrypted ke encrypted storage
```

### Phase 5: Progress Tracking
```
Completion Detection:
1. Track completion per assessment type
2. Calculate overall progress percentage
3. Show completion notification ketika semua selesai
4. Enable submit button hanya ketika 100% complete
```

### Phase 6: Assessment Submission
```
handleSubmit():
1. Transform scores ke format API
2. Validate assessment data
3. Submit ke backend via apiService.submitAssessment()
4. Receive jobId untuk tracking
5. Clear saved progress dari storage
6. Navigate ke status page dengan jobId
```

## Advanced Features

### 1. Question Flagging System
```
handleToggleFlag(questionKey):
- Toggle flag status untuk pertanyaan
- Auto-save flagged questions ke encrypted storage
- Visual indicator untuk pertanyaan yang di-flag
```

### 2. Auto-scroll Navigation
```
Auto-scroll Logic:
1. Detect jawaban baru (bukan perubahan jawaban existing)
2. Find next unanswered question dalam urutan
3. Smooth scroll ke pertanyaan berikutnya
4. Improve user experience untuk flow yang natural
```

### 3. Category-based Pagination
```
Navigation System:
- Pagination berdasarkan kategori assessment
- Phase navigation (VIA → RIASEC → Big Five)
- Progress indicator per phase dan overall
```

## Status Tracking & Result Processing

### Phase 7: Assessment Status Monitoring
```
AssessmentStatus Component:
1. Processing Stage (3 detik)
2. Analysis Stage (menunggu WebSocket/polling)
3. Preparing Stage (verifikasi data)
4. Navigate ke results page
```

### Phase 8: Hybrid Notification System
```
Observer Pattern + Fallback Polling:
1. Primary: WebSocket notifications untuk real-time updates
2. Fallback: Polling setiap 3 detik jika WebSocket gagal
3. Data verification sebelum navigation
4. Race condition prevention
```

### Phase 9: Result Generation
```
Backend Processing:
1. Receive assessment data via API
2. AI analysis untuk generate insights
3. Calculate industry compatibility scores
4. Generate career recommendations
5. Create comprehensive report
6. Send WebSocket notification ketika selesai
```

## Data Security & Encryption

### Encryption Features
```
Secure Storage:
1. AES encryption untuk sensitive data
2. Encrypted localStorage untuk answers & flags
3. Fallback ke unencrypted storage jika diperlukan
4. Migration utility untuk upgrade security
```

### Data Validation
```
Validation Logic:
1. Validate semua assessment scores (0-100 range)
2. Ensure semua required fields ada
3. Validate industry scores untuk 24 industri
4. Error handling untuk invalid data
```

## Industry Scoring Algorithm

### Weighted Calculation
```
Industry Score Calculation:
1. RIASEC Contribution: Σ(trait_score × weight)
2. VIA Contribution: Σ(character_strength × weight)  
3. OCEAN Contribution: Σ(personality_trait × weight)
4. Handle inverted traits (e.g., Low Neuroticism)
5. Final Score: (RIASEC + VIA + OCEAN) / categories_count
```

### 24 Industry Mapping
```
Supported Industries:
- Teknologi, Kesehatan, Pendidikan, Keuangan
- Manufaktur, Retail, Konstruksi, Transportasi
- Media, Hukum, Konsultan, Pemerintahan
- Dan 12 industri lainnya dengan weighted mapping
```

## Error Handling & Recovery

### Robust Error Management
```
Error Scenarios:
1. Network failures → Retry mechanism
2. Encryption failures → Fallback storage
3. WebSocket failures → Polling fallback
4. Data corruption → Validation & recovery
5. API errors → User-friendly messages
```

### Data Recovery
```
Recovery Mechanisms:
1. Auto-save prevents data loss
2. Encrypted backup dalam localStorage
3. Migration tools untuk data upgrade
4. Validation untuk data integrity
```

## Performance Optimizations

### Efficient Processing
```
Optimization Features:
1. Real-time calculation tanpa blocking UI
2. Debounced auto-save untuk performance
3. Lazy loading untuk large question sets
4. Efficient state management dengan minimal re-renders
```

### Memory Management
```
Resource Management:
1. Cleanup WebSocket connections
2. Clear intervals dan timeouts
3. Remove event listeners pada unmount
4. Efficient callback management
```

## Integration Points

### API Integration
```
Backend Communication:
1. POST /api/assessment/submit → Submit assessment
2. GET /api/assessment/status/{jobId} → Check status
3. WebSocket notifications untuk real-time updates
4. GET /api/results/{resultId} → Fetch results
```

### Frontend Integration
```
Component Integration:
1. Assessment → AssessmentStatus → Results
2. Global notification handling
3. Secure storage utilities
4. Validation & transformation utilities
```

## Summary

Assessment flow menggunakan arsitektur hybrid yang menggabungkan:
- **Real-time processing** untuk immediate feedback
- **Encrypted storage** untuk data security
- **Observer pattern** dengan fallback polling untuk reliability
- **Comprehensive validation** untuk data integrity
- **Industry-specific scoring** untuk relevant insights

Sistem ini dirancang untuk memberikan pengalaman user yang smooth sambil memastikan data security dan reliability dalam proses assessment yang kompleks.
