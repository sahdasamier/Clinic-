/**
 * Modern Firebase Auth v9+ Configuration
 * Centralized authentication setup
 */

import {
  getAuth as firebaseGetAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  type Auth,
  type User,
  type UserCredential
} from 'firebase/auth';
import { getFirebaseApp } from './config';

let authInstance: Auth | null = null;

/**
 * Initializes and returns Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (authInstance) {
    return authInstance;
  }

  try {
    const app = getFirebaseApp();
    authInstance = firebaseGetAuth(app);

    // Setup emulator in development
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_AUTH_EMULATOR === 'true') {
      const emulatorUrl = import.meta.env.VITE_AUTH_EMULATOR_URL || 'http://localhost:9099';
      
      try {
        connectAuthEmulator(authInstance, emulatorUrl, { disableWarnings: true });
        console.debug(`🔧 Connected to Auth emulator at ${emulatorUrl}`);
      } catch (emulatorError) {
        console.warn('⚠️ Failed to connect to Auth emulator:', emulatorError);
      }
    }

    console.debug('🔐 Firebase Auth initialized');
    return authInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Auth:', error);
    throw error;
  }
}

/**
 * Checks if Auth is initialized
 */
export function isAuthReady(): boolean {
  return authInstance !== null;
}

/**
 * Legacy compatibility - alias for getFirebaseAuth
 */
export const getAuth = getFirebaseAuth;

/**
 * Auth service functions with error handling
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const auth = getFirebaseAuth();
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  },

  /**
   * Create new user with email and password
   */
  async signUp(email: string, password: string): Promise<UserCredential> {
    try {
      const auth = getFirebaseAuth();
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      throw error;
    }
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      console.debug('👋 User signed out');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      console.debug('📧 Password reset email sent');
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      throw error;
    }
  },

  /**
   * Update user password
   */
  async updatePassword(user: User, newPassword: string): Promise<void> {
    try {
      await updatePassword(user, newPassword);
      console.debug('🔐 Password updated');
    } catch (error) {
      console.error('❌ Password update failed:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(user: User, profile: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      await updateProfile(user, profile);
      console.debug('👤 Profile updated');
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  },

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const auth = getFirebaseAuth();
    return auth.currentUser;
  }
};