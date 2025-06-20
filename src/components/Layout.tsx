import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: 'background.default',
      overflow: 'hidden'
    }}>
      <Sidebar />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        minWidth: 0, // Prevent flex item from growing beyond container
        width: isMobile ? '100%' : 'auto'
      }}>
        <Header />
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
          minHeight: 0 // Prevent flex item from growing beyond container
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 