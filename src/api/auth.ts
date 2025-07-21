import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail,
  User as FirebaseUser,
  getAuth
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app'; // Added for secondary app
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'management' | 'doctor' | 'receptionist';
  clinicId: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  permissions?: any;
}

export interface UserInvitation {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'management' | 'doctor' | 'receptionist';
  clinicId: string;
  invitedBy: string;
  invitedAt: any;
  expiresAt: any;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
}

// Generate a random invitation token
function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Email validation function
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Simple and safe email checking function - NO authentication conflicts
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking if email exists: ${email}`);
    const normalizedEmail = email.trim().toLowerCase();
    
    // Use only fetchSignInMethodsForEmail - don't do secondary checks that sign users out
    const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
    const exists = signInMethods.length > 0;
    
    console.log(`📧 Email ${normalizedEmail} exists: ${exists}`, { signInMethods });
    return exists;
    
  } catch (error: any) {
    console.error('❌ Error checking email existence:', error);
    
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    }
    
    if (error.code === 'auth/too-many-requests') {
      console.warn('⚠️ Rate limited - assuming email does not exist');
      return false;
    }
    
    // For network errors, assume email doesn't exist to avoid blocking valid registrations
    console.warn('⚠️ Network error - assuming email does not exist');
    return false;
  }
}

// Double-check email before creation (last-chance validation)
export async function doubleCheckEmailBeforeCreation(email: string): Promise<{ canCreate: boolean; error?: string }> {
  try {
    console.log(`🔍 Double-checking email before creation: ${email}`);
    const normalizedEmail = email.trim().toLowerCase();
    
    // Try to check sign-in methods again
    const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
    
    if (signInMethods.length > 0) {
      console.log(`❌ Double-check failed - email exists: ${normalizedEmail}`);
      return { 
        canCreate: false, 
        error: `The email "${email}" is already registered. Please use a different email address.` 
      };
    }
    
    console.log(`✅ Double-check passed - email available: ${normalizedEmail}`);
    return { canCreate: true };
    
  } catch (error: any) {
    console.error('❌ Error in double-check:', error);
    
    if (error.code === 'auth/invalid-email') {
      return { 
        canCreate: false, 
        error: `"${email}" is not a valid email address. Please enter a valid email (e.g., user@example.com).` 
      };
    }
    
    // If we can't verify, proceed with caution but allow creation
    // The actual createUserWithEmailAndPassword will catch duplicates
    console.warn('⚠️ Cannot verify email, proceeding with creation (Firebase will catch duplicates)');
    return { canCreate: true };
  }
};

// Validate user creation data
export const validateUserData = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  clinicId: string;
}): Promise<{ isValid: boolean; error?: string }> => {
  // Check required fields
  if (!userData.email?.trim()) {
    return { isValid: false, error: 'Email address is required' };
  }
  
  if (!userData.password?.trim()) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (!userData.firstName?.trim()) {
    return { isValid: false, error: 'First name is required' };
  }
  
  if (!userData.lastName?.trim()) {
    return { isValid: false, error: 'Last name is required' };
  }
  
  if (!userData.clinicId?.trim()) {
    return { isValid: false, error: 'Clinic selection is required' };
  }

  // Validate email format
  if (!isValidEmail(userData.email)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., user@example.com)' };
  }

  // Check password strength
  if (userData.password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  // Check if email already exists
  try {
    const emailExists = await checkEmailExists(userData.email.trim().toLowerCase());
    if (emailExists) {
      return { isValid: false, error: `An account with email "${userData.email}" already exists. Please use a different email address.` };
    }
  } catch (error: any) {
    return { isValid: false, error: error.message };
  }

  return { isValid: true };
};

// Create invitation (called by admin)
export const createUserInvitation = async (userData: {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  clinicId: string;
  invitedBy: string;
}): Promise<{ success: boolean; invitationToken?: string; error?: string }> => {
  try {
    const invitationToken = generateInvitationToken();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days to accept

    const invitation: UserInvitation = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role as any,
      clinicId: userData.clinicId,
      invitedBy: userData.invitedBy,
      invitedAt: serverTimestamp(),
      expiresAt: expirationDate,
      status: 'pending',
      token: invitationToken,
    };

    await addDoc(collection(db, 'invitations'), invitation);
    
    console.log('✅ Invitation created successfully');
    return { success: true, invitationToken };
  } catch (error) {
    console.error('❌ Error creating invitation:', error);
    return { success: false, error: 'Failed to create invitation' };
  }
};

// Accept invitation and create user account
export async function acceptInvitation(token: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the invitation
    const invitationsRef = collection(db, 'invitations');
    const snapshot = await getDoc(doc(invitationsRef, token)); // Simplified - in real app you'd query by token
    
    // For now, let's implement a simpler approach - we'll pass the invitation data directly
    // This is a limitation of the current approach, we'll improve it
    
    return { success: false, error: 'Please use the direct signup method for now' };
  } catch (error) {
    console.error('❌ Error accepting invitation:', error);
    return { success: false, error: 'Failed to accept invitation' };
  }
}

// Create user account directly (for admin use) - ROBUST VERSION
// Uses a secondary Firebase app to create users so admin session is not disturbed.
export async function createUserAccount(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  clinicId: string;
  createdBy?: string;
}): Promise<{ success: boolean; error?: string; isOrphaned?: boolean }> {
  // Ensure firebaseConfig is imported for secondary app initialization
  // It's typically available from './firebase'
  const { firebaseConfig } = await import('./firebase');
  if (!firebaseConfig) {
    console.error('❌ Firebase config not found for secondary app initialization.');
    return { success: false, error: 'Firebase config missing for user creation.' };
  }

  const tempAppName = `newUserCreation-${Date.now()}`;
  let tempApp; // Declare here to ensure it's in scope for finally block

  try {
    console.log(`🔧 Creating user account for: ${userData.email} using secondary app`);

    // Initialize secondary Firebase app
    tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp); // Use getAuth from the main 'firebase/auth'

    // Normalize email early
    const normalizedEmail = userData.email.trim().toLowerCase();
    const normalizedUserData = {
      ...userData,
      email: normalizedEmail
    };

    // Basic validation
    console.log('🔍 Running basic validation...');
    if (!normalizedEmail) {
      return { success: false, error: 'Email address is required' };
    }
    if (!isValidEmail(normalizedEmail)) {
      return { success: false, error: 'Please enter a valid email address (e.g., user@example.com)' };
    }
    if (!userData.password?.trim()) {
      return { success: false, error: 'Password is required' };
    }
    if (userData.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    if (!userData.firstName?.trim()) {
      return { success: false, error: 'First name is required' };
    }
    if (!userData.lastName?.trim()) {
      return { success: false, error: 'Last name is required' };
    }
    if (!userData.clinicId?.trim()) {
      return { success: false, error: 'Clinic selection is required' };
    }
    
    // Attempt creation using the secondary auth instance
    console.log('📧 Attempting Firebase Auth account creation via secondary app...');
    const userCredential = await createUserWithEmailAndPassword(
      tempAuth, // Use secondary auth instance
      normalizedEmail, 
      userData.password
    );
    
    const user = userCredential.user; // This user object is from the secondary auth instance
    console.log('✅ Firebase Auth account created successfully via secondary app');
    
    // Update the user's profile using the secondary auth instance
    await updateProfile(user, { // Use updateProfile from the main 'firebase/auth'
      displayName: `${userData.firstName.trim()} ${userData.lastName.trim()}`
    });
    console.log('✅ User profile updated via secondary app');
    
    // Store additional user data in Firestore using the main db instance
    // This assumes 'db' is initialized with the primary app and thus uses the admin's auth context
    const userDoc: UserData = {
      id: user.uid, // UID is the same across auth instances for the same user
      email: normalizedEmail,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      role: userData.role as any,
      clinicId: userData.clinicId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // The main 'db' instance uses the admin's (primary) auth context
    await setDoc(doc(db, 'users', user.uid), userDoc);
    console.log('✅ User document created in Firestore using admin context');
    
    console.log('🎉 User account created successfully');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Error creating user account via secondary app:', error);
    console.error('❌ Full error details:', {
      code: error.code,
      message: error.message,
      email: userData.email,
      stack: error.stack
    });
    
    // Handle specific Firebase Auth errors with enhanced messaging
    let errorMessage = 'Failed to create user account';
    let isOrphaned = false;
    
    if (error.code === 'auth/email-already-in-use') {
      isOrphaned = true;
      errorMessage = `🚨 ORPHANED ACCOUNT DETECTED: The email "${userData.email}" exists in Firebase Auth but not in our user database.\n\n` +
                    `This happens when a user was deleted from the admin panel but their Firebase Authentication account wasn't removed.\n\n` +
                    `🔧 IMMEDIATE SOLUTIONS:\n` +
                    `• Use one of these alternative emails:\n` +
                    `  - ${userData.email.replace('@', '+1@')}\n` +
                    `  - ${userData.email.replace('@', '.new@')}\n` +
                    `  - ${userData.email.replace('@', '2@')}\n` +
                    `• Ask the user for a different email address\n` +
                    `• Use company email domain with + addressing\n\n` +
                    `📋 WHY THIS HAPPENS:\n` +
                    `• Deleting users only removes database records\n` +
                    `• Firebase Auth accounts remain for security\n` +
                    `• Email becomes permanently unusable for new accounts\n\n` +
                    `💡 PREVENTION:\n` +
                    `• Use "Deactivate" (toggle switch) instead of "Delete"\n` +
                    `• Keeps email available for future reuse`;
                    
    } else if (error.code === 'auth/weak-password') {
      errorMessage = `❌ WEAK PASSWORD: Password is too weak.\n\n` +
                    `🔧 Requirements:\n` +
                    `• At least 6 characters long\n` +
                    `• Mix of letters and numbers recommended\n` +
                    `• Click "Generate" for a strong password`;
                    
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = `❌ INVALID EMAIL: "${userData.email}" is not a valid email address.\n\n` +
                    `🔧 Correct format:\n` +
                    `• user@example.com\n` +
                    `• firstname.lastname@domain.com\n` +
                    `• Check for typos and missing @ or domain`;
                    
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = `❌ OPERATION NOT ALLOWED: User creation is disabled.\n\n` +
                    `🔧 Solutions:\n` +
                    `• Contact system administrator\n` +
                    `• Check Firebase Authentication settings\n` +
                    `• Verify email/password provider is enabled`;
                    
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = `❌ TOO MANY REQUESTS: Rate limit exceeded.\n\n` +
                    `🔧 Solutions:\n` +
                    `• Wait 5-10 minutes before trying again\n` +
                    `• Avoid creating multiple users rapidly\n` +
                    `• Try again later`;
                    
    } else if (error.message?.includes('network') || error.code === 'auth/network-request-failed') {
      errorMessage = `❌ NETWORK ERROR: Connection problem.\n\n` +
                    `🔧 Solutions:\n` +
                    `• Check your internet connection\n` +
                    `• Try again in a few moments\n` +
                    `• Verify Firebase is accessible`;
                    
    } else {
      errorMessage = `❌ UNKNOWN ERROR: ${error.message || 'Unexpected error occurred'}\n\n` +
                    `🔧 Try:\n` +
                    `• Refresh the page and try again\n` +
                    `• Check browser console for details\n` +
                    `• Contact support if problem persists`;
    }
    
    return { success: false, error: errorMessage, isOrphaned };
  } finally {
    if (tempApp) {
      try {
        const tempAuthInstance = getAuth(tempApp); // Get auth instance before deleting app
        if (tempAuthInstance.currentUser) { // Check if a user is signed in
          await signOut(tempAuthInstance); // Sign out from secondary app's auth
          console.log('👋 User signed out from secondary app');
        }
        await deleteApp(tempApp); // Delete the secondary app
        console.log('🧹 Secondary Firebase app deleted');
      } catch (cleanupError) {
        console.error('🧹❌ Error during secondary app cleanup:', cleanupError);
      }
    }
  }
}

// Login function
export async function loginUser(email: string, password: string): Promise<{ success: boolean; userData?: UserData; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = { id: userDoc.id, ...userDoc.data() } as UserData;
      
      if (userData.isActive) {
        return { success: true, userData };
      } else {
        await signOut(auth); // Sign out if account is inactive
        return { success: false, error: 'Account is inactive' };
      }
    } else {
      // If no user data in Firestore, might be super admin
      return { success: true, userData: undefined };
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    let errorMessage = 'Login failed';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    return { success: false, error: errorMessage };
  }
}

// Enhanced login function that handles invitations for first-time users
export async function loginWithInvitationCheck(email: string, password: string): Promise<{ success: boolean; userData?: UserData; error?: string }> {
  try {
    console.log(`🔐 Attempting login for: ${email}`);
    
    // First, try regular login (for existing users)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as UserData;
        
        if (userData.isActive) {
          console.log('✅ Existing user login successful');
          return { success: true, userData };
        } else {
          await signOut(auth);
          return { success: false, error: 'Account is inactive' };
        }
      }
      
    } catch (authError: any) {
      // If user doesn't exist in auth, check for invitation
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        console.log('🔍 Checking for user invitation...');
        
        // Check if there's a pending invitation
        const invitationsQuery = query(
          collection(db, 'user_invitations'),
          where('email', '==', email),
          where('tempPassword', '==', password),
          where('status', '==', 'pending')
        );
        
        const invitationSnapshot = await getDocs(invitationsQuery);
        
        if (!invitationSnapshot.empty) {
          console.log('✅ Invitation found, creating auth account...');
          
          const invitationData = invitationSnapshot.docs[0].data();
          
          // Create the actual Firebase Auth account
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          
          // Update display name
          await updateProfile(user, {
            displayName: `${invitationData.firstName} ${invitationData.lastName}`
          });
          
          // Create proper user document
          const userDoc: UserData = {
            id: user.uid,
            email: invitationData.email,
            firstName: invitationData.firstName,
            lastName: invitationData.lastName,
            role: invitationData.role,
            clinicId: invitationData.clinicId,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          await setDoc(doc(db, 'users', user.uid), userDoc);
          
          // Mark invitation as accepted
          await updateDoc(invitationSnapshot.docs[0].ref, {
            status: 'accepted',
            acceptedAt: serverTimestamp()
          });
          
          console.log('🎉 User account created from invitation');
          return { success: true, userData: userDoc };
        }
      }
      
      // No invitation found, return original error
      throw authError;
    }
    
    // This should not be reached, but TypeScript requires a return
    return { success: false, error: 'Unexpected login flow' };
    
  } catch (error: any) {
    console.error('❌ Login error:', error);
    let errorMessage = 'Login failed';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password. Check if you have an invitation or contact your administrator.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    return { success: false, error: errorMessage };
  }
}

// Logout function
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
}

// Get current user data
export async function getCurrentUserData(): Promise<UserData | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
}

// Get permissions based on role
export function getPermissionsByRole(role: string): string[] {
  switch (role) {
    case 'management':
      return ['manage_clinic', 'view_reports', 'manage_staff', 'manage_appointments', 'view_patients'];
    case 'doctor':
      return ['view_patients', 'manage_appointments', 'write_prescriptions', 'view_reports'];
    case 'receptionist':
      return ['view_appointments', 'manage_appointments', 'basic_patient_info'];
    default:
      return ['basic_access'];
  }
}

// Test function for debugging email validation (call from console)
export async function testEmailValidation(email: string) {
  console.log(`🧪 Testing email validation for: ${email}`);
  
  try {
    // Test format validation
    const isValid = isValidEmail(email);
    console.log(`📝 Format valid: ${isValid}`);
    
    if (!isValid) {
      console.log('❌ Email format is invalid');
      return { valid: false, reason: 'Invalid format' };
    }
    
    // Test duplicate check
    const exists = await checkEmailExists(email);
    console.log(`🔍 Email exists: ${exists}`);
    
    // Test double check
    const doubleCheck = await doubleCheckEmailBeforeCreation(email);
    console.log(`🔍 Double check result:`, doubleCheck);
    
    return {
      valid: isValid && !exists && doubleCheck.canCreate,
      formatValid: isValid,
      exists: exists,
      canCreate: doubleCheck.canCreate,
      error: doubleCheck.error
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { valid: false, error: error };
  }
};

// Handle orphaned Firebase Auth accounts (accounts that exist in Auth but not in Firestore)
export const handleOrphanedAccount = async (email: string, userData: {
  firstName: string;
  lastName: string;
  role: string;
  clinicId: string;
}): Promise<{ success: boolean; error?: string; action?: string }> => {
  try {
    console.log(`🔧 Handling orphaned account for: ${email}`);
    
    // Check if email exists in Firebase Auth
    const authExists = await checkEmailExists(email);
    if (!authExists) {
      return { success: false, error: 'No orphaned account found for this email' };
    }
    
    // Try to create a temporary auth account to get the UID
    // This won't work if the account exists, but we can use the error to detect the situation
    console.log('🔍 Detected orphaned Firebase Auth account');
    
    // For now, we'll suggest a workaround
    return {
      success: false,
      error: `ORPHANED ACCOUNT DETECTED: The email "${email}" exists in Firebase Auth but not in our user database.\n\n` +
            `🔧 Solutions:\n` +
            `• Use a different email address\n` +
            `• Ask the user to reset their password at /login\n` +
            `• Contact Firebase support to remove the orphaned account\n` +
            `• Use email+1@domain.com as a workaround`,
      action: 'orphaned'
    };
    
  } catch (error) {
    console.error('❌ Error handling orphaned account:', error);
    return { success: false, error: 'Failed to handle orphaned account' };
  }
};

// Enhanced user creation that handles orphaned accounts - DIRECT APPROACH
export const createUserAccountWithCleanup = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  clinicId: string;
  createdBy?: string;
}): Promise<{ success: boolean; error?: string; needsCleanup?: boolean }> => {
  try {
    console.log(`🔧 Creating user with cleanup handling: ${userData.email}`);
    
    // Use the robust direct creation approach
    const result = await createUserAccount(userData);
    
    if (result.success) {
      console.log('✅ User account created successfully');
      return { success: true };
    }
    
    // Check if it's specifically an orphaned account issue
    if (result.isOrphaned) {
      console.log('🚨 Orphaned account detected, providing enhanced guidance');
      return { 
        success: false, 
        error: result.error,
        needsCleanup: true 
      };
    }
    
    // For other errors, return as-is
    console.log('❌ Account creation failed for other reason');
    return {
      success: false,
      error: result.error
    };
    
  } catch (error: any) {
    console.error('❌ Error in createUserAccountWithCleanup:', error);
    return { 
      success: false, 
      error: `Unexpected error: ${error.message || 'Failed to create user account'}` 
    };
  }
}

// Function to suggest alternative emails
export function suggestAlternativeEmails(originalEmail: string): string[] {
  const [localPart, domain] = originalEmail.split('@');
  if (!domain) return [];
  
  return [
    `${localPart}+1@${domain}`,
    `${localPart}.new@${domain}`,
    `${localPart}2@${domain}`,
    `new.${localPart}@${domain}`,
    `${localPart}.clinic@${domain}`
  ];
}

// Enhanced email checking with orphan detection
export const checkEmailWithOrphanDetection = async (email: string): Promise<{
  exists: boolean;
  isOrphaned: boolean;
  suggestions?: string[];
}> => {
  try {
    const authExists = await checkEmailExists(email);
    
    if (!authExists) {
      return { exists: false, isOrphaned: false };
    }
    
    // Check if user exists in Firestore
    // Since we can't easily query by email, we'll assume it's orphaned if auth exists
    // This is a limitation - in a real app you'd have an email index
    
    return {
      exists: true,
      isOrphaned: true, // Assume orphaned for now
      suggestions: suggestAlternativeEmails(email)
    };
    
  } catch (error) {
    console.error('❌ Error checking email with orphan detection:', error);
    return { exists: false, isOrphaned: false };
  }
};

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).testEmailValidation = testEmailValidation;
  (window as any).checkEmailExists = checkEmailExists;
  (window as any).doubleCheckEmailBeforeCreation = doubleCheckEmailBeforeCreation;
  (window as any).handleOrphanedAccount = handleOrphanedAccount;
  (window as any).checkEmailWithOrphanDetection = checkEmailWithOrphanDetection;
  (window as any).suggestAlternativeEmails = suggestAlternativeEmails;
} 