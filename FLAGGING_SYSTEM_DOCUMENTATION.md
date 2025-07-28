# Sistem Flagging untuk Assessment

## Overview
Sistem flagging memungkinkan user untuk menandai soal-soal tertentu untuk review nanti dan menampilkan progress setiap kategori secara real-time.

## Fitur Utama

### 1. Flag Questions
- **Tombol Flag**: Setiap soal memiliki tombol flag di pojok kanan atas
- **Visual Indicator**: 
  - Unflagged: Icon flag abu-abu
  - Flagged: Icon flag merah dengan background merah muda
- **Toggle Functionality**: Klik untuk toggle status flag
- **Tooltip**: Menampilkan "Flag for review" atau "Remove flag"

### 2. Progress per Kategori
- **Sidebar Display**: Menampilkan progress "answered/total" untuk setiap kategori
- **Format**: Contoh "3/10" untuk kategori Realistic
- **Real-time Update**: Progress diupdate secara otomatis saat user menjawab soal

### 3. Quick Navigation dengan Flag Indicator
- **Grid Navigation**: Grid 5x5 untuk navigasi cepat ke soal tertentu
- **Flag Indicator**: Icon flag kecil di pojok kanan atas nomor soal yang di-flag
- **Visual Feedback**: 
  - Soal terjawab: Background gelap
  - Soal belum terjawab: Background putih
  - Soal di-flag: Icon flag merah kecil

### 4. Persistence
- **Auto-save**: Flag status disimpan otomatis ke localStorage
- **Key**: `assessmentFlaggedQuestions`
- **Format**: `{ "via_realistic_0": true, "riasec_artistic_5": true }`
- **Auto-load**: Flag status dimuat saat aplikasi dibuka

## Implementasi Teknis

### 1. State Management (Assessment.jsx)
```javascript
// State untuk flagged questions
const [flaggedQuestions, setFlaggedQuestions] = useState({});

// Function untuk toggle flag
const handleToggleFlag = (questionKey) => {
  const newFlaggedQuestions = {
    ...flaggedQuestions,
    [questionKey]: !flaggedQuestions[questionKey]
  };
  
  // Remove false values to keep object clean
  if (!newFlaggedQuestions[questionKey]) {
    delete newFlaggedQuestions[questionKey];
  }
  
  setFlaggedQuestions(newFlaggedQuestions);
};
```

### 2. Auto-save ke localStorage
```javascript
// Auto-Save flagged questions
useEffect(() => {
  localStorage.setItem('assessmentFlaggedQuestions', JSON.stringify(flaggedQuestions));
}, [flaggedQuestions]);

// Load saved flagged questions
useEffect(() => {
  const savedFlaggedQuestions = localStorage.getItem('assessmentFlaggedQuestions');
  if (savedFlaggedQuestions) {
    try {
      const parsedFlaggedQuestions = JSON.parse(savedFlaggedQuestions);
      setFlaggedQuestions(parsedFlaggedQuestions);
    } catch (error) {
      console.error('Failed to load saved flagged questions:', error);
    }
  }
}, []);
```

### 3. Question Component (AssessmentQuestion.jsx)
```javascript
// Props tambahan untuk flagging
const AssessmentQuestion = ({
  // ... existing props
  isFlagged,
  onToggleFlag
}) => {
  // Flag button di header
  <button
    onClick={() => onToggleFlag && onToggleFlag(questionKey)}
    className={`p-2 rounded-sm transition-all duration-200 ${
      isFlagged
        ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
    }`}
    title={isFlagged ? 'Remove flag' : 'Flag for review'}
  >
    <Flag className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
  </button>
}
```

### 4. Sidebar Enhancement (AssessmentSidebar.jsx)
```javascript
// Function untuk check flag status
const getQuestionFlagStatus = (categoryKey, questionIndex, isReverse = false) => {
  const questionKey = isReverse
    ? `${currentAssessmentType}_${categoryKey}_reverse_${questionIndex}`
    : `${currentAssessmentType}_${categoryKey}_${questionIndex}`;
  return !!flaggedQuestions[questionKey];
};

// Progress display di category header
<span className="text-xs font-semibold text-gray-600">
  {categoryProgress.answered}/{categoryProgress.total}
</span>

// Flag indicator di quick navigation
{isFlagged && (
  <Flag className="absolute -top-1 -right-1 h-3 w-3 text-red-500 fill-current" />
)}
```

## Format Data

### Question Key Format
- Regular questions: `${assessmentType}_${categoryKey}_${questionIndex}`
- Reverse questions: `${assessmentType}_${categoryKey}_reverse_${questionIndex}`

### Contoh:
- `via_wisdomAndKnowledge_0` - VIA assessment, kategori Wisdom and Knowledge, soal pertama
- `riasec_realistic_5` - RIASEC assessment, kategori Realistic, soal keenam
- `bigFive_openness_reverse_1` - Big Five assessment, kategori Openness, reverse question kedua

### localStorage Structure
```json
{
  "assessmentFlaggedQuestions": {
    "via_wisdomAndKnowledge_0": true,
    "riasec_realistic_5": true,
    "bigFive_openness_reverse_1": true
  }
}
```

## User Experience

### 1. Workflow
1. User mengerjakan assessment
2. Jika ada soal yang ingin di-review nanti, klik tombol flag
3. Soal yang di-flag akan ditandai dengan icon flag merah
4. Di sidebar, user bisa melihat progress per kategori (misal: "Realistic 3/10")
5. Di quick navigation grid, soal yang di-flag ditandai dengan icon flag kecil
6. User bisa klik nomor soal di grid untuk langsung ke soal tersebut
7. Flag status tersimpan otomatis dan akan dimuat saat aplikasi dibuka kembali

### 2. Visual Indicators
- **Progress per kategori**: "3/10" di header kategori
- **Flag button**: Icon flag dengan warna berbeda untuk flagged/unflagged
- **Quick navigation**: Icon flag kecil di pojok nomor soal
- **Tooltip**: Informasi tambahan saat hover

### 3. Cleanup
- Flag data dibersihkan otomatis saat assessment selesai disubmit
- Tidak ada flag data yang tertinggal setelah assessment selesai

## Benefits
1. **Better User Experience**: User bisa menandai soal yang perlu di-review
2. **Progress Tracking**: Melihat progress per kategori secara real-time
3. **Quick Navigation**: Navigasi cepat ke soal tertentu dengan visual feedback
4. **Data Persistence**: Flag status tersimpan meskipun browser ditutup
5. **Clean Interface**: Visual indicator yang tidak mengganggu flow assessment
