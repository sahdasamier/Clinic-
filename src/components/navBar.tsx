import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '../api/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useClinicSettings } from '../hooks/useClinicSettings';
import { updateDocumentDirection } from '../utils/i18nUtils';
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
  CalendarToday,
  Payment,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';

const NavBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const { userProfile } = useUser();
  const { unreadCount } = useNotifications();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { getClinicDisplayName, getClinicTagline, isBrandingConfigured } = useClinicSettings();
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const langBtnRef = React.useRef<HTMLButtonElement | null>(null);

  // Language menu state
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // User menu state
  const [userAnchorEl, setUserAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Notification menu state
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    updateDocumentDirection();
    setLanguageAnchorEl(null);
  };

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => setLanguageAnchorEl(null);
 
  

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };
  

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleViewAllNotifications = () => {
    setNotificationAnchorEl(null);
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    setUserAnchorEl(null);
    navigate('/settings');
  };

  const handleSignOut = async () => {
    try {
      setUserAnchorEl(null);
      await authHelpers.signOut();
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
        background: `
          linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 30%, rgba(241, 245, 249, 0.98) 100%),
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.02) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.02) 0%, transparent 50%)
        `,
        backdropFilter: 'blur(30px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
        color: 'text.primary',
        boxShadow: `
          0 4px 32px rgba(0, 0, 0, 0.04),
          0 2px 16px rgba(0, 0, 0, 0.02),
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          inset 0 -1px 0 rgba(0, 0, 0, 0.02)
        `,
        position: 'relative',
        width: '100%',
        height: { xs: '74px', sm: '84px', md: '94px', lg: '104px' },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.4) 15%, rgba(99, 102, 241, 0.5) 30%, rgba(139, 92, 246, 0.4) 50%, rgba(99, 102, 241, 0.5) 70%, rgba(59, 130, 246, 0.4) 85%, transparent 100%)',
          animation: 'shimmer 3s ease-in-out infinite',
          '@keyframes shimmer': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 1 },
          },
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.08) 50%, transparent 100%)',
        },
      }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between', 
        py: { xs: 1, sm: 1.5, md: 2, lg: 2.5 }, 
        px: { xs: 2, sm: 3, md: 4, lg: 5 }, 
        position: 'relative',
        minHeight: { xs: '60px', sm: '64px', md: '68px', lg: '72px' },
        maxWidth: '100%',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          width: '100%',
          height: '1px',
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
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
          <Tooltip 
            title={t('change_language')}
            sx={{
              '& .MuiTooltip-tooltip': {
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
              },
            }}
          >
            <IconButton
              ref={langBtnRef}
              onClick={handleLanguageMenuOpen}
              sx={{
                width: { xs: 36, sm: 40, md: 44, lg: 48 },
                height: { xs: 36, sm: 40, md: 44, lg: 48 },
                borderRadius: { xs: '12px', md: '14px', lg: '16px' },
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
                color: 'text.secondary',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
                  color: '#6366f1',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  '&::before': {
                    transform: 'translateX(100%)',
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s ease',
                },
              }}
            >
              <Language sx={{ 
                fontSize: { xs: 18, sm: 20, md: 22, lg: 24 },
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                transition: 'all 0.3s ease',
              }} />
            </IconButton>
          </Tooltip>

                           <Menu
         anchorEl={languageAnchorEl}
         open={Boolean(languageAnchorEl)}
         onClose={handleLanguageMenuClose}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
         transformOrigin={{ vertical: 'top', horizontal: 'right' }}
         sx={{ zIndex: 9999 }}
         PaperProps={{
           sx: {
             mt: 0.5,
             minWidth: 180,
             borderRadius: '16px',
             background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
             backdropFilter: 'blur(25px)',
             border: '1px solid rgba(255, 255, 255, 0.3)',
             boxShadow: `
               0 20px 40px rgba(0, 0, 0, 0.12),
               0 8px 16px rgba(0, 0, 0, 0.08),
               inset 0 1px 0 rgba(255, 255, 255, 0.6)
             `,
             overflow: 'hidden',
             position: 'relative',
             '&::before': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               height: '1px',
               background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.4) 50%, transparent 100%)',
             },
             '& .MuiList-root': {
               p: 1,
             },
             '& .MuiMenuItem-root': {
               borderRadius: '12px',
               mb: 0.5,
               px: 3,
               py: 2,
               minHeight: 48,
               fontSize: '0.95rem',
               fontWeight: 500,
               fontFamily: "'Inter', sans-serif",
               position: 'relative',
               overflow: 'hidden',
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
               '&:last-child': {
                 mb: 0,
               },
               '&:hover': {
                 background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
                 transform: 'translateX(4px)',
                 boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                 '&::before': {
                   transform: 'translateX(0)',
                 },
               },
               '&.Mui-selected': {
                 background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%)',
                 color: '#1976d2',
                 fontWeight: 600,
                 '&::after': {
                   content: '""',
                   position: 'absolute',
                   left: 8,
                   top: '50%',
                   transform: 'translateY(-50%)',
                   width: 3,
                   height: 20,
                   background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
                   borderRadius: '2px',
                   boxShadow: '0 0 8px rgba(25, 118, 210, 0.4)',
                 },
                 '&:hover': {
                   background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)',
                 },
               },
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
                 transform: 'translateX(-100%)',
                 transition: 'transform 0.6s ease',
                 pointerEvents: 'none',
               },
             },
           },
         }}
       >
         <MenuItem
           onClick={() => changeLanguage('en')}
           selected={i18n.language === 'en'}
           sx={{
             display: 'flex',
             alignItems: 'center',
             gap: 2,
           }}
         >
           <Box
             sx={{
               width: 24,
               height: 18,
               borderRadius: '3px',
               background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #ef4444 100%)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '12px',
               fontWeight: 'bold',
               color: 'white',
               textShadow: '0 1px 2px rgba(0,0,0,0.3)',
               boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
             }}
           >
             EN
           </Box>
           <Box sx={{ flex: 1 }}>
             <Typography variant="body2" sx={{ fontWeight: 'inherit', lineHeight: 1.2 }}>
               English
             </Typography>
             <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
               Default language
             </Typography>
           </Box>
         </MenuItem>
         
         <MenuItem
           onClick={() => changeLanguage('ar')}
           selected={i18n.language === 'ar'}
           sx={{
             display: 'flex',
             alignItems: 'center',
             gap: 2,
           }}
         >
           <Box
             sx={{
               width: 24,
               height: 18,
               borderRadius: '3px',
               background: 'linear-gradient(135deg, #065f46 0%, #10b981 50%, #ffffff 100%)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '12px',
               fontWeight: 'bold',
               color: 'white',
               textShadow: '0 1px 2px rgba(0,0,0,0.3)',
               boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
             }}
           >
             AR
           </Box>
           <Box sx={{ flex: 1 }}>
             <Typography variant="body2" sx={{ fontWeight: 'inherit', lineHeight: 1.2 }}>
               العربية
             </Typography>
             <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
               اللغة العربية
             </Typography>
           </Box>
         </MenuItem>
       </Menu>

          {/* Notifications */}
          <Tooltip 
            title={t('notifications')}
            sx={{
              '& .MuiTooltip-tooltip': {
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
              },
            }}
          >
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                width: { xs: 36, sm: 40, md: 44, lg: 48 },
                height: { xs: 36, sm: 40, md: 44, lg: 48 },
                borderRadius: { xs: '12px', md: '14px', lg: '16px' },
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
                color: 'text.secondary',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: unreadCount > 0 
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
                  color: unreadCount > 0 ? '#dc2626' : '#6366f1',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: unreadCount > 0 
                    ? '0 8px 25px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                    : '0 8px 25px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                  border: unreadCount > 0 
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(99, 102, 241, 0.3)',
                  '&::before': {
                    transform: 'translateX(100%)',
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: unreadCount > 0
                    ? 'linear-gradient(45deg, transparent 30%, rgba(239, 68, 68, 0.1) 50%, transparent 70%)'
                    : 'linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s ease',
                },
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                    minWidth: { xs: '18px', md: '20px' },
                    height: { xs: '18px', md: '20px' },
                    borderRadius: { xs: '10px', md: '11px' },
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    fontFamily: "'Inter', sans-serif",
                  }
                }}
              >
                <Notifications sx={{ 
                  fontSize: { xs: 18, sm: 20, md: 22, lg: 24 },
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                  transition: 'all 0.3s ease',
                }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notification Popup Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ zIndex: 9999 }}
            PaperProps={{
              sx: {
                mt: 0.5,
                minWidth: 380,
                maxWidth: 420,
                borderRadius: '20px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `
                  0 25px 50px rgba(0, 0, 0, 0.15),
                  0 10px 20px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.7)
                `,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 20%, rgba(99, 102, 241, 0.6) 50%, rgba(59, 130, 246, 0.6) 80%, transparent 100%)',
                },
                '& .MuiList-root': {
                  p: 0,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '3px',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.3)',
                    },
                  },
                },
              },
            }}
          >
            {/* Header */}
            <Box sx={{ 
              px: 4, 
              py: 3, 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.03) 100%)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
              },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <Notifications sx={{ fontSize: '1.4rem', color: '#1976d2' }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: "'Inter', sans-serif", 
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        lineHeight: 1.2,
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Notifications
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8rem',
                      }}
                    >
                      {unreadCount > 0 ? `${unreadCount} new notifications` : 'All caught up!'}
                    </Typography>
                  </Box>
                </Box>
                
                {unreadCount > 0 && (
                  <Button
                    size="small"
                    onClick={() => {/* Mark all as read functionality */}}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1976d2',
                      '&:hover': {
                        background: 'rgba(59, 130, 246, 0.08)',
                      },
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </Box>
            </Box>

            {/* Notifications List */}
            <Box sx={{ py: 1 }}>
              {unreadCount > 0 ? (
                // Sample notifications - replace with actual notification data
                [
                  {
                    id: 1,
                    title: 'New Appointment Scheduled',
                    message: 'John Doe has booked an appointment for tomorrow at 2:00 PM',
                    time: '5 minutes ago',
                    type: 'appointment',
                    unread: true,
                  },
                  {
                    id: 2,
                    title: 'Payment Received',
                    message: 'Payment of $150 received from Sarah Smith',
                    time: '1 hour ago',
                    type: 'payment',
                    unread: true,
                  },
                  {
                    id: 3,
                    title: 'System Update',
                    message: 'New features have been added to the patient management system',
                    time: '2 hours ago',
                    type: 'system',
                    unread: false,
                  },
                ].map((notification) => (
                  <Box
                    key={notification.id}
                    sx={{
                      mx: 2,
                      mb: 1,
                      p: 3,
                      borderRadius: '12px',
                      background: notification.unread 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)'
                        : 'transparent',
                      border: notification.unread 
                        ? '1px solid rgba(59, 130, 246, 0.1)'
                        : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          background: 
                            notification.type === 'appointment' 
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
                              : notification.type === 'payment'
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 
                            notification.type === 'appointment' 
                              ? '1px solid rgba(16, 185, 129, 0.2)'
                              : notification.type === 'payment'
                              ? '1px solid rgba(245, 158, 11, 0.2)'
                              : '1px solid rgba(99, 102, 241, 0.2)',
                          flexShrink: 0,
                        }}
                      >
                        {notification.type === 'appointment' && (
                          <CalendarToday sx={{ fontSize: '1rem', color: '#10b981' }} />
                        )}
                        {notification.type === 'payment' && (
                          <Payment sx={{ fontSize: '1rem', color: '#f59e0b' }} />
                        )}
                        {notification.type === 'system' && (
                          <Settings sx={{ fontSize: '1rem', color: '#6366f1' }} />
                        )}
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              lineHeight: 1.2,
                              flex: 1,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {notification.unread && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#1976d2',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            mb: 1,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <AccessTime sx={{ fontSize: '0.75rem' }} />
                          {notification.time}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, px: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <CheckCircle sx={{ fontSize: '2rem', color: '#10b981' }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    All caught up!
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    You have no new notifications
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box sx={{ 
              p: 2,
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.3) 100%)',
            }}>
              <Button
                fullWidth
                onClick={handleViewAllNotifications}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
                  color: '#1976d2',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'none',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                  },
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </Menu>

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
                  background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
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
              data-menu="user"
              sx={{ zIndex: 9999 }}
              PaperProps={{
                sx: {
                  mt: 0.5,
                  minWidth: 320,
                  borderRadius: '20px',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: `
                    0 25px 50px rgba(0, 0, 0, 0.15),
                    0 10px 20px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.7)
                  `,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 20%, rgba(99, 102, 241, 0.6) 50%, rgba(59, 130, 246, 0.6) 80%, transparent 100%)',
                  },
                  '& .MuiList-root': {
                    p: 0,
                  },
                  '& .MuiMenuItem-root': {
                    px: 3,
                    py: 2.5,
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
                      transform: 'translateX(4px)',
                      '&::before': {
                        transform: 'translateX(0)',
                      },
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
                      transform: 'translateX(-100%)',
                      transition: 'transform 0.6s ease',
                      pointerEvents: 'none',
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: 40,
                      color: 'inherit',
                      '& svg': {
                        fontSize: '1.2rem',
                      },
                    },
                  },
                },
              }}
            >
              {/* User Info Header */}
              <Box sx={{ 
                px: 4, 
                py: 4, 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.03) 100%)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
                        fontFamily: "'Inter', 'SF Pro Display', sans-serif",
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        border: '3px solid rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #10b981, #059669)',
                        border: '2px solid white',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                          '50%': { opacity: 0.8, transform: 'scale(1.1)' },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontFamily: "'Inter', sans-serif", 
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        lineHeight: 1.2,
                        mb: 0.5,
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {getUserDisplayName()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.3,
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#1976d2',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            fontFamily: "'Inter', sans-serif",
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {userProfile?.role ? t(userProfile.role) : t('general_practitioner')}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: '#10b981',
                          flexShrink: 0,
                        }}
                      />
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Menu Items */}
              <Box sx={{ py: 1 }}>
                <MenuItem 
                  onClick={handleProfileClick}
                  sx={{
                    mx: 2,
                    mb: 1,
                    borderRadius: '12px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}
                    >
                      <Person sx={{ fontSize: '1.1rem', color: '#6366f1' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('profile_settings')}
                    secondary="Manage your account"
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      },
                      '& .MuiListItemText-secondary': { 
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8rem',
                        color: 'text.secondary',
                      },
                    }}
                  />
                </MenuItem>
                
                <MenuItem 
                  onClick={() => { setUserAnchorEl(null); navigate('/dashboard'); }}
                  sx={{
                    mx: 2,
                    mb: 1,
                    borderRadius: '12px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: '1.1rem', color: '#10b981' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('dashboard')}
                    secondary="Analytics & overview"
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      },
                      '& .MuiListItemText-secondary': { 
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8rem',
                        color: 'text.secondary',
                      },
                    }}
                  />
                </MenuItem>
              </Box>
              
              <Divider sx={{ 
                mx: 2, 
                my: 1,
                background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%)',
              }} />
              
              <Box sx={{ py: 1 }}>
                <MenuItem 
                  onClick={handleSignOut} 
                  sx={{ 
                    mx: 2,
                    mb: 1,
                    borderRadius: '12px',
                    color: '#dc2626',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <Logout sx={{ fontSize: '1.1rem', color: '#dc2626' }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('sign_out')}
                    secondary="End current session"
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      },
                      '& .MuiListItemText-secondary': { 
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8rem',
                        color: 'rgba(220, 38, 38, 0.7)',
                      },
                    }}
                  />
                </MenuItem>
              </Box>
            </Menu>
          </Paper>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;