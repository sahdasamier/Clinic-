import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, authHelpers } from '../services/firebase';
import { CircularProgress, Box, Typography } from '@mui/material';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  initialized: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isAuthenticated: false,
  error: null
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 AuthProvider: Initializing auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 AuthProvider: Auth state changed:', user ? `${user.email} (${user.uid})` : 'No user');
      
      setUser(user);
      setLoading(false);
      setInitialized(true);
      setError(null);
      
      // Debug logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthProvider: Auth state fully initialized', {
          authenticated: !!user,
          email: user?.email,
          uid: user?.uid,
          loading: false,
          initialized: true
        });
      }
    }, (error) => {
      console.error('❌ AuthProvider: Auth state error:', error);
      setError(error.message);
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      console.log('🔄 AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 AuthProvider: Attempting sign in for:', email);
      
      await authHelpers.signIn(email, password);
      console.log('✅ AuthProvider: Sign in successful');
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign in error:', error);
      setError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 AuthProvider: Attempting sign up for:', email);
      
      await authHelpers.signUp(email, password);
      console.log('✅ AuthProvider: Sign up successful');
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign up error:', error);
      setError(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      console.log('🔄 AuthProvider: Attempting sign out');
      
      await authHelpers.signOut();
      console.log('✅ AuthProvider: Sign out successful');
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign out error:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    error
  };

  // Show loading spinner while initializing auth state
  if (!initialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'background.default',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Initializing authentication...
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Please wait while we restore your session
        </Typography>
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext; 