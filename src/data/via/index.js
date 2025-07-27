// VIA Data Barrel Export
export { viaCategories, strengthLabels, viaExplanation } from './viaCategories';
export { viaStrengthsData } from './viaStrengths';

// Utility functions for VIA data
export const getStrengthDescription = (strength, viaStrengthsData) => {
  // Try multiple variations to find the description
  const variations = [
    strength,
    strength.replace(/_/g, ' '),
    strength.replace(/_/g, ''),
    strength.toLowerCase(),
    strength.replace(/_/g, ' ').toLowerCase(),
    // Add camelCase variations
    strength.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
    // Specific mappings
    strength === 'loveOfLearning' ? 'love_of_learning' : null,
    strength === 'socialIntelligence' ? 'social_intelligence' : null,
    strength === 'selfRegulation' ? 'self_regulation' : null,
    strength === 'appreciationOfBeauty' ? 'appreciation_of_beauty' : null
  ].filter(Boolean);

  for (const variation of variations) {
    if (viaStrengthsData[variation]?.description) {
      return viaStrengthsData[variation].description;
    }
  }

  return 'A valuable character strength';
};

// Score level utility function
export const getScoreLevel = (score) => {
  if (score >= 4.0) return {
    level: 'Signature Strength',
    intensity: 'text-emerald-700 font-semibold',
    bg: 'bg-emerald-50 border-emerald-200',
    description: 'Skor 4.0-5.0: Kekuatan karakter utama yang sangat menonjol',
    color: '#059669'
  };
  if (score >= 3.5) return {
    level: 'High Strength',
    intensity: 'text-blue-700 font-semibold',
    bg: 'bg-blue-50 border-blue-200',
    description: 'Skor 3.5-3.9: Kekuatan karakter yang tinggi',
    color: '#1d4ed8'
  };
  if (score >= 2.5) return {
    level: 'Moderate Strength',
    intensity: 'text-slate-700 font-medium',
    bg: 'bg-slate-50 border-slate-200',
    description: 'Skor 2.5-3.4: Kekuatan karakter yang moderat',
    color: '#475569'
  };
  if (score >= 1.5) return {
    level: 'Lower Strength',
    intensity: 'text-amber-700 font-medium',
    bg: 'bg-amber-50 border-amber-200',
    description: 'Skor 1.5-2.4: Kekuatan karakter yang rendah',
    color: '#d97706'
  };
  return {
    level: 'Development Area',
    intensity: 'text-rose-700 font-medium',
    bg: 'bg-rose-50 border-rose-200',
    description: 'Skor 0.0-1.4: Area yang membutuhkan pengembangan',
    color: '#e11d48'
  };
};

// VIA insights utility function
export const getViaIsInsights = (viaIsData, viaCategories, strengthLabels) => {
  if (!viaIsData) return { top: [], bottom: [], byCategory: {} };

  // Create a more flexible mapping for field names with scale conversion
  const getStrengthValue = (data, strengthKey) => {
    const variations = [
      strengthKey,
      strengthKey.replace(/_/g, ' '),
      strengthKey.replace(/_/g, ''),
      strengthKey.toLowerCase(),
      strengthKey.replace(/_/g, ' ').toLowerCase(),
      // Add camelCase variations for backend compatibility
      strengthKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      // Specific mappings for problematic fields
      strengthKey === 'love_of_learning' ? 'loveOfLearning' : null,
      strengthKey === 'social_intelligence' ? 'socialIntelligence' : null,
      strengthKey === 'self_regulation' ? 'selfRegulation' : null,
      strengthKey === 'appreciation_of_beauty' ? 'appreciationOfBeauty' : null
    ].filter(Boolean);

    for (const variation of variations) {
      if (data[variation] !== undefined) {
        // Convert from 0-100 scale to 0-5 scale for display
        const rawValue = data[variation];
        return rawValue / 20; // Convert 0-100 to 0-5
      }
    }
    return 0;
  };

  // Build entries from all defined strengths
  const allStrengths = Object.values(viaCategories).flatMap(cat => cat.strengths);
  const entries = allStrengths.map(strength => [
    strength,
    getStrengthValue(viaIsData, strength)
  ]).sort(([,a], [,b]) => b - a);

  // Group by categories
  const byCategory = {};
  Object.entries(viaCategories).forEach(([categoryKey, category]) => {
    byCategory[categoryKey] = category.strengths.map(strength => ({
      strength,
      score: getStrengthValue(viaIsData, strength),
      label: strengthLabels[strength]
    }));
  });

  return {
    top: entries.slice(0, 5),
    bottom: entries.slice(-5),
    byCategory
  };
};
