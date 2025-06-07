import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
} from '@mui/material';
import {
  Dashboard,
  People,
  CalendarToday,
  Inventory,
  Payment,
  Notifications,
  Chat,
  Settings,
  LocalHospital,
} from '@mui/icons-material';

const drawerWidth = 280;

const navLinks = [
  { to: '/', text: 'dashboard', icon: <Dashboard /> },
  { to: '/patients', text: 'patients', icon: <People /> },
  { to: '/appointments', text: 'appointments', icon: <CalendarToday /> },
  { to: '/inventory', text: 'inventory', icon: <Inventory /> },
  { to: '/payments', text: 'payments', icon: <Payment /> },
  { to: '/notifications', text: 'notifications', icon: <Notifications /> },
  { to: '/chat', text: 'chat', icon: <Chat /> },
  { to: '/settings', text: 'settings', icon: <Settings /> },
];

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'primary.main',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Logo/Brand Section */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <LocalHospital sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
              ClinicCare
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Management System
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mx: 2 }} />

        {/* Profile Section */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                mr: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              DA
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'white', lineHeight: 1.2 }}>
                Dr. Ahmed
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('general_practitioner')}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', mx: 2, mb: 2 }} />

        {/* Navigation Links */}
        <Box sx={{ flex: 1, px: 2 }}>
          <List sx={{ py: 0 }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to={link.to}
                    sx={{
                      borderRadius: '12px',
                      py: 1.5,
                      px: 2,
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: 'white',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: 40,
                        '& svg': {
                          fontSize: 22,
                        },
                      }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={t(link.text)}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.95rem',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, pt: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            ClinicCare v1.0.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 