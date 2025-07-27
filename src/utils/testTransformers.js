/**
 * Manual test script for assessment transformers
 * Run this in the browser console to test the transformation logic
 */

import { transformAssessmentScores, validateAssessmentData } from './assessmentTransformers.js';

// Sample assessment scores (similar to what would come from AssessmentForm)
const sampleAssessmentScores = {
  via: {
    wisdomAndKnowledge: 80,
    courage: 70,
    humanity: 85,
    justice: 75,
    temperance: 65,
    transcendence: 60
  },
  riasec: {
    realistic: 75,
    investigative: 80,
    artistic: 65,
    social: 70,
    enterprising: 85,
    conventional: 60
  },
  bigFive: {
    openness: 80,
    conscientiousness: 75,
    extraversion: 70,
    agreeableness: 85,
    neuroticism: 40
  }
};

// Test the transformation
console.log('🧪 Testing Assessment Transformers...');
console.log('📊 Input scores:', sampleAssessmentScores);

try {
  const transformedData = transformAssessmentScores(sampleAssessmentScores);
  console.log('✅ Transformation successful!');
  console.log('📤 Transformed data:', transformedData);
  
  // Validate the transformed data
  const validation = validateAssessmentData(transformedData);
  console.log('🔍 Validation result:', validation);
  
  if (validation.isValid) {
    console.log('✅ Validation passed! Data is ready for API submission.');
    
    // Check structure
    console.log('📋 Data structure check:');
    console.log('- Assessment name:', transformedData.assessmentName);
    console.log('- RIASEC fields:', Object.keys(transformedData.riasec));
    console.log('- OCEAN fields:', Object.keys(transformedData.ocean));
    console.log('- VIA-IS fields count:', Object.keys(transformedData.viaIs).length);
    console.log('- VIA-IS fields:', Object.keys(transformedData.viaIs));
    
    // Sample scores
    console.log('📊 Sample scores:');
    console.log('- RIASEC realistic:', transformedData.riasec.realistic);
    console.log('- OCEAN openness:', transformedData.ocean.openness);
    console.log('- VIA-IS creativity:', transformedData.viaIs.creativity);
    console.log('- VIA-IS leadership:', transformedData.viaIs.leadership);
    
  } else {
    console.error('❌ Validation failed:', validation.errors);
  }
  
} catch (error) {
  console.error('❌ Transformation failed:', error);
}

// Export for use in browser console
window.testAssessmentTransformers = () => {
  console.log('🧪 Running assessment transformer test...');
  
  try {
    const result = transformAssessmentScores(sampleAssessmentScores);
    const validation = validateAssessmentData(result);
    
    return {
      success: true,
      transformedData: result,
      validation: validation,
      summary: {
        assessmentName: result.assessmentName,
        riasecFields: Object.keys(result.riasec).length,
        oceanFields: Object.keys(result.ocean).length,
        viaIsFields: Object.keys(result.viaIs).length,
        isValid: validation.isValid
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

console.log('🎯 Test function available as: window.testAssessmentTransformers()');
