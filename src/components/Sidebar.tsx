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
const collapsedDrawerWidth = 64;
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
      {/* Sidebar Toggle Button */}
      <Box 
        sx={{ 
          p: (isCollapsed && !isMobile) ? 1.5 : { xs: 2, md: 2.5 }, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: (isCollapsed && !isMobile) ? 'center' : 'space-between',
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
        <Tooltip 
          title={!isMobile ? (isCollapsed ? "Expand Sidebar" : "Collapse Sidebar") : ""} 
          placement="right"
        >
          <Box
            onClick={!isMobile ? toggleSidebar : undefined}
            sx={{
              width: (isCollapsed && !isMobile) ? 32 : { xs: 36, md: 40 },
              height: (isCollapsed && !isMobile) ? 32 : { xs: 36, md: 40 },
              borderRadius: '10px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !isMobile ? 'pointer' : 'default',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              '&:hover': !isMobile ? {
                transform: 'scale(1.1)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.15) 100%)',
                '& img': {
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) brightness(1.3) contrast(1.2)',
                  transform: (isCollapsed && !isMobile) ? 'scale(0.9)' : 'scale(1.05)',
                }
              } : {},
            }}
          >
            <img 
              src={logoImage}
              alt="Clinic Logo"
              style={{ 
                width: (isCollapsed && !isMobile) ? '18px' : '22px',
                height: (isCollapsed && !isMobile) ? '18px' : '22px',
                objectFit: 'contain',
                zIndex: 2, 
                filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.15)) brightness(1.2) contrast(1.1)',
                transform: (isCollapsed && !isMobile) ? 'scale(0.85)' : 'scale(1)',
                transition: 'all 0.3s ease',
                borderRadius: '3px',
                opacity: 0.95
              }}
            />
          </Box>
        </Tooltip>
        
        {/* Brand Text - Hidden when collapsed on desktop */}
        <Collapse in={!(isCollapsed && !isMobile)} orientation="horizontal">
          <Box sx={{ flex: 1, minWidth: 0, ml: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 700, 
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.01em',
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
                  width: 3, 
                  height: 3, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(45deg, #22d3ee, #06b6d4)',
                  boxShadow: '0 0 6px rgba(34, 211, 238, 0.4)',
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: "'Inter', sans-serif",
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.55rem', md: '0.6rem' },
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
        px: (isCollapsed && !isMobile) ? 0.5 : { xs: 3, md: 4 }, 
        py: (isCollapsed && !isMobile) ? 1 : 2, 
        transition: 'padding 0.3s ease' 
      }}>
        <List sx={{ py: 0 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <ListItem key={link.to} disablePadding sx={{ mb: (isCollapsed && !isMobile) ? 0.25 : 1 }}>
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
                      minHeight: (isCollapsed && !isMobile) ? 40 : { xs: 44, md: 48 },
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
                        minWidth: (isCollapsed && !isMobile) ? 'auto' : { xs: 36, md: 38 },
                        mr: (isCollapsed && !isMobile) ? 0 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& svg': {
                          fontSize: (isCollapsed && !isMobile) ? 18 : { xs: 18, md: 18 },
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
            },
          }}
        >
          <DrawerContent />
        </SwipeableDrawer>

        {/* Floating Expand Button - Shows when mobile sidebar is closed */}
        {isCollapsed && (
          <Box
            onClick={toggleSidebar}
            sx={{
              position: 'fixed',
              top: 20,
              left: 20,
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1300, // Above most content but below modals
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.1) translateY(-2px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                background: 'linear-gradient(145deg, #7c3aed 0%, #8b5cf6 100%)',
                '& img': {
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) brightness(1.3) contrast(1.2)',
                  transform: 'scale(1.1)',
                }
              },
              '&:active': {
                transform: 'scale(1.05) translateY(-1px)',
              },
              // Floating animation
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': {
                  transform: 'translateY(0px)',
                },
                '50%': {
                  transform: 'translateY(-4px)',
                },
              },
            }}
          >
            <img 
              src={logoImage}
              alt="Expand Sidebar"
              style={{ 
                width: '28px',
                height: '28px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) brightness(1.2) contrast(1.1)',
                transition: 'all 0.3s ease',
                borderRadius: '4px',
              }}
            />
          </Box>
        )}
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
    </>
  );
};

export default Sidebar; 