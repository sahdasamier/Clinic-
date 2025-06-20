import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../api/firebase';
import { loginWithInvitationCheck } from '../../api/auth';
import { AuthContext } from '../../app/AuthProvider';
import { isSuperAdmin } from '../../utils/adminConfig';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalHospital,
  Language,
  Email,
  Lock,
} from '@mui/icons-material';

const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  
  // Get success message from navigation state
  const successMessage = location.state?.message;
  
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLanguageChange = (lng: string) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
    document.documentElement.dir = i18n.dir();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithInvitationCheck(email, password);
      
      if (result.success) {
        // Check if user is super admin or regular user
        if (isSuperAdmin(email)) {
          navigate('/admin/dashboard');
        } else if (result.userData) {
          navigate(`/dashboard`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Failed to sign in. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setResetEmail('');
    setResetSuccess(false);
    setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
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
          {/* Logo Section */}
          <Box
            sx={{
              backgroundColor: 'primary.main',
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
              <LocalHospital sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {t('login')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t('clinic_care')} {t('management_system')}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Language Selector */}
            <Box sx={{ mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{t('language')}</InputLabel>
                <Select
                  value={language}
                  label={t('language')}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  startAdornment={<Language sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ar">العربية</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label={t('email_address')}
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
                  label={t('password')}
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
                }}
              >
                              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  {t('signing_in')}
                </Box>
              ) : (
                t('sign_in')
              )}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setForgotPasswordOpen(true)}
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                  mb: 2,
                  display: 'block',
                }}
              >
                {t('forgot_password')}
              </Link>
              <Typography variant="body2" color="text.secondary">
                {t('authorized_access_only')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                Contact your administrator for account access
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={handleCloseForgotPassword}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('reset_password')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {t('password_reset_email_sent')} {resetEmail}
              </Typography>
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('enter_email_for_reset')}
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label={t('email_address')}
                type="email"
                variant="outlined"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                disabled={resetLoading}
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
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseForgotPassword}
            disabled={resetLoading}
          >
            {resetSuccess ? t('close') : t('cancel')}
          </Button>
          {!resetSuccess && (
            <Button 
              variant="contained" 
              onClick={handleForgotPassword}
              disabled={resetLoading || !resetEmail}
              startIcon={resetLoading ? <CircularProgress size={16} /> : <Email />}
            >
              {resetLoading ? t('sending') : t('send_reset_email')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage; 