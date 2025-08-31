/**
 * Environment Configuration
 * Handles environment variables and configuration
 */

interface EnvironmentConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'test';
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  api: {
    baseUrl: string;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    console.warn(`Environment variable ${key} is not defined`);
    return '';
  }
  return value;
}

/**
 * Validate required environment variables
 */
function validateRequiredEnvVars(): void {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    console.warn('Some features may not work properly without proper Firebase configuration');
  }
}

/**
 * Create environment configuration
 */
export function createEnvironmentConfig(): EnvironmentConfig {
  validateRequiredEnvVars();
  
  return {
    app: {
      name: getEnvVar('VITE_APP_NAME', 'Clinic Management System'),
      version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
      environment: (getEnvVar('VITE_APP_ENV', 'development') as 'development' | 'production' | 'test')
    },
    firebase: {
      apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'demo-api-key'),
      authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'demo-project.firebaseapp.com'),
      projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'demo-project'),
      storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'demo-project.appspot.com'),
      messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789'),
      appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:123456789:web:demo'),
      measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID')
    },
    api: {
      baseUrl: getEnvVar('VITE_API_BASE_URL', '/api')
    }
  };
}

/**
 * Get current environment configuration
 */
export const env = createEnvironmentConfig();

/**
 * Check if running in development mode
 */
export const isDevelopment = env.app.environment === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.app.environment === 'production';

/**
 * Export environment for external use
 */
export default env;