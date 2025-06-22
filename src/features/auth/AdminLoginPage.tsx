import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../api/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { isSuperAdmin } from '../../utils/adminConfig';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Email,
  Lock,
} from '@mui/icons-material';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in as super admin
  React.useEffect(() => {
    if (user && isSuperAdmin(user.email || '')) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } else if (user && !isSuperAdmin(user.email || '')) {
      // Regular user tried to access admin - redirect to regular dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Check if email is authorized for admin access
    if (!isSuperAdmin(email)) {
      setError('Access denied. This account is not authorized for admin access.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will happen automatically via the useEffect above
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            maxWidth: 400,
            mx: 'auto',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* Admin Header */}
          <Box
            sx={{
              backgroundColor: '#7C3AED',
              color: 'white',
              py: 4,
              textAlign: 'center',
              borderRadius: '12px 12px 0 0',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Super Admin
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Multi-Clinic Management Portal
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Admin Email Address"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  mb: 3,
                  backgroundColor: '#7C3AED',
                  '&:hover': {
                    backgroundColor: '#6D28D9',
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Signing In...
                  </Box>
                ) : (
                  'Access Admin Panel'
                )}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Super Admin Access Only
              </Typography>
              <Button 
                onClick={() => navigate('/login')}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Regular Staff Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminLoginPage; 