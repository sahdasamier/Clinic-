import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const drawerWidth = 280;
const collapsedDrawerWidth = 80;
const mobileDrawerWidth = 260;

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
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Determine drawer width based on screen size and collapse state
  const getDrawerWidth = () => {
    if (isMobile) return mobileDrawerWidth;
    return isCollapsed ? collapsedDrawerWidth : drawerWidth;
  };

  const currentWidth = getDrawerWidth();

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
      {/* Logo/Brand Section */}
      <Box 
        sx={{ 
          p: (isCollapsed && !isMobile) ? 2 : { xs: 3, md: 4 }, 
          pb: (isCollapsed && !isMobile) ? 2 : { xs: 2, md: 3 },
          display: 'flex', 
          alignItems: 'center',
          justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: (isCollapsed && !isMobile) ? '60%' : '80%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
            transition: 'width 0.3s ease',
          }
        }}
      >
        <Tooltip title={(isCollapsed && !isMobile) ? `${getClinicDisplayName()} - ${getClinicTagline()}` : ""} placement="right">
          <Box
            sx={{
              width: (isCollapsed && !isMobile) ? 48 : { xs: 52, md: 56 },
              height: (isCollapsed && !isMobile) ? 48 : { xs: 52, md: 56 },
              borderRadius: (isCollapsed && !isMobile) ? '16px' : { xs: '18px', md: '20px' },
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: (isCollapsed && !isMobile) ? 0 : { xs: 2, md: 3 },
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              '&:hover': {
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.1) 60deg, transparent 120deg)',
                animation: 'rotate 8s linear infinite',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover::before': {
                opacity: 1,
              },
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '1px',
                left: '1px',
                right: '1px',
                bottom: '1px',
                borderRadius: (isCollapsed && !isMobile) ? '15px' : '19px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                pointerEvents: 'none',
              },
            }}
          >
            <svg 
              width={(isCollapsed && !isMobile) ? "28" : (isMobile ? "32" : "36")} 
              height={(isCollapsed && !isMobile) ? "28" : (isMobile ? "32" : "36")} 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ zIndex: 2, filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))' }}
            >
              <defs>
                <linearGradient id="premiumCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#ffffff',stopOpacity:1}} />
                  <stop offset="30%" style={{stopColor:'#e0e7ff',stopOpacity:1}} />
                  <stop offset="70%" style={{stopColor:'#c7d2fe',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#a5b4fc',stopOpacity:1}} />
                </linearGradient>
                
                <linearGradient id="premiumCheckGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#22d3ee',stopOpacity:1}} />
                  <stop offset="50%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#0891b2',stopOpacity:1}} />
                </linearGradient>
                
                <filter id="premiumGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.1"/>
                </filter>
              </defs>
              
              <circle cx="50" cy="50" r="38" fill="rgba(255, 255, 255, 0.05)" opacity="0.8"/>
              
              <circle 
                cx="50" 
                cy="50" 
                r="32" 
                stroke="url(#premiumCircleGradient)" 
                strokeWidth="2.5" 
                fill="rgba(255, 255, 255, 0.08)" 
                filter="url(#premiumGlow)"
              />
              
              <circle 
                cx="50" 
                cy="50" 
                r="28" 
                stroke="rgba(255, 255, 255, 0.2)" 
                strokeWidth="1" 
                fill="none"
                opacity="0.6"
              />
              
              <polyline 
                points="36,50 44,58 64,38" 
                fill="none" 
                stroke="url(#premiumCheckGradient)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                filter="url(#innerShadow)"
              />
            </svg>
          </Box>
        </Tooltip>
        
        {/* Brand Text - Hidden when collapsed on desktop */}
        <Collapse in={!(isCollapsed && !isMobile)} orientation="horizontal">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 700, 
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                mb: 0.5,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                whiteSpace: 'nowrap',
              }}
            >
              {getClinicDisplayName()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 4, 
                  height: 4, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(45deg, #22d3ee, #06b6d4)',
                  boxShadow: '0 0 8px rgba(34, 211, 238, 0.4)',
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.6rem', md: '0.65rem' },
                  opacity: 0.85,
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
        px: (isCollapsed && !isMobile) ? 1 : { xs: 3, md: 4 }, 
        py: 2, 
        transition: 'padding 0.3s ease' 
      }}>
        <List sx={{ py: 0 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <ListItem key={link.to} disablePadding sx={{ mb: (isCollapsed && !isMobile) ? 0.5 : 1 }}>
                <Tooltip 
                  title={(isCollapsed && !isMobile) ? t(link.text) : ""} 
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    component={Link}
                    to={link.to}
                    onClick={isMobile ? toggleSidebar : undefined} // Close sidebar on mobile when item clicked
                    sx={{
                      borderRadius: (isCollapsed && !isMobile) ? '12px' : '14px',
                      py: (isCollapsed && !isMobile) ? 1.5 : { xs: 1.5, md: 2 },
                      px: (isCollapsed && !isMobile) ? 0 : { xs: 2, md: 3 },
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: { xs: 44, md: 48 },
                      justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start',
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.75)',
                      background: isActive 
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
                        : 'transparent',
                      backdropFilter: isActive ? 'blur(10px)' : 'none',
                      border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                      boxShadow: isActive ? '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none',
                      '&:hover': {
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        color: 'white',
                        transform: (isCollapsed && !isMobile) ? 'scale(1.05)' : 'translateX(4px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: isActive ? '4px' : '0px',
                        background: 'linear-gradient(180deg, #22d3ee 0%, #06b6d4 100%)',
                        borderRadius: '0 2px 2px 0',
                        transition: 'width 0.3s ease',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: (isCollapsed && !isMobile) ? 'auto' : { xs: 40, md: 44 },
                        mr: (isCollapsed && !isMobile) ? 0 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& svg': {
                          fontSize: (isCollapsed && !isMobile) ? 22 : { xs: 20, md: 20 },
                          filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 'none',
                        },
                      }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    
                    {/* Text - Hidden when collapsed on desktop */}
                    <Collapse in={!(isCollapsed && !isMobile)} orientation="horizontal">
                      <ListItemText
                        primary={t(link.text)}
                        sx={{
                          ml: 1,
                          '& .MuiListItemText-primary': {
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: isActive ? 600 : 500,
                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                            letterSpacing: '0.01em',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                    </Collapse>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer - Hidden when collapsed on desktop */}
      <Collapse in={!(isCollapsed && !isMobile)}>
        <Box sx={{ px: { xs: 3, md: 4 }, py: 3, mt: 2 }}>
          <Box 
            sx={{ 
              p: { xs: 2, md: 3 },
              borderRadius: '12px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500,
                fontSize: { xs: '0.65rem', md: '0.7rem' },
                letterSpacing: '0.05em',
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
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', md: '0.75rem' },
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
          },
        }}
      >
        <DrawerContent />
      </SwipeableDrawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: currentWidth,
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        [`& .MuiDrawer-paper`]: {
          width: currentWidth,
          boxSizing: 'border-box',
          backgroundColor: 'primary.main',
          color: 'white',
          borderRight: 'none',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        },
      }}
    >
      <DrawerContent />
    </Drawer>
  );
};

export default Sidebar; 