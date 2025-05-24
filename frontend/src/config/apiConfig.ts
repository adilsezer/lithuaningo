// --- Development URL ---
const devApiUrlEnv = process.env.EXPO_PUBLIC_DEV_API_URL;

const developmentApiUrl = devApiUrlEnv; // Use the .env variable

// --- Production URL ---
const productionApiUrl = process.env.EXPO_PUBLIC_API_URL;

// --- Validation and Export ---
if (__DEV__) {
  if (!developmentApiUrl) {
    console.warn(
      '⚠️ Development API URL is not set. Please define EXPO_PUBLIC_DEV_API_URL in .env.development (e.g., http://YOUR_LOCAL_IP:PORT). Falling back might not work on simulators/devices.',
    );
  }
  console.log(
    `🚀 Using Development API URL: ${developmentApiUrl || 'NOT SET'}`,
  );
} else {
  if (!productionApiUrl) {
    console.error(
      '🚨 Production API URL is not set. Please define EXPO_PUBLIC_API_URL in .env.production.',
    );
  }
  console.log(`✨ Using Production API URL: ${productionApiUrl || 'NOT SET'}`);
}

export const API_URL = (__DEV__ ? developmentApiUrl : productionApiUrl) || ''; // Fallback to empty string if unset after warnings
