import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { getOptimizedFirestore, firebaseManager } from '../api/firebaseOptimized';
import { User, Clinic } from '../types/models';
import { isSuperAdmin } from '../utils/adminConfig';
import { initializeGlobalDataSync, cleanupGlobalDataSync } from '../utils/globalDataSync';

// Helper to get safe database reference
const getDb = () => {
  if (!firebaseManager.isReady()) {
    throw new Error('Firebase not ready - please wait for initialization');
  }
  return getOptimizedFirestore();
};

interface UserContextType {
  userProfile: User | null;
  userClinic: Clinic | null;
  isAdmin: boolean;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  userProfile: null,
  userClinic: null,
  isAdmin: false,
  loading: true,
  refreshUserData: async () => {},
});

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, initialized } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userClinic, setUserClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = useCallback(async () => {
    // Wait for auth to be initialized before proceeding
    if (!initialized) {
      console.log('🔄 UserProvider: Auth not initialized yet, waiting...');
      return;
    }

    if (!user) {
      console.log('🔄 UserProvider: No authenticated user, clearing user data');
      setUserProfile(null);
      setUserClinic(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 UserProvider: Refreshing user data for:', user.email);
      
      // Check if super admin
      const isUserAdmin = isSuperAdmin(user.email || '');
      
      if (isUserAdmin) {
        console.log('✅ UserProvider: User is super admin');
        // Super admin doesn't have a user profile in the users collection but we create a basic profile
        const adminProfile: User = {
          id: user.uid,
          email: user.email || '',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          clinicId: 'demo-clinic',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(adminProfile);
        setUserClinic(null);
        setLoading(false);
        return;
      }
      
      // For regular users, try to get their profile
      // If collections don't exist yet or user doesn't have profile, create a basic one
      try {
        console.log('🔄 UserProvider: Fetching user profile from Firestore');
        
        // ✅ ENHANCED: Always try to fetch, but handle gracefully if Firebase isn't ready
        if (!firebaseManager.isReady()) {
          console.log('⚠️ UserProvider: Firebase not ready, creating temporary profile');
          // Create a temporary profile for the authenticated user
          const tempProfile: User = {
            id: user.uid,
            email: user.email || '',
            firstName: user.email?.split('@')[0] || 'User',
            lastName: 'Unknown',
            role: 'staff',
            clinicId: 'demo-clinic',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUserProfile(tempProfile);
          setUserClinic(null);
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setUserProfile(userData);
          console.log('✅ UserProvider: User profile loaded successfully');
          
          // Get user's clinic data if they have a clinicId
          if (userData.clinicId) {
            try {
              console.log('🔄 UserProvider: Fetching clinic data');
              const clinicDoc = await getDoc(doc(getDb(), 'clinics', userData.clinicId));
              if (clinicDoc.exists()) {
                const clinicData = { id: clinicDoc.id, ...clinicDoc.data() } as Clinic;
                setUserClinic(clinicData);
                console.log('✅ UserProvider: Clinic data loaded successfully');
              }
            } catch (clinicError) {
              console.warn('⚠️ UserProvider: Could not fetch clinic data:', clinicError);
              setUserClinic(null);
            }
          }
        } else {
          console.log('ℹ️ UserProvider: User document doesn\'t exist yet - creating basic profile');
          // ✅ ENHANCED: Create a basic profile for authenticated users without a document
          const basicProfile: User = {
            id: user.uid,
            email: user.email || '',
            firstName: user.email?.split('@')[0] || 'User',
            lastName: 'Unknown',
            role: 'staff',
            clinicId: 'demo-clinic',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUserProfile(basicProfile);
          setUserClinic(null);
        }
      } catch (userError) {
        console.warn('⚠️ UserProvider: Could not fetch user profile, creating fallback:', userError);
        // ✅ ENHANCED: Always provide a fallback profile for authenticated users
        const fallbackProfile: User = {
          id: user.uid,
          email: user.email || '',
          firstName: user.email?.split('@')[0] || 'User',
          lastName: 'Unknown',
          role: 'staff',
          clinicId: 'demo-clinic',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(fallbackProfile);
        setUserClinic(null);
      }
    } catch (error) {
      console.error('❌ UserProvider: Error in refreshUserData:', error);
      // ✅ ENHANCED: Even in error case, provide a basic profile for authenticated users
      if (user) {
        const errorFallbackProfile: User = {
          id: user.uid,
          email: user.email || '',
          firstName: user.email?.split('@')[0] || 'User',
          lastName: 'Unknown',
          role: 'staff',
          clinicId: 'demo-clinic',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(errorFallbackProfile);
        setUserClinic(null);
      } else {
        setUserProfile(null);
        setUserClinic(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user, initialized]);

  useEffect(() => {
    // Only refresh user data when auth is fully initialized
    if (initialized && !authLoading) {
      console.log('🔄 UserProvider: Auth is initialized, refreshing user data');
      refreshUserData();
    }
  }, [user, authLoading, initialized, refreshUserData]);

  // Initialize global data sync when user profile is loaded
  useEffect(() => {
    if (userProfile?.clinicId) {
      console.log('🔄 UserProvider: Initializing global data sync for clinic:', userProfile.clinicId);
      initializeGlobalDataSync(userProfile.clinicId);
    } else if (!user) {
      // Clean up when user logs out
      console.log('🧹 UserProvider: Cleaning up global data sync');
      cleanupGlobalDataSync();
    }
    
    return () => {
      // Cleanup on component unmount
      cleanupGlobalDataSync();
    };
  }, [userProfile?.clinicId, user]);

  const isAdmin = user ? isSuperAdmin(user.email || '') : false;

  // Don't render children until auth is initialized to prevent race conditions
  if (!initialized) {
    console.log('🔄 UserProvider: Waiting for auth initialization...');
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        userProfile,
        userClinic,
        isAdmin,
        loading: authLoading || loading,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}; 