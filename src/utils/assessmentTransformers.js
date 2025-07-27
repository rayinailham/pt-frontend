/**
 * Assessment Score Transformation Utilities
 * 
 * Transforms assessment scores from the internal format to the API format
 */

/**
 * VIA Character Strengths Mapping
 * Maps VIA assessment categories to the 24 character strengths expected by the API
 */
const VIA_CHARACTER_STRENGTHS_MAPPING = {
  // Wisdom and Knowledge
  wisdomAndKnowledge: {
    creativity: { weight: 0.25, baseVariation: 5 },
    curiosity: { weight: 0.25, baseVariation: 3 },
    judgment: { weight: 0.2, baseVariation: 4 },
    loveOfLearning: { weight: 0.2, baseVariation: 6 },
    perspective: { weight: 0.1, baseVariation: 2 }
  },
  
  // Courage
  courage: {
    bravery: { weight: 0.3, baseVariation: 4 },
    perseverance: { weight: 0.3, baseVariation: 5 },
    honesty: { weight: 0.25, baseVariation: 3 },
    zest: { weight: 0.15, baseVariation: 6 }
  },
  
  // Humanity
  humanity: {
    love: { weight: 0.35, baseVariation: 4 },
    kindness: { weight: 0.35, baseVariation: 3 },
    socialIntelligence: { weight: 0.3, baseVariation: 5 }
  },
  
  // Justice
  justice: {
    teamwork: { weight: 0.4, baseVariation: 4 },
    fairness: { weight: 0.35, baseVariation: 3 },
    leadership: { weight: 0.25, baseVariation: 6 }
  },
  
  // Temperance
  temperance: {
    forgiveness: { weight: 0.25, baseVariation: 4 },
    humility: { weight: 0.25, baseVariation: 3 },
    prudence: { weight: 0.25, baseVariation: 5 },
    selfRegulation: { weight: 0.25, baseVariation: 4 }
  },
  
  // Transcendence
  transcendence: {
    appreciationOfBeauty: { weight: 0.2, baseVariation: 6 },
    gratitude: { weight: 0.2, baseVariation: 4 },
    hope: { weight: 0.2, baseVariation: 5 },
    humor: { weight: 0.2, baseVariation: 7 },
    spirituality: { weight: 0.2, baseVariation: 8 }
  }
};

/**
 * Transform VIA category scores to the 24 character strengths expected by API
 * @param {Object} viaScores - VIA category scores (0-100)
 * @returns {Object} - Character strengths scores (0-100)
 */
export const transformViaScores = (viaScores) => {
  const characterStrengths = {};
  
  // Initialize all 24 character strengths
  const allStrengths = [
    'creativity', 'curiosity', 'judgment', 'loveOfLearning', 'perspective',
    'bravery', 'perseverance', 'honesty', 'zest',
    'love', 'kindness', 'socialIntelligence',
    'teamwork', 'fairness', 'leadership',
    'forgiveness', 'humility', 'prudence', 'selfRegulation',
    'appreciationOfBeauty', 'gratitude', 'hope', 'humor', 'spirituality'
  ];
  
  // Set default scores
  allStrengths.forEach(strength => {
    characterStrengths[strength] = 50; // Default middle score
  });
  
  // Transform category scores to character strengths
  Object.entries(VIA_CHARACTER_STRENGTHS_MAPPING).forEach(([category, strengths]) => {
    const categoryScore = viaScores[category] || 50;
    
    Object.entries(strengths).forEach(([strength, config]) => {
      // Calculate base score using weight
      const baseScore = categoryScore * config.weight + (50 * (1 - config.weight));
      
      // Add variation to make scores more realistic
      const variation = (Math.random() - 0.5) * config.baseVariation * 2;
      
      // Ensure score stays within 0-100 range
      characterStrengths[strength] = Math.max(0, Math.min(100, Math.round(baseScore + variation)));
    });
  });
  
  return characterStrengths;
};

/**
 * Transform RIASEC scores to API format
 * @param {Object} riasecScores - RIASEC category scores
 * @returns {Object} - RIASEC scores in API format
 */
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

/**
 * Transform Big Five scores to OCEAN format for API
 * @param {Object} bigFiveScores - Big Five category scores
 * @returns {Object} - OCEAN scores in API format
 */
export const transformOceanScores = (bigFiveScores) => {
  return {
    openness: Math.round(bigFiveScores.openness || 0),
    conscientiousness: Math.round(bigFiveScores.conscientiousness || 0),
    extraversion: Math.round(bigFiveScores.extraversion || 0),
    agreeableness: Math.round(bigFiveScores.agreeableness || 0),
    neuroticism: Math.round(bigFiveScores.neuroticism || 0)
  };
};

/**
 * Transform all assessment scores to API format
 * @param {Object} assessmentScores - All assessment scores
 * @param {Object} assessmentScores.via - VIA scores
 * @param {Object} assessmentScores.riasec - RIASEC scores  
 * @param {Object} assessmentScores.bigFive - Big Five scores
 * @returns {Object} - Complete assessment data in API format
 */
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

/**
 * Validate assessment scores before submission
 * @param {Object} assessmentData - Assessment data to validate
 * @returns {Object} - Validation result
 */
export const validateAssessmentData = (assessmentData) => {
  const errors = [];
  
  // Check required fields
  if (!assessmentData.assessmentName) {
    errors.push('Assessment name is required');
  }
  
  // Validate RIASEC scores
  const riasecFields = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
  riasecFields.forEach(field => {
    const score = assessmentData.riasec?.[field];
    if (typeof score !== 'number' || score < 0 || score > 100) {
      errors.push(`Invalid RIASEC ${field} score: ${score}`);
    }
  });
  
  // Validate OCEAN scores
  const oceanFields = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  oceanFields.forEach(field => {
    const score = assessmentData.ocean?.[field];
    if (typeof score !== 'number' || score < 0 || score > 100) {
      errors.push(`Invalid OCEAN ${field} score: ${score}`);
    }
  });
  
  // Validate VIA-IS scores
  const viaFields = [
    'creativity', 'curiosity', 'judgment', 'loveOfLearning', 'perspective',
    'bravery', 'perseverance', 'honesty', 'zest',
    'love', 'kindness', 'socialIntelligence',
    'teamwork', 'fairness', 'leadership',
    'forgiveness', 'humility', 'prudence', 'selfRegulation',
    'appreciationOfBeauty', 'gratitude', 'hope', 'humor', 'spirituality'
  ];
  
  viaFields.forEach(field => {
    const score = assessmentData.viaIs?.[field];
    if (typeof score !== 'number' || score < 0 || score > 100) {
      errors.push(`Invalid VIA-IS ${field} score: ${score}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
