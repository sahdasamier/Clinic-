import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, Fab, Zoom, IconButton, Typography, Drawer, SpeedDial, SpeedDialAction, SpeedDialIcon, Backdrop } from '@mui/material';
import { KeyboardArrowUp, Menu as MenuIcon, Add, CalendarToday, PersonAdd, Close } from '@mui/icons-material';
import Sidebar from './Sidebar';
import Header from './NavBar';
import { useSidebar } from '../contexts/SidebarContext';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { isCollapsed } = useSidebar();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const mainContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        const scrollTop = mainContentRef.current.scrollTop;
        setShowScrollTop(scrollTop > 300);
      }
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Mobile FAB Actions based on current page
  const getFabActions = () => {
    const currentPath = location.pathname;
    
    if (currentPath.includes('/appointments')) {
      return [
        {
          icon: <CalendarToday />,
          name: 'New Appointment',
          action: () => {
            // Trigger appointment creation
            window.dispatchEvent(new CustomEvent('openAddAppointment'));
            setSpeedDialOpen(false);
          }
        },
        {
          icon: <PersonAdd />,
          name: 'New Patient',
          action: () => {
            navigate('/patients');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openAddPatient'));
            }, 100);
            setSpeedDialOpen(false);
          }
        }
      ];
    } else if (currentPath.includes('/patients')) {
      return [
        {
          icon: <PersonAdd />,
          name: 'New Patient',
          action: () => {
            // Trigger patient creation
            window.dispatchEvent(new CustomEvent('openAddPatient'));
            setSpeedDialOpen(false);
          }
        },
        {
          icon: <CalendarToday />,
          name: 'New Appointment',
          action: () => {
            navigate('/appointments');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openAddAppointment'));
            }, 100);
            setSpeedDialOpen(false);
          }
        }
      ];
    } else if (currentPath.includes('/doctor-scheduling')) {
      return [
        {
          icon: <Add />,
          name: 'New Doctor',
          action: () => {
            // Trigger doctor creation
            window.dispatchEvent(new CustomEvent('openAddDoctor'));
            setSpeedDialOpen(false);
          }
        },
        {
          icon: <CalendarToday />,
          name: 'New Appointment',
          action: () => {
            navigate('/appointments');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openAddAppointment'));
            }, 100);
            setSpeedDialOpen(false);
          }
        }
      ];
    } else if (currentPath.includes('/payments')) {
      return [
        {
          icon: <Add />,
          name: 'New Payment',
          action: () => {
            // Trigger payment creation
            window.dispatchEvent(new CustomEvent('openAddPayment'));
            setSpeedDialOpen(false);
          }
        },
        {
          icon: <PersonAdd />,
          name: 'New Patient',
          action: () => {
            navigate('/patients');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openAddPatient'));
            }, 100);
            setSpeedDialOpen(false);
          }
        }
      ];
    } else {
      return [
        {
          icon: <CalendarToday />,
          name: 'New Appointment',
          action: () => {
            navigate('/appointments');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openAddAppointment'));
            }, 100);
            setSpeedDialOpen(false);
          }
        },
        {
          icon: <PersonAdd />,
          name: 'New Patient',
          action: () => {
            navigate('/patients');
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('openAddPatient'));
            }, 100);
            setSpeedDialOpen(false);
          }
        }
      ];
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: 'background.default',
      overflow: 'hidden',
      position: 'relative',
      // Ensure proper touch handling on mobile
      touchAction: 'manipulation',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        minWidth: 0, // Prevent flex item from growing beyond container
        width: isMobile ? '100%' : 'auto',
        position: 'relative',
        // Smooth transition when sidebar toggles
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // Adjust margin for collapsed sidebar on desktop
        marginLeft: isMobile ? 0 : isCollapsed ? '80px' : '0px',
      }}>
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <Box 
          ref={mainContentRef}
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            // Responsive padding with safe area support
            p: { 
              xs: 'max(env(safe-area-inset-top, 0px), 16px) max(env(safe-area-inset-right, 0px), 16px) max(env(safe-area-inset-bottom, 0px), 16px) max(env(safe-area-inset-left, 0px), 16px)',
              sm: 'max(env(safe-area-inset-top, 0px), 24px) max(env(safe-area-inset-right, 0px), 24px) max(env(safe-area-inset-bottom, 0px), 24px) max(env(safe-area-inset-left, 0px), 24px)',
              md: 'max(env(safe-area-inset-top, 0px), 32px) max(env(safe-area-inset-right, 0px), 32px) max(env(safe-area-inset-bottom, 0px), 32px) max(env(safe-area-inset-left, 0px), 32px)'
            },
            minHeight: 0, // Prevent flex item from growing beyond container
            position: 'relative',
            // Better scrolling on iOS
            WebkitOverflowScrolling: 'touch',
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: isMobile ? '0px' : '8px',
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
          }}
        >
          {/* Content wrapper with responsive constraints */}
          <Box
            sx={{
              maxWidth: '100%',
              mx: 'auto',
              // Responsive max width
              ...(isMobile ? {} : {
                maxWidth: {
                  sm: '100%',
                  md: '100%',
                  lg: '1200px',
                  xl: '1400px',
                },
              }),
            }}
          >
            {children}
          </Box>
          
          {/* Mobile Speed Dial FAB */}
          {isMobile && (
            <>
              <Backdrop 
                open={speedDialOpen} 
                sx={{ zIndex: (theme) => theme.zIndex.speedDial - 1 }}
                onClick={() => setSpeedDialOpen(false)}
              />
              <SpeedDial
                ariaLabel="Quick Actions"
                sx={{ 
                  position: 'fixed', 
                  bottom: { xs: 85, sm: 90 }, 
                  right: { xs: 20, sm: 25 },
                  zIndex: (theme) => theme.zIndex.speedDial,
                  '& .MuiSpeedDial-fab': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'scale(1.1)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
                    }
                  },
                  '& .MuiSpeedDialAction-fab': {
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                      color: 'white',
                      transform: 'scale(1.05)',
                    }
                  }
                }}
                icon={<SpeedDialIcon openIcon={<Close />} />}
                open={speedDialOpen}
                onOpen={() => setSpeedDialOpen(true)}
                onClose={() => setSpeedDialOpen(false)}
                direction="up"
              >
                {getFabActions().map((action) => (
                  <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.action}
                    sx={{
                      '& .MuiSpeedDialAction-staticTooltip': {
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        color: theme.palette.text.primary,
                        borderRadius: 2,
                        padding: '8px 12px',
                        marginRight: 2,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(10px)',
                      }
                    }}
                    tooltipOpen
                  />
                ))}
              </SpeedDial>
            </>
          )}

          {/* Scroll to Top FAB */}
          {showScrollTop && (
            <Fab
              size={isMobile ? "medium" : "large"}
              onClick={scrollToTop}
              sx={{
                position: 'fixed',
                bottom: { xs: isMobile ? 155 : 90, sm: 160 },
                right: { xs: 20, sm: 25 },
                zIndex: (theme) => theme.zIndex.speedDial - 1,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: theme.palette.primary.main,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          )}
        </Box>
      </Box>
      
      {/* Mobile overlay when sidebar is open */}
      {isMobile && !isCollapsed && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => {
            // This will be handled by the sidebar's toggle functionality
          }}
        />
      )}
    </Box>
  );
};

export default Layout; 