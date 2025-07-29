# Auto Scroll Feature Implementation

## Overview
Implementasi fitur auto scroll down ke soal selanjutnya ketika user menjawab pertanyaan pada komponen Assessment.

## Requirements
- Auto scroll hanya terjadi ketika user menjawab soal yang **belum ada jawabannya** (jawaban baru)
- Jika user mengganti jawaban soal yang sudah dijawab sebelumnya, **tidak ada auto scroll**
- Scroll menuju ke soal selanjutnya yang belum dijawab

## Implementation Details

### Files Modified
1. `src/components/Assessment/Assessment.jsx`
2. `src/components/Assessment/AssessmentForm.jsx`

### Key Functions Added

#### 1. `getAllQuestionKeysInOrder()`
- Menghasilkan array semua questionKeys sesuai urutan rendering
- Mengikuti struktur: `${assessmentType}_${categoryKey}_${index}` dan `${assessmentType}_${categoryKey}_reverse_${index}`

#### 2. `findNextUnansweredQuestion(currentQuestionKey, allQuestionKeys, answers)`
- Mencari soal selanjutnya yang belum dijawab setelah soal yang baru dijawab
- Return `null` jika tidak ada soal yang belum dijawab

#### 3. `scrollToQuestion(questionKey)`
- Melakukan smooth scroll ke question dengan ID `question-${questionKey}`
- Menggunakan `scrollIntoView` dengan `behavior: 'smooth'` dan `block: 'center'`
- Delay 100ms untuk memastikan DOM sudah terupdate

### Modified Functions

#### `handleAnswer()` in Assessment.jsx
```javascript
const handleAnswer = (questionKey, value) => {
  // Check if this is a new answer (not changing existing answer)
  const isNewAnswer = answers[questionKey] === undefined;
  
  const newAnswers = {
    ...answers,
    [questionKey]: value
  };
  setAnswers(newAnswers);

  // Auto scroll to next unanswered question only for new answers
  if (isNewAnswer) {
    const allQuestionKeys = getAllQuestionKeysInOrder();
    const nextUnansweredQuestion = findNextUnansweredQuestion(questionKey, allQuestionKeys, newAnswers);
    
    if (nextUnansweredQuestion) {
      scrollToQuestion(nextUnansweredQuestion);
    }
  }
};
```

#### `handleAnswerChange()` in AssessmentForm.jsx
Similar implementation dengan logic yang sama.

## Behavior
1. **Jawaban Baru**: User menjawab soal yang belum pernah dijawab → Auto scroll ke soal selanjutnya yang belum dijawab
2. **Ubah Jawaban**: User mengubah jawaban soal yang sudah dijawab → Tidak ada auto scroll
3. **Soal Terakhir**: Jika tidak ada soal selanjutnya yang belum dijawab → Tidak ada scroll

## Technical Notes
- Menggunakan `element.scrollIntoView()` dengan smooth behavior
- Scroll position: `block: 'center'` untuk posisi optimal
- Delay 100ms untuk memastikan state sudah terupdate sebelum scroll
- Compatible dengan mobile dan desktop view
- Tidak mengganggu existing scroll behavior saat navigasi kategori

## Testing
1. Buka assessment page
2. Jawab soal pertama → Should auto scroll to next unanswered question
3. Ubah jawaban soal pertama → Should NOT auto scroll
4. Lanjutkan menjawab soal → Should continue auto scrolling for new answers only
