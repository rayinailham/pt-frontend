# Assessment Processing Logic - ATMA Frontend

## Overview
Dokumentasi ini menjelaskan alur logika pemrosesan Assessment dari handling user input sampai mengirim data ke API dalam aplikasi AI-Driven Talent Mapping Assessment (ATMA).

## Struktur Komponen

### 1. AssessmentFlow (Parent Component)
- **File**: `src/components/Assessment/AssessmentFlow.jsx`
- **Fungsi**: Mengatur alur assessment, mengelola state global, dan koordinasi antar komponen
- **State Management**:
  ```javascript
  const [assessmentData, setAssessmentData] = useState({
    via: {},
    riasec: {},
    bigFive: {}
  });
  const [completionStatus, setCompletionStatus] = useState({
    via: false,
    riasec: false,
    bigFive: false
  });
  ```

### 2. Individual Assessment Components
- **ViaAssessment**: Character Strengths (96 questions)
- **RiasecAssessment**: Career Interests (60 questions)  
- **BigFiveAssessment**: Personality Traits (44 questions)

## Alur Pemrosesan Data

### Step 1: User Input Handling

#### Radio Button Selection
```javascript
// Di setiap assessment component (contoh: ViaAssessment.jsx)
const handleAnswer = (value) => {
  const newAnswers = {
    ...answers,
    [currentQuestion.id]: value
  };
  setAnswers(newAnswers);
};

// Event handler pada UI
<input
  type="radio"
  value={option.value}
  checked={answers[currentQuestion.id] === option.value}
  onChange={() => handleAnswer(option.value)}
/>
```

**Proses:**
1. User memilih jawaban pada radio button
2. `handleAnswer()` dipanggil dengan nilai jawaban
3. State `answers` diupdate dengan format `{questionId: value}`
4. Jawaban disimpan dalam skala 1-5

### Step 2: Auto-Save ke localStorage

```javascript
// Automatic persistence
useEffect(() => {
  if (Object.keys(answers).length > 0) {
    localStorage.setItem('viaAssessmentAnswers', JSON.stringify(answers));
  }
}, [answers]);

// Load saved answers on component mount
useEffect(() => {
  const savedAnswers = localStorage.getItem('viaAssessmentAnswers');
  if (savedAnswers && Object.keys(data || {}).length === 0) {
    const parsedAnswers = JSON.parse(savedAnswers);
    setAnswers(parsedAnswers);
  }
}, [data]);
```

**Fitur:**
- Otomatis menyimpan setiap perubahan jawaban
- Memuat jawaban tersimpan saat komponen dimount
- Mencegah kehilangan data saat refresh browser

### Step 3: Real-time Score Calculation

```javascript
const calculateCategoryScores = () => {
  const categoryScores = {};
  
  Object.keys(viaQuestions.categories).forEach(categoryKey => {
    const categoryAnswers = Object.entries(answers)
      .filter(([questionId]) => questionId.startsWith(categoryKey))
      .map(([, answer]) => answer);
    
    if (categoryAnswers.length > 0) {
      const average = categoryAnswers.reduce((sum, answer) => sum + answer, 0) / categoryAnswers.length;
      // Convert from 1-5 scale to 0-100 scale
      categoryScores[categoryKey] = Math.round(((average - 1) / 4) * 100);
    } else {
      categoryScores[categoryKey] = 0;
    }
  });
  
  return categoryScores;
};
```

**Proses Kalkulasi:**
1. Grup jawaban berdasarkan kategori
2. Hitung rata-rata jawaban per kategori
3. Konversi dari skala 1-5 ke skala 0-100
4. Return object dengan skor per kategori

### Step 4: Update ke Parent Component

```javascript
useEffect(() => {
  if (isActive) {
    // Calculate scores and update parent
    const scores = calculateCategoryScores();
    onUpdate(scores, isComplete);
  }
}, [answers, isComplete, isActive]);
```

**Callback ke AssessmentFlow:**
```javascript
const handleAssessmentUpdate = (type, data, isComplete) => {
  setAssessmentData(prev => ({
    ...prev,
    [type]: data
  }));

  setCompletionStatus(prev => ({
    ...prev,
    [type]: isComplete
  }));
};
```

### Step 5: Progress Tracking

```javascript
// Calculate overall progress
const calculateOverallProgress = () => {
  let totalAnswered = 0;
  Object.entries(assessmentData).forEach(([type, data]) => {
    if (data && typeof data === 'object') {
      totalAnswered += Object.keys(data).length;
    }
  });
  return totalAnswered;
};

// Check completion status
const isAllComplete = completionStatus.via && completionStatus.riasec && completionStatus.bigFive;
```

### Step 6: Data Transformation untuk API

**File**: `src/utils/assessmentTransformers.js`

```javascript
export const transformAssessmentScores = (assessmentScores) => {
  const { via, riasec, bigFive } = assessmentScores;
  
  if (!via || !riasec || !bigFive) {
    throw new Error('All assessments must be completed');
  }

  return {
    assessmentName: "AI-Driven Talent Mapping",
    riasec: transformRiasecScores(riasec),
    ocean: transformOceanScores(bigFive),
    viaIs: transformViaScores(via)
  };
};
```

**Transformasi Spesifik:**

#### RIASEC Scores
```javascript
export const transformRiasecScores = (riasecScores) => {
  return {
    realistic: Math.round(riasecScores.realistic || 0),
    investigative: Math.round(riasecScores.investigative || 0),
    artistic: Math.round(riasecScores.artistic || 0),
    social: Math.round(riasecScores.social || 0),
    enterprising: Math.round(riasecScores.enterprising || 0),
    conventional: Math.round(riasecScores.conventional || 0)
  };
};
```

#### Big Five (OCEAN) Scores
```javascript
export const transformOceanScores = (bigFiveScores) => {
  return {
    openness: Math.round(bigFiveScores.openness || 0),
    conscientiousness: Math.round(bigFiveScores.conscientiousness || 0),
    extraversion: Math.round(bigFiveScores.extraversion || 0),
    agreeableness: Math.round(bigFiveScores.agreeableness || 0),
    neuroticism: Math.round(bigFiveScores.neuroticism || 0)
  };
};
```

#### VIA Character Strengths
```javascript
export const transformViaScores = (viaScores) => {
  const characterStrengths = {};
  
  // Transform category scores to individual character strengths
  Object.entries(VIA_CHARACTER_STRENGTHS_MAPPING).forEach(([category, strengths]) => {
    const categoryScore = viaScores[category] || 50;
    
    Object.entries(strengths).forEach(([strength, config]) => {
      const baseScore = categoryScore * config.weight + (50 * (1 - config.weight));
      const variation = (Math.random() - 0.5) * config.baseVariation * 2;
      characterStrengths[strength] = Math.max(0, Math.min(100, Math.round(baseScore + variation)));
    });
  });
  
  return characterStrengths;
};
```

### Step 7: API Submission

```javascript
const handleSubmit = async () => {
  setIsSubmitting(true);
  setSubmitError(null);

  try {
    // Transform scores to API format
    const transformedData = transformAssessmentScores(assessmentData);
    
    // Submit to API
    const response = await apiService.submitAssessment(transformedData);
    
    // Clear saved progress
    localStorage.removeItem('assessmentProgress');
    localStorage.removeItem('viaAssessmentAnswers');
    localStorage.removeItem('riasecAssessmentAnswers');
    localStorage.removeItem('bigFiveAssessmentAnswers');

    // Navigate to status page
    navigate(`/assessment/status/${response.job_id}`);
  } catch (error) {
    console.error('Assessment submission error:', error);
    setSubmitError(error.response?.data?.message || 'Failed to submit assessment');
  } finally {
    setIsSubmitting(false);
  }
};
```

**API Service** (`src/services/apiService.js`):
```javascript
async submitAssessment(assessmentData) {
  try {
    const response = await axios.post(API_ENDPOINTS.ASSESSMENT.SUBMIT, assessmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

## Format Data API

### Request Format
```json
{
  "assessmentName": "AI-Driven Talent Mapping",
  "riasec": {
    "realistic": 75,
    "investigative": 80,
    "artistic": 65,
    "social": 90,
    "enterprising": 70,
    "conventional": 60
  },
  "ocean": {
    "openness": 80,
    "conscientiousness": 75,
    "extraversion": 85,
    "agreeableness": 90,
    "neuroticism": 40
  },
  "viaIs": {
    "creativity": 80,
    "curiosity": 85,
    "judgment": 75,
    "love_of_learning": 90,
    "perspective": 70,
    // ... 24 character strengths total
  }
}
```

### Response Format
```json
{
  "job_id": "uuid-string",
  "status": "processing",
  "message": "Assessment submitted successfully"
}
```

## Error Handling

### Validation
- Memastikan semua assessment completed sebelum submit
- Validasi format data sebelum transformasi
- Error handling untuk API calls

### User Feedback
```javascript
{submitError && (
  <ErrorMessage 
    message={submitError} 
    onDismiss={() => setSubmitError(null)} 
  />
)}
```

### Loading States
```javascript
{isSubmitting ? (
  <>
    <LoadingSpinner size="sm" className="mr-2" />
    Submitting Assessment...
  </>
) : (
  <>
    <Send className="w-4 h-4 mr-2" />
    Submit Assessment
  </>
)}
```

## Fitur Tambahan

### Navigation
- Tab-based navigation antar assessment
- Progress tracking visual
- Quick navigation ke pertanyaan spesifik

### Persistence
- Auto-save ke localStorage
- Resume assessment dari progress tersimpan
- Clear data setelah successful submission

### Responsive Design
- Mobile-friendly interface
- Adaptive layout untuk berbagai screen size
- Touch-friendly controls

## Kesimpulan

Sistem assessment ini dirancang dengan:
1. **Real-time processing** - Kalkulasi skor otomatis
2. **Data persistence** - Auto-save untuk mencegah data loss
3. **Progressive enhancement** - Dapat digunakan step-by-step
4. **Error resilience** - Comprehensive error handling
5. **User experience** - Smooth navigation dan feedback

Alur data mengikuti pola: **Input → Validation → Calculation → Aggregation → Transformation → API Submission → Navigation**
