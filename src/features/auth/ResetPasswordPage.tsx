import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../api/firebase';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalHospital,
  CheckCircle,
  Lock,
} from '@mui/icons-material';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  useEffect(() => {
    const verifyResetCode = async () => {
      if (!oobCode || mode !== 'resetPassword') {
        setError('Invalid password reset link. Please request a new one.');
        setVerifying(false);
        return;
      }

      try {
        // Verify the password reset code and get the email
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
        setVerifying(false);
      } catch (error: any) {
        console.error('Error verifying reset code:', error);
        setError('This password reset link is invalid or has expired. Please request a new one.');
        setVerifying(false);
      }
    };

    verifyResetCode();
  }, [oobCode, mode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!oobCode) {
      setError('Invalid reset code.');
      return;
    }

    setLoading(true);

    try {
      // Confirm the password reset
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successfully! You can now login with your new password.' 
          } 
        });
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/invalid-action-code':
          setError('This password reset link has expired or is invalid. Please request a new one.');
          break;
        case 'auth/expired-action-code':
          setError('This password reset link has expired. Please request a new one.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        default:
          setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (verifying) {
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
          <Card sx={{ maxWidth: 400, mx: 'auto', borderRadius: 3, textAlign: 'center', p: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">
              {t('verifying_reset_link')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('please_wait_verifying')}
            </Typography>
          </Card>
        </Container>
      </Box>
    );
  }

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
              backgroundColor: success ? 'success.main' : 'primary.main',
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
              {success ? (
                <CheckCircle sx={{ fontSize: 32, color: 'white' }} />
              ) : (
                <LocalHospital sx={{ fontSize: 32, color: 'white' }} />
              )}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {success ? t('password_reset_success') : t('reset_password')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {success ? t('password_updated_successfully') : t('clinic_care')}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {success ? (
              <Box sx={{ textAlign: 'center' }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    {t('password_reset_complete')}
                  </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('redirecting_to_login')}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleBackToLogin}
                  sx={{ borderRadius: 2 }}
                >
                  {t('go_to_login')}
                </Button>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Button
                  variant="contained"
                  onClick={handleBackToLogin}
                  sx={{ borderRadius: 2 }}
                >
                  {t('back_to_login')}
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  {t('enter_new_password_for')} {email}
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label={t('new_password')}
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                      helperText={t('password_min_length')}
                    />
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <TextField
                      fullWidth
                      label={t('confirm_new_password')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              disabled={loading}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                        {t('updating_password')}
                      </Box>
                    ) : (
                      t('update_password')
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      onClick={handleBackToLogin}
                      disabled={loading}
                      sx={{ textTransform: 'none' }}
                    >
                      {t('back_to_login')}
                    </Button>
                  </Box>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage; 