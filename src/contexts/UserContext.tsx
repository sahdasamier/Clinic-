import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { AuthContext } from '../app/AuthProvider';
import { db } from '../api/firebase';
import { User, Clinic } from '../types/models';
import { isSuperAdmin } from '../utils/adminConfig';

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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userClinic, setUserClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      setUserClinic(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Check if super admin
      const isUserAdmin = isSuperAdmin(user.email || '');
      
      if (isUserAdmin) {
        // Super admin doesn't have a user profile in the users collection
        setUserProfile(null);
        setUserClinic(null);
        setLoading(false);
        return;
      }
      
      // For regular users, try to get their profile
      // If collections don't exist yet or user doesn't have profile, handle gracefully
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setUserProfile(userData);
          
          // Get user's clinic data if they have a clinicId
          if (userData.clinicId) {
            try {
              const clinicDoc = await getDoc(doc(db, 'clinics', userData.clinicId));
              if (clinicDoc.exists()) {
                const clinicData = { id: clinicDoc.id, ...clinicDoc.data() } as Clinic;
                setUserClinic(clinicData);
              }
            } catch (clinicError) {
              console.warn('Could not fetch clinic data:', clinicError);
              setUserClinic(null);
            }
          }
        } else {
          // User document doesn't exist yet - this is ok for new users
          setUserProfile(null);
          setUserClinic(null);
        }
      } catch (userError) {
        console.warn('Could not fetch user profile:', userError);
        setUserProfile(null);
        setUserClinic(null);
      }
    } catch (error) {
      console.error('Error in refreshUserData:', error);
      setUserProfile(null);
      setUserClinic(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      refreshUserData();
    }
  }, [user, authLoading, refreshUserData]);

  const isAdmin = user ? isSuperAdmin(user.email || '') : false;

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