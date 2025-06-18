import React, { useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTranslation } from 'react-i18next';
import { createAppTheme } from '../theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
  
  const theme = useMemo(() => createAppTheme(direction), [direction]);

  // Set document direction and add RTL styles
  useEffect(() => {
    document.dir = direction;
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', i18n.language);
    
    // Add custom RTL styles
    const existingStyle = document.getElementById('rtl-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    if (direction === 'rtl') {
      const style = document.createElement('style');
      style.id = 'rtl-styles';
      style.textContent = `
        .MuiDrawer-paperAnchorLeft {
          right: 0 !important;
          left: auto !important;
        }
        .MuiDrawer-paperAnchorDockedLeft {
          border-right: none !important;
          border-left: 1px solid rgba(0, 0, 0, 0.12) !important;
        }
        .MuiTabs-scrollableX .MuiTabs-scrollButtons {
          order: -1;
        }
        .MuiTabs-scrollButtonsHideMobile .MuiTabs-scrollButtons {
          display: flex;
        }
        /* Notification specific RTL adjustments */
        .notification-actions {
          flex-direction: row-reverse;
        }
        .notification-content {
          text-align: right;
        }
        .notification-avatar {
          margin-left: 16px;
          margin-right: 0;
        }
      `;
      document.head.appendChild(style);
    }
  }, [direction, i18n.language]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}; 