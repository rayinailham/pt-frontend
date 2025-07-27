// Debug utility for profile functionality
import apiService from '../services/apiService';

export const debugProfile = async () => {
  try {
    console.log('=== PROFILE DEBUG START ===');
    
    // Test GET profile
    console.log('1. Testing GET /api/auth/profile');
    const getResponse = await apiService.getProfile();
    console.log('GET Response:', JSON.stringify(getResponse, null, 2));
    
    // Test data structure
    if (getResponse.success) {
      const { user, profile } = getResponse.data;
      console.log('User data:', user);
      console.log('Profile data:', profile);
      
      // Check if profile exists
      if (!profile) {
        console.warn('⚠️ Profile data is null/undefined - this might be the issue!');
      } else {
        console.log('✅ Profile data exists');
        console.log('Profile fields:', Object.keys(profile));
      }
    }
    
    console.log('=== PROFILE DEBUG END ===');
    return getResponse;
  } catch (error) {
    console.error('❌ Profile debug error:', error);
    throw error;
  }
};

export const testProfileUpdate = async (testData) => {
  try {
    console.log('=== PROFILE UPDATE TEST START ===');
    console.log('Test data:', testData);
    
    const updateResponse = await apiService.updateProfile(testData);
    console.log('Update Response:', JSON.stringify(updateResponse, null, 2));
    
    // Fetch profile again to verify update
    const verifyResponse = await apiService.getProfile();
    console.log('Verification Response:', JSON.stringify(verifyResponse, null, 2));
    
    console.log('=== PROFILE UPDATE TEST END ===');
    return { updateResponse, verifyResponse };
  } catch (error) {
    console.error('❌ Profile update test error:', error);
    throw error;
  }
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.debugProfile = debugProfile;
  window.testProfileUpdate = testProfileUpdate;
}
