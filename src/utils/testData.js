// Test data for development and testing

export const mockUser = {
  id: "test-user-123",
  email: "test@example.com",
  token_balance: 5,
  created_at: "2024-01-01T00:00:00Z"
};

export const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export const mockAssessmentResult = {
  id: "result-123",
  user_id: "test-user-123",
  status: "completed",
  created_at: "2024-01-01T12:00:00Z",
  assessment_data: {
    riasec: {
      realistic: 75,
      investigative: 85,
      artistic: 60,
      social: 50,
      enterprising: 70,
      conventional: 55
    },
    ocean: {
      openness: 80,
      conscientiousness: 65,
      extraversion: 55,
      agreeableness: 45,
      neuroticism: 30
    },
    viaIs: {
      creativity: 85,
      curiosity: 78,
      judgment: 70,
      loveOfLearning: 82,
      perspective: 60,
      bravery: 55,
      perseverance: 68,
      honesty: 73,
      zest: 66,
      love: 80,
      kindness: 75,
      socialIntelligence: 65,
      teamwork: 60,
      fairness: 70,
      leadership: 67,
      forgiveness: 58,
      humility: 62,
      prudence: 69,
      selfRegulation: 61,
      appreciationOfBeauty: 50,
      gratitude: 72,
      hope: 77,
      humor: 65,
      spirituality: 55
    }
  },
  persona_profile: [
    {
      title: "The Innovative Analyst",
      description: "You are a creative problem-solver who combines analytical thinking with innovative approaches. Your high investigative and creative scores suggest you excel at understanding complex systems while finding novel solutions.",
      strengths: [
        "Strong analytical and critical thinking skills",
        "High creativity and innovation capacity",
        "Love for learning and continuous improvement",
        "Ability to see patterns and connections others miss"
      ],
      recommendations: [
        "Consider roles in research and development",
        "Pursue opportunities that combine analysis with creativity",
        "Engage in continuous learning and skill development",
        "Seek projects that allow for innovative problem-solving"
      ],
      careerPaths: [
        "Data Scientist",
        "Research Analyst",
        "Product Manager",
        "UX Researcher",
        "Innovation Consultant",
        "Systems Analyst"
      ]
    }
  ]
};

export const mockJobStatus = {
  jobId: "job-123",
  status: "processing",
  progress: 75,
  estimatedTimeRemaining: "1-2 minutes"
};

// Helper functions for testing
export const enableTestMode = () => {
  localStorage.setItem('ATMA_TEST_MODE', 'true');
  localStorage.setItem('token', mockToken);
  localStorage.setItem('user', JSON.stringify(mockUser));
};

export const disableTestMode = () => {
  localStorage.removeItem('ATMA_TEST_MODE');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isTestMode = () => {
  return localStorage.getItem('ATMA_TEST_MODE') === 'true';
};
