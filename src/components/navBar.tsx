import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../api/firebase';
import { AuthContext } from '../app/AuthProvider';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useClinicSettings } from '../hooks/useClinicSettings';
import logoImage from '../images/Logo.png';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  Paper,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  Notifications,
  AccountCircle,
  Language,
  Logout,
  Person,
  Settings,
  AdminPanelSettings,
  MenuOpen,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  Circle,
} from '@mui/icons-material';

const NavBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { userProfile } = useUser();
  const { unreadCount } = useNotifications();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { getClinicDisplayName, getClinicTagline, isBrandingConfigured } = useClinicSettings();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Language menu state
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // User menu state
  const [userAnchorEl, setUserAnchorEl] = React.useState<null | HTMLElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = i18n.dir();
    setLanguageAnchorEl(null);
  };

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    setUserAnchorEl(null);
    navigate('/settings');
  };

  const handleSignOut = async () => {
    try {
      setUserAnchorEl(null);
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user display information
  const getUserDisplayName = () => {
    // Prioritize user profile data
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      // Extract name from email if no display name
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return ''; // Fallback to empty string if no user information is available
  };

  const getUserInitials = () => {
    // Prioritize user profile data for initials
    if (userProfile?.firstName && userProfile?.lastName) {
      return userProfile.firstName.charAt(0).toUpperCase() + userProfile.lastName.charAt(0).toUpperCase();
    }
    const displayName = getUserDisplayName();
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return displayName.slice(0, 2).toUpperCase();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 50%, rgba(241, 245, 249, 0.98) 100%)',
        backdropFilter: 'blur(25px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        color: 'text.primary',
                  boxShadow: '0 2px 24px rgba(0, 0, 0, 0.03), 0 1px 0 rgba(255, 255, 255, 0.8) inset',
          position: 'relative',
          width: '100%',
          height: { xs: '70px', sm: '80px', md: '90px', lg: '100px' },
        transition: 'height 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '0.5px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 20%, rgba(99, 102, 241, 0.3) 50%, rgba(59, 130, 246, 0.3) 80%, transparent 100%)',
        },
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        py: { xs: 0.5, sm: 1, md: 1.5, lg: 2 }, 
        px: { xs: 1.5, sm: 2, md: 3, lg: 4 }, 
        position: 'relative',
        minHeight: { xs: '56px', sm: '60px', md: '64px', lg: '68px' },
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        {/* Left Side - Sidebar Toggle & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
          <Tooltip title={isCollapsed ? t('expand_sidebar') : t('collapse_sidebar')}>
            <IconButton
              onClick={toggleSidebar}
              sx={{
                width: { xs: 40, sm: 44, md: 48, lg: 52 },
                height: { xs: 40, sm: 44, md: 48, lg: 52 },
                borderRadius: { xs: '12px', md: '14px', lg: '16px' },
                background: isCollapsed 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                border: isCollapsed 
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : '1px solid rgba(59, 130, 246, 0.3)',
                color: isCollapsed ? '#059669' : 'primary.main',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: isCollapsed
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  transform: { xs: 'scale(1.05)', md: 'scale(1.08)' },
                  boxShadow: isCollapsed
                    ? '0 6px 20px rgba(34, 197, 94, 0.25)'
                    : '0 6px 20px rgba(59, 130, 246, 0.25)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: isCollapsed
                    ? 'linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.1) 50%, transparent 70%)'
                    : 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s ease',
                },
                '&:hover::before': {
                  transform: 'translateX(100%)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '90%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Show logo on large screens, chevrons on smaller screens */}
                {isDesktop ? (
                  <Box
                    component="img"
                    src={logoImage}
                    alt="Clinic Logo"
                    sx={{
                      width: { lg: 28, xl: 32 },
                      height: { lg: 28, xl: 32 },
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15)) brightness(1.1) contrast(1.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '4px',
                      opacity: 0.95,
                      '&:hover': {
                        filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25)) brightness(1.3) contrast(1.3)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                ) : (
                  // Show chevron icons on mobile and tablet
                  <>
                    {isCollapsed ? (
                      <ChevronRight sx={{ 
                        fontSize: { xs: 20, sm: 22, md: 24 },
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                        transition: 'all 0.3s ease',
                      }} />
                    ) : (
                      <ChevronLeft sx={{ 
                        fontSize: { xs: 20, sm: 22, md: 24 },
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                        transition: 'all 0.3s ease',
                      }} />
                    )}
                  </>
                )}
              </Box>
              
              {/* Status indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 3, md: 4 },
                  right: { xs: 3, md: 4 },
                  width: { xs: 5, md: 6 },
                  height: { xs: 5, md: 6 },
                  borderRadius: '50%',
                  background: isCollapsed 
                    ? 'linear-gradient(45deg, #10b981, #059669)'
                    : 'linear-gradient(45deg, #3b82f6, #2563eb)',
                  boxShadow: isCollapsed
                    ? '0 0 8px rgba(16, 185, 129, 0.6)'
                    : '0 0 8px rgba(59, 130, 246, 0.6)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      opacity: 1,
                      transform: 'scale(1)',
                    },
                    '50%': {
                      opacity: 0.7,
                      transform: 'scale(1.2)',
                    },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ 
            position: 'relative', 
            display: { xs: 'none', sm: 'block' },
            flex: { sm: '1', md: 'none' },
            maxWidth: { sm: '200px', md: '300px', lg: '400px' },
            overflow: 'hidden',
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                fontWeight: 800, 
                fontSize: { sm: '1.1rem', md: '1.4rem', lg: '1.6rem', xl: '1.8rem' },
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 70%, #475569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -2,
                  left: 0,
                  width: { sm: '20%', md: '30%' },
                  height: '2px',
                  background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, transparent 100%)',
                  borderRadius: '1px',
                },
              }}
            >
              {getClinicDisplayName()}
            </Typography>
            <Box sx={{ 
              display: { xs: 'none', md: 'flex', lg: 'flex' }, 
              alignItems: 'center', 
              gap: { md: 0.5, lg: 1 }, 
              mt: 0.5 
            }}>
              <Box
                sx={{
                  width: { md: 3, lg: 4 },
                  height: { md: 3, lg: 4 },
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.4)',
                  animation: 'pulse 3s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.7, transform: 'scale(1.2)' },
                  },
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontWeight: 600,
                  fontSize: { md: '0.65rem', lg: '0.73rem' },
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {isMobile 
                  ? new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' • Live'
                  : new Date().toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }) + ' • Live'
                }
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Side - Actions */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0.3, sm: 0.5, md: 1, lg: 1.5 },
          flexShrink: 0,
        }}>
          {/* Language Switcher */}
          <Tooltip title={t('change_language')}>
            <IconButton
              onClick={handleLanguageMenuOpen}
              sx={{
                width: { xs: 32, sm: 36, md: 40, lg: 42 },
                height: { xs: 32, sm: 36, md: 40, lg: 42 },
                borderRadius: { xs: '10px', md: '12px' },
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.06) 100%)',
                color: 'text.secondary',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  color: 'primary.main',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                },
              }}
            >
              <Language sx={{ fontSize: { xs: 16, sm: 18, md: 19 } }} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={languageAnchorEl}
            open={Boolean(languageAnchorEl)}
            onClose={handleLanguageMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
              },
            }}
          >
            <MenuItem onClick={() => changeLanguage('en')} selected={i18n.language === 'en'}>
              English
            </MenuItem>
            <MenuItem onClick={() => changeLanguage('ar')} selected={i18n.language === 'ar'}>
              العربية
            </MenuItem>
          </Menu>

          {/* Notifications */}
          <Tooltip title={t('notifications')}>
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                width: { xs: 32, sm: 36, md: 40, lg: 42 },
                height: { xs: 32, sm: 36, md: 40, lg: 42 },
                borderRadius: { xs: '10px', md: '12px' },
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.06) 100%)',
                color: 'text.secondary',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: unreadCount > 0 
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  color: unreadCount > 0 ? '#dc2626' : 'primary.main',
                  transform: 'translateY(-1px)',
                  boxShadow: unreadCount > 0 
                    ? '0 4px 12px rgba(239, 68, 68, 0.2)'
                    : '0 4px 12px rgba(99, 102, 241, 0.15)',
                  border: unreadCount > 0 
                    ? '1px solid rgba(239, 68, 68, 0.2)'
                    : '1px solid rgba(99, 102, 241, 0.2)',
                },
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: { xs: '0.65rem', md: '0.7rem' },
                    minWidth: { xs: '16px', md: '18px' },
                    height: { xs: '16px', md: '18px' },
                    borderRadius: { xs: '8px', md: '9px' },
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                    border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  }
                }}
              >
                <Notifications sx={{ fontSize: { xs: 16, sm: 18, md: 19 } }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Paper
            elevation={0}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              pl: { xs: 1, sm: 2, md: 3 },
              pr: { xs: 0.5, md: 1 },
              py: { xs: 0.5, md: 1 },
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: { xs: '12px', md: '16px' },
              maxWidth: { xs: 'auto', sm: '200px', md: '250px', lg: 'none' },
              minWidth: { xs: 'auto', lg: '200px' },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            {/* User Info - Show on medium screens and up */}
            <Box sx={{ 
              textAlign: 'right', 
              display: { xs: 'none', md: 'block', lg: 'block' },
              flex: 1,
              overflow: 'hidden',
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, 
                  lineHeight: 1.2,
                  fontSize: { md: '0.8rem', lg: '0.85rem', xl: '0.9rem' },
                  color: 'text.primary',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {getUserDisplayName()}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                justifyContent: 'flex-end',
                overflow: 'hidden',
              }}>
                <Circle sx={{ fontSize: { md: 5, lg: 6 }, color: '#10b981', flexShrink: 0 }} />
                <Typography 
                  variant="caption" 
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    color: 'text.secondary',
                    fontSize: { md: '0.6rem', lg: '0.65rem', xl: '0.7rem' },
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {userProfile?.role ? t(userProfile.role) : t('general_practitioner')}
                </Typography>
              </Box>
            </Box>

            {/* User Avatar & Dropdown */}
            <Box
              onClick={handleUserMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, md: 1, lg: 1.5 },
                cursor: 'pointer',
                p: { xs: 0.8, md: 1.2, lg: 1.5 },
                borderRadius: { xs: '10px', md: '14px' },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'rgba(59, 130, 246, 0.08)',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 32, sm: 36, md: 42, lg: 48 },
                  height: { xs: 32, sm: 36, md: 42, lg: 48 },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
                  fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem', lg: '1.1rem' },
                  border: { xs: '2px solid rgba(255, 255, 255, 0.9)', md: '3px solid rgba(255, 255, 255, 0.9)' },
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                {getUserInitials()}
              </Avatar>
              <KeyboardArrowDown 
                sx={{ 
                  fontSize: { xs: 16, md: 18 }, 
                  color: 'rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: Boolean(userAnchorEl) ? 'rotate(180deg)' : 'rotate(0deg)',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                  display: { xs: 'block', sm: 'block' },
                }} 
              />
            </Box>
            
            {/* Enhanced User Menu */}
            <Menu
              anchorEl={userAnchorEl}
              open={Boolean(userAnchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 280,
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              {/* User Info Header */}
              <Box sx={{ 
                px: 3, 
                py: 3, 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 52,
                      height: 52,
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)',
                      fontWeight: 700,
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                      {getUserDisplayName()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'Inter', sans-serif" }}>
                      {userProfile?.role ? t(userProfile.role) : t('general_practitioner')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "'Inter', sans-serif" }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Menu Items */}
              <MenuItem onClick={handleProfileClick} sx={{ py: 2, px: 3 }}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('profile_settings')}
                  sx={{ '& .MuiListItemText-primary': { fontFamily: "'Inter', sans-serif" } }}
                />
              </MenuItem>
              
              <MenuItem onClick={() => { setUserAnchorEl(null); navigate('/dashboard'); }} sx={{ py: 2, px: 3 }}>
                <ListItemIcon>
                  <AdminPanelSettings fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={t('dashboard')}
                  sx={{ '& .MuiListItemText-primary': { fontFamily: "'Inter', sans-serif" } }}
                />
              </MenuItem>
              
              <Divider sx={{ my: 1 }} />
              
              <MenuItem 
                onClick={handleSignOut} 
                sx={{ 
                  py: 2, 
                  px: 3,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  },
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={t('sign_out')}
                  sx={{ '& .MuiListItemText-primary': { fontFamily: "'Inter', sans-serif" } }}
                />
              </MenuItem>
            </Menu>
          </Paper>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;