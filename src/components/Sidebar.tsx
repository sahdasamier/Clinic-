import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../images/Logo.png';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useClinicSettings } from '../hooks/useClinicSettings';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  Collapse,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Dashboard,
  People,
  CalendarToday,
  Inventory,
  Payment,
  Notifications,
  Settings,
  LocalHospital,
  Schedule,
} from '@mui/icons-material';

const drawerWidth = 300;
const collapsedDrawerWidth = 68;
const mobileDrawerWidth = 280;

const navLinks = [
  { to: '/', text: 'dashboard', icon: <Dashboard /> },
  { to: '/patients', text: 'patients', icon: <People /> },
  { to: '/appointments', text: 'appointments', icon: <CalendarToday /> },
  { to: '/inventory', text: 'inventory', icon: <Inventory /> },
  { to: '/payments', text: 'payments', icon: <Payment /> },
  { to: '/notifications', text: 'notifications', icon: <Notifications /> },
  { to: '/doctor-scheduling', text: 'doctor_scheduling', icon: <Schedule /> },
  { to: '/settings', text: 'settings', icon: <Settings /> },
];

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { userClinic } = useUser();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { getClinicDisplayName, getClinicTagline } = useClinicSettings();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // Determine drawer width based on screen size and collapse state
  const getDrawerWidth = () => {
    if (isMobile) return mobileDrawerWidth;
    if (isTablet && isCollapsed) return collapsedDrawerWidth;
    return isCollapsed ? collapsedDrawerWidth : drawerWidth;
  };

  const currentWidth = getDrawerWidth();

  // Enhanced floating button styles with sophisticated animations
  const floatingButtonStyles = {
    position: 'fixed' as const,
    top: isSmallMobile ? 16 : 20,
    left: isSmallMobile ? 16 : 20,
    width: isSmallMobile ? 52 : 60,
    height: isSmallMobile ? 52 : 60,
    borderRadius: '18px',
    background: 'linear-gradient(145deg, #667eea 0%, #764ba2 50%, #8b5cf6 100%)',
    backdropFilter: 'blur(20px)',
    border: '2px solid rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1300,
    boxShadow: `
      0 12px 40px rgba(102, 126, 234, 0.4),
      0 4px 16px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.15) translateY(-3px) rotate(5deg)',
      boxShadow: `
        0 20px 60px rgba(102, 126, 234, 0.5),
        0 8px 24px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4)
      `,
      background: 'linear-gradient(145deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      '& img': {
        filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4)) brightness(1.4) contrast(1.3)',
        transform: 'scale(1.2) rotate(-5deg)',
      }
    },
    '&:active': {
      transform: 'scale(1.1) translateY(-2px) rotate(2deg)',
      transition: 'all 0.15s ease',
    },
    // Enhanced floating animation with breathing effect
    animation: `
      float 4s ease-in-out infinite,
      breathe 3s ease-in-out infinite
    `,
    '@keyframes float': {
      '0%, 100%': {
        transform: 'translateY(0px)',
      },
      '25%': {
        transform: 'translateY(-6px) rotate(1deg)',
      },
      '50%': {
        transform: 'translateY(-4px)',
      },
      '75%': {
        transform: 'translateY(-8px) rotate(-1deg)',
      },
    },
    '@keyframes breathe': {
      '0%, 100%': {
        boxShadow: `
          0 12px 40px rgba(102, 126, 234, 0.4),
          0 4px 16px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `,
      },
      '50%': {
        boxShadow: `
          0 16px 50px rgba(102, 126, 234, 0.6),
          0 6px 20px rgba(0, 0, 0, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.4)
        `,
        borderColor: 'rgba(255, 255, 255, 0.35)',
      },
    },
    // Add ripple effect
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -4,
      left: -4,
      right: -4,
      bottom: -4,
      borderRadius: '22px',
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), transparent)',
      animation: 'ripple 2s ease-out infinite',
      pointerEvents: 'none',
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(1)',
        opacity: 0.5,
      },
      '100%': {
        transform: 'scale(1.3)',
        opacity: 0,
      },
    },
  };

  // Drawer content component
  const DrawerContent = () => (
    <Box sx={{ 
      overflow: 'auto', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.1)',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '2px',
      },
    }}>
      {/* Sidebar Toggle Button */}
      <Box 
        sx={{ 
          p: (isCollapsed && !isMobile) ? 1.5 : { xs: 2.5, md: 3 }, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: (isCollapsed && !isMobile) ? 'center' : 'space-between',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: (isCollapsed && !isMobile) ? '70%' : '85%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
            transition: 'width 0.4s ease',
          }
        }}
      >
        <Zoom in={true} timeout={600}>
          <Tooltip 
            title={!isMobile ? (isCollapsed ? "Expand Sidebar" : "Collapse Sidebar") : ""} 
            placement="right"
            arrow
          >
            <Box
              onClick={!isMobile ? toggleSidebar : undefined}
              sx={{
                width: (isCollapsed && !isMobile) ? 36 : { xs: 42, md: 46 },
                height: (isCollapsed && !isMobile) ? 36 : { xs: 42, md: 46 },
                borderRadius: '12px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !isMobile ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                '&:hover': !isMobile ? {
                  transform: 'scale(1.12) rotate(2deg)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '& img': {
                    filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25)) brightness(1.4) contrast(1.3)',
                    transform: (isCollapsed && !isMobile) ? 'scale(0.95) rotate(-2deg)' : 'scale(1.1) rotate(-2deg)',
                  }
                } : {},
                '&:active': !isMobile ? {
                  transform: 'scale(1.05)',
                  transition: 'all 0.15s ease',
                } : {},
              }}
            >
              <img 
                src={logoImage}
                alt="Clinic Logo"
                style={{ 
                  width: (isCollapsed && !isMobile) ? '20px' : '24px',
                  height: (isCollapsed && !isMobile) ? '20px' : '24px',
                  objectFit: 'contain',
                  zIndex: 2, 
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) brightness(1.3) contrast(1.2)',
                  transform: (isCollapsed && !isMobile) ? 'scale(0.9)' : 'scale(1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '4px',
                  opacity: 0.98
                }}
              />
            </Box>
          </Tooltip>
        </Zoom>
        
        {/* Brand Text - Hidden when collapsed on desktop */}
        <Collapse in={!(isCollapsed && !isMobile)} orientation="horizontal" timeout={400}>
          <Box sx={{ flex: 1, minWidth: 0, ml: 2.5 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 700, 
                fontSize: { xs: '1.15rem', md: '1.3rem' },
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                mb: 0.5,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
            >
              {getClinicDisplayName()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box 
                sx={{ 
                  width: 4, 
                  height: 4, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(45deg, #22d3ee, #06b6d4)',
                  boxShadow: '0 0 8px rgba(34, 211, 238, 0.5)',
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.2)', opacity: 0.8 },
                  }
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.6rem', md: '0.65rem' },
                  opacity: 0.9,
                  whiteSpace: 'nowrap',
                }}
              >
                {getClinicTagline()}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ 
        flex: 1, 
        px: (isCollapsed && !isMobile) ? 0.8 : { xs: 3, md: 4 }, 
        py: (isCollapsed && !isMobile) ? 1.5 : 2.5, 
        transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}>
        <List sx={{ py: 0 }}>
          {navLinks.map((link, index) => {
            const isActive = location.pathname === link.to;
            return (
              <Fade in={true} timeout={300 + index * 100} key={link.to}>
                <ListItem disablePadding sx={{ mb: (isCollapsed && !isMobile) ? 0.5 : 1.2 }}>
                  <Tooltip 
                    title={(isCollapsed && !isMobile) ? t(link.text) : ""} 
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      component={Link}
                      to={link.to}
                      onClick={isMobile ? toggleSidebar : undefined}
                      sx={{
                        borderRadius: (isCollapsed && !isMobile) ? '14px' : '16px',
                        py: (isCollapsed && !isMobile) ? 1.8 : { xs: 1.8, md: 2.2 },
                        px: (isCollapsed && !isMobile) ? 0 : { xs: 2.5, md: 3 },
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: (isCollapsed && !isMobile) ? 44 : { xs: 48, md: 52 },
                        justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start',
                        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.78)',
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.12) 100%)'
                          : 'transparent',
                        backdropFilter: isActive ? 'blur(12px)' : 'none',
                        border: isActive ? '1.5px solid rgba(255, 255, 255, 0.25)' : '1.5px solid transparent',
                        boxShadow: isActive ? '0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)' : 'none',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: isActive 
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.18) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                          color: 'white',
                          transform: (isCollapsed && !isMobile) ? 'scale(1.08)' : 'translateX(6px)',
                          border: '1.5px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        },
                        '&:active': {
                          transform: (isCollapsed && !isMobile) ? 'scale(1.02)' : 'translateX(3px)',
                          transition: 'all 0.15s ease',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: isActive ? '5px' : '0px',
                          background: 'linear-gradient(180deg, #22d3ee 0%, #06b6d4 100%)',
                          borderRadius: '0 3px 3px 0',
                          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: isActive ? '0 0 10px rgba(34, 211, 238, 0.5)' : 'none',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: 'inherit',
                          minWidth: (isCollapsed && !isMobile) ? 'auto' : { xs: 40, md: 42 },
                          mr: (isCollapsed && !isMobile) ? 0 : 1.2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          '& svg': {
                            fontSize: (isCollapsed && !isMobile) ? 20 : { xs: 20, md: 22 },
                            filter: isActive ? 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15))' : 'none',
                            transition: 'all 0.3s ease',
                          },
                        }}
                      >
                        {link.icon}
                      </ListItemIcon>
                      
                      {/* Text - Hidden when collapsed on desktop */}
                      <Collapse in={!(isCollapsed && !isMobile)} orientation="horizontal" timeout={300}>
                        <ListItemText
                          primary={t(link.text)}
                          sx={{
                            ml: 1.2,
                            '& .MuiListItemText-primary': {
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: isActive ? 600 : 500,
                              fontSize: { xs: '0.9rem', md: '0.95rem' },
                              letterSpacing: '0.01em',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.3s ease',
                            },
                          }}
                        />
                      </Collapse>
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </Fade>
            );
          })}
        </List>
      </Box>

      {/* Footer - Hidden when collapsed on desktop */}
      <Collapse in={!(isCollapsed && !isMobile)} timeout={400}>
        <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5, mt: 2 }}>
          <Box 
            sx={{ 
              p: { xs: 2.5, md: 3 },
              borderRadius: '14px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255, 255, 255, 0.65)',
                fontWeight: 500,
                fontSize: { xs: '0.68rem', md: '0.72rem' },
                letterSpacing: '0.06em',
                display: 'block',
                mb: 0.5,
              }}
            >
              POWERED BY
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 600,
                fontSize: { xs: '0.74rem', md: '0.78rem' },
                letterSpacing: '0.02em',
              }}
            >
              Clinicy Pro • v2.0.1
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );

  // Return different drawer types based on screen size
  if (isMobile) {
    return (
      <>
        <SwipeableDrawer
          variant="temporary"
          open={!isCollapsed}
          onClose={toggleSidebar}
          onOpen={toggleSidebar}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: mobileDrawerWidth,
              boxSizing: 'border-box',
              backgroundColor: 'primary.main',
              color: 'white',
              borderRight: 'none',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        >
          <DrawerContent />
        </SwipeableDrawer>

        {/* Enhanced Floating Expand Button - Shows when mobile sidebar is closed */}
        <Zoom in={isCollapsed} timeout={400}>
          <Box
            onClick={toggleSidebar}
            sx={floatingButtonStyles}
          >
            <img 
              src={logoImage}
              alt="Expand Sidebar"
              style={{ 
                width: isSmallMobile ? '26px' : '30px',
                height: isSmallMobile ? '26px' : '30px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25)) brightness(1.3) contrast(1.2)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '5px',
              }}
            />
          </Box>
        </Zoom>
      </>
    );
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: currentWidth,
          flexShrink: 0,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          [`& .MuiDrawer-paper`]: {
            width: currentWidth,
            boxSizing: 'border-box',
            backgroundColor: 'primary.main',
            color: 'white',
            borderRight: 'none',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            boxShadow: isCollapsed ? '0 0 20px rgba(0, 0, 0, 0.1)' : '0 0 30px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DrawerContent />
      </Drawer>
    </>
  );
};

export default Sidebar; 