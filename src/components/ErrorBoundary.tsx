import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import { RefreshOutlined, BugReportOutlined } from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Error Boundary caught an error:', error);
    console.error('❌ Error details:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // ✅ ENHANCED: Check for Firebase-specific errors
    const isFirebaseError = error.message.includes('Firebase') || 
                           error.message.includes('collection()') ||
                           error.message.includes('Firestore') ||
                           error.name === 'FirebaseError';
    
    if (isFirebaseError) {
      console.error('🔥 Firebase-related error detected:', error.message);
      
      // Dispatch a custom event for Firebase errors
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firebaseErrorCaught', {
          detail: { 
            error: error.message, 
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date() 
          }
        }));
      }
    }

    // Log error to external service if needed
    // Example: Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      // ✅ ENHANCED: Detect Firebase-specific errors for better messaging
      const isFirebaseError = this.state.error?.message.includes('Firebase') || 
                             this.state.error?.message.includes('collection()') ||
                             this.state.error?.message.includes('Firestore') ||
                             this.state.error?.name === 'FirebaseError';

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Stack spacing={3} alignItems="center">
              <BugReportOutlined sx={{ fontSize: 64, color: 'error.main' }} />
              
              <Typography variant="h4" color="error" gutterBottom>
                {isFirebaseError ? '🔥 Firebase Connection Error' : 'Oops! Something went wrong'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                {isFirebaseError 
                  ? 'We encountered a problem connecting to our database services. This is usually temporary and can be resolved by refreshing the page.'
                  : 'We encountered an unexpected error. Don\'t worry, your data is safe. Please try refreshing the page or contact support if the problem persists.'
                }
              </Typography>

              <Alert severity={isFirebaseError ? 'warning' : 'error'} sx={{ width: '100%', textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  <strong>Error:</strong> {this.state.error?.message}
                </Typography>
                {isFirebaseError && (
                  <Typography variant="body2" sx={{ mt: 2, color: 'warning.dark' }}>
                    <strong>💡 Quick Fix:</strong> This is usually resolved by refreshing the page. 
                    If the problem persists, please check your internet connection.
                  </Typography>
                )}
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      <strong>Stack Trace:</strong>
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: '0.7rem',
                        overflow: 'auto',
                        maxHeight: 200,
                        backgroundColor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </Box>
                  </Box>
                )}
              </Alert>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshOutlined />}
                  onClick={this.handleRetry}
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
                
                {/* ✅ NEW: Additional Firebase-specific recovery button */}
                {isFirebaseError && (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => {
                      console.log('🔄 Attempting Firebase recovery...');
                      // Dispatch recovery event
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('attemptFirebaseRecovery'));
                      }
                      setTimeout(() => {
                        this.handleReload();
                      }, 1000);
                    }}
                  >
                    🔥 Fix Firebase
                  </Button>
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {isFirebaseError 
                  ? 'If the Firebase connection issue persists, please contact support with the error details above.'
                  : 'If this problem continues, please contact support with the error details above.'
                }
              </Typography>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 