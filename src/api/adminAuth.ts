import React from 'react';
import { User } from 'firebase/auth';
import { initializeApp, getApp, deleteApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  Auth as FirebaseAuth
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { firebaseConfig, db, auth } from './firebase';
import { SUPER_ADMIN_EMAILS } from '../utils/adminConfig';

/**
 * Interface for admin claims from Firebase token
 */
interface AdminClaims {
  admin?: boolean;
  role?: string;
}

/**
 * Interface for user creation data
 */
export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'management' | 'doctor' | 'receptionist';
  clinicId: string;
}

/**
 * Result of user creation operation
 */
export interface CreateUserResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Check if the current user is authenticated as an admin
 * This verifies both custom claims and super admin emails
 */
export const verifyAdminAuthentication = async (): Promise<{ isAdmin: boolean; error?: string }> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      return { isAdmin: false, error: 'User not authenticated' };
    }

    const user = auth.currentUser;
    const email = user.email?.toLowerCase() || '';
    
    // Check super admin emails first (fallback)
    if (SUPER_ADMIN_EMAILS.includes(email)) {
      console.log('✅ Admin verified via super admin email:', email);
      return { isAdmin: true };
    }

    // Check custom claims
    try {
      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims as AdminClaims;
      
      if (claims.admin === true) {
        console.log('✅ Admin verified via custom claims:', email);
        return { isAdmin: true };
      }
    } catch (claimsError) {
      console.warn('⚠️ Could not verify custom claims:', claimsError);
      // Continue to check email as fallback
    }

    return { isAdmin: false, error: 'User does not have admin privileges' };
  } catch (error: any) {
    console.error('❌ Error verifying admin authentication:', error);
    return { isAdmin: false, error: error.message || 'Failed to verify admin status' };
  }
};

/**
 * Create a secondary Firebase app for user creation
 * This prevents the new user creation from affecting the admin's session
 */
const createSecondaryApp = async (): Promise<{ app: FirebaseApp; auth: FirebaseAuth }> => {
  const secondaryAppName = 'Secondary';
  
  try {
    // Try to get existing app and delete it first to prevent conflicts
    const existingApp = getApp(secondaryAppName);
    await deleteApp(existingApp);
  } catch {
    // App doesn't exist, which is fine
  }
  
  // Create fresh secondary app
  const secApp = initializeApp(firebaseConfig, secondaryAppName);
  const secAuth = getAuth(secApp);
  
  console.log('🔧 Created secondary Firebase app');
  return { app: secApp, auth: secAuth };
};

/**
 * Clean up secondary Firebase app
 */
const cleanupSecondaryApp = async (app: FirebaseApp, auth: FirebaseAuth): Promise<void> => {
  try {
    // Sign out any user from secondary auth
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }
    
    // Delete the secondary app
    await deleteApp(app);
    console.log('🧹 Cleaned up secondary Firebase app');
  } catch (error) {
    console.warn('⚠️ Warning: Could not fully cleanup secondary app:', error);
  }
};

/**
 * Create a new user using secondary Firebase app
 * This ensures the admin remains logged in on the primary app
 */
export const createUserWithSecondaryApp = async (userData: CreateUserData): Promise<CreateUserResult> => {
  // First verify admin authentication
  const adminCheck = await verifyAdminAuthentication();
  if (!adminCheck.isAdmin) {
    return { 
      success: false, 
      error: adminCheck.error || 'Admin authentication required' 
    };
  }

  let secondaryApp: FirebaseApp | null = null;
  let secondaryAuth: FirebaseAuth | null = null;

  try {
    console.log('🔧 Starting secure user creation for:', userData.email);
    
    // Create secondary Firebase app
    const secondary = await createSecondaryApp();
    secondaryApp = secondary.app;
    secondaryAuth = secondary.auth;

    // Create user in secondary auth context
    console.log('📧 Creating Firebase Auth account...');
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      userData.email.trim().toLowerCase(), 
      userData.password
    );

    const newUser = userCredential.user;
    console.log('✅ Firebase Auth account created:', newUser.uid);

    // Update display name
    await updateProfile(newUser, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });

    // ⚠️ IMPORTANT: Use PRIMARY app for Firestore operations (admin context)
    // This ensures the write operation uses the admin's credentials/claims
    // so that Firestore security rules recognize the admin privileges
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Admin session expired during user creation');
    }

    console.log('💾 Creating Firestore user document with admin credentials...');
    const userDoc = {
      email: userData.email.trim().toLowerCase(),
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      role: userData.role,
      clinicId: userData.clinicId,
      isActive: true,
      password: userData.password, // WARNING: Storing for admin visibility - security risk
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: currentUser.email || currentUser.uid
    };

    await setDoc(doc(db, 'users', newUser.uid), userDoc);
    console.log('✅ Firestore user document created');

    return {
      success: true,
      userId: newUser.uid
    };

  } catch (error: any) {
    console.error('❌ User creation failed:', error);
    
    let errorMessage = 'Failed to create user';
    
    // Provide user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email address is already registered';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak (minimum 6 characters)';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };

  } finally {
    // Always clean up secondary app
    if (secondaryApp && secondaryAuth) {
      await cleanupSecondaryApp(secondaryApp, secondaryAuth);
    }
  }
};

/**
 * Verify admin status for UI components
 */
export const useAdminVerification = () => {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        const result = await verifyAdminAuthentication();
        setIsAdmin(result.isAdmin);
        setError(result.error || null);
      } catch (err: any) {
        setError(err.message || 'Failed to verify admin status');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Check on mount
    checkAdminStatus();

    // Check when auth state changes
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkAdminStatus();
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading, error };
}; 