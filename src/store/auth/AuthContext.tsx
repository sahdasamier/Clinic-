import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getOptimizedAuth, firebaseManager } from '@lib/firebase/legacy-compat';
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
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Wait for Firebase to be ready
  useEffect(() => {
    const checkFirebaseReady = async () => {
      console.log('🔄 AuthProvider: Waiting for Firebase to be ready...');
      
      // Wait for Firebase manager to be ready
      const maxWait = 10000; // 10 seconds max wait
      const startTime = Date.now();
      
      let isReady = await firebaseManager.isReady();
      while (!isReady && (Date.now() - startTime) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
        isReady = await firebaseManager.isReady();
      }
      
      if (isReady) {
        console.log('✅ AuthProvider: Firebase is ready, setting up auth');
        setFirebaseReady(true);
      } else {
        console.error('❌ AuthProvider: Firebase failed to initialize within timeout');
        setError('Firebase failed to initialize');
        setLoading(false);
        setInitialized(true);
      }
    };
    
    checkFirebaseReady();
  }, []);

  // Set up auth state listener once Firebase is ready
  useEffect(() => {
    if (!firebaseReady) return;
    
    console.log('🔄 AuthProvider: Initializing auth state listener...');
    
    try {
      const auth = getOptimizedAuth();
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
    } catch (error) {
      console.error('❌ AuthProvider: Failed to set up auth listener:', error);
      setError('Failed to initialize authentication');
      setLoading(false);
      setInitialized(true);
    }
  }, [firebaseReady]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 AuthProvider: Attempting sign in for:', email);
      
      if (!(await firebaseManager.isReady())) {
        throw new Error('Firebase not ready');
      }
      
      const auth = getOptimizedAuth();
      await signInWithEmailAndPassword(auth, email, password);
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
      
      if (!(await firebaseManager.isReady())) {
        throw new Error('Firebase not ready');
      }
      
      const auth = getOptimizedAuth();
      await createUserWithEmailAndPassword(auth, email, password);
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
      
      if (!(await firebaseManager.isReady())) {
        throw new Error('Firebase not ready');
      }
      
      const auth = getOptimizedAuth();
      await firebaseSignOut(auth);
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
    const loadingMessage = !firebaseReady ? 
      'Initializing Firebase...' : 
      'Initializing authentication...';
    
    const subMessage = !firebaseReady ?
      'Setting up Firebase services' :
      'Please wait while we restore your session';
    
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
          {loadingMessage}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {subMessage}
        </Typography>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Error: {error}
          </Typography>
        )}
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
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext; 