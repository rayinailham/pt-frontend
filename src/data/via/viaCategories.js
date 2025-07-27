// VIA Character Strengths organized by virtue categories
export const viaCategories = {
  wisdom: {
    name: 'Wisdom & Knowledge',
    color: '#475569',
    accentColor: '#475569',
    strengths: ['creativity', 'curiosity', 'judgment', 'loveOfLearning', 'perspective']
  },
  courage: {
    name: 'Courage',
    color: '#475569',
    accentColor: '#475569',
    strengths: ['bravery', 'perseverance', 'honesty', 'zest']
  },
  humanity: {
    name: 'Humanity',
    color: '#475569',
    accentColor: '#475569',
    strengths: ['love', 'kindness', 'socialIntelligence']
  },
  justice: {
    name: 'Justice',
    color: '#475569',
    accentColor: '#475569',
    strengths: ['teamwork', 'fairness', 'leadership']
  },
  temperance: {
    name: 'Temperance',
    color: '#475569',
    accentColor: '#475569',
    strengths: ['forgiveness', 'humility', 'prudence', 'selfRegulation']
  },
  transcendence: {
    name: 'Transcendence',
    color: '#475569',
    accentColor: '#475569',
    strengths: ['appreciationOfBeauty', 'gratitude', 'hope', 'humor', 'spirituality']
  }
};

// Strength labels mapping
export const strengthLabels = {
  creativity: 'Creativity',
  curiosity: 'Curiosity',
  judgment: 'Critical Thinking',
  loveOfLearning: 'Love of Learning',
  love_of_learning: 'Love of Learning', // Alternative mapping
  'love of learning': 'Love of Learning', // Alternative mapping
  perspective: 'Perspective',
  bravery: 'Bravery',
  perseverance: 'Perseverance',
  honesty: 'Honesty',
  zest: 'Zest',
  love: 'Love',
  kindness: 'Kindness',
  socialIntelligence: 'Social Intelligence',
  social_intelligence: 'Social Intelligence', // Alternative mapping
  'social intelligence': 'Social Intelligence', // Alternative mapping
  teamwork: 'Teamwork',
  fairness: 'Fairness',
  leadership: 'Leadership',
  forgiveness: 'Forgiveness',
  humility: 'Humility',
  prudence: 'Prudence',
  selfRegulation: 'Self-Regulation',
  self_regulation: 'Self-Regulation', // Alternative mapping
  'self regulation': 'Self-Regulation', // Alternative mapping
  appreciationOfBeauty: 'Appreciation of Beauty',
  appreciation_of_beauty: 'Appreciation of Beauty', // Alternative mapping
  'appreciation of beauty': 'Appreciation of Beauty', // Alternative mapping
  gratitude: 'Gratitude',
  hope: 'Hope',
  humor: 'Humor',
  spirituality: 'Spirituality'
};

// VIA explanation data
export const viaExplanation = {
  title: "VIA Character Strengths Survey",
  description: "VIA (Values in Action) Survey mengidentifikasi kekuatan karakter yang merupakan inti dari kepribadian positif. Survey ini mengukur 24 kekuatan karakter yang diorganisir ke dalam 6 kategori kebajikan universal.",
  developer: "Dikembangkan oleh Dr. Christopher Peterson dan Dr. Martin Seligman (2004) berdasarkan penelitian lintas budaya",
  validity: "Telah divalidasi secara ilmiah di lebih dari 190 negara dengan jutaan responden. Instrumen ini digunakan secara luas dalam psikologi positif dan pengembangan karakter.",
  purpose: "Mengidentifikasi kekuatan karakter signature Anda yang dapat digunakan untuk meningkatkan kesejahteraan, kinerja, dan kepuasan hidup.",
  dimensions: Object.entries(viaCategories).map(([key, category]) => ({
    key,
    name: category.name,
    description: `${category.strengths.length} kekuatan karakter`,
    icon: category.icon
  }))
};
