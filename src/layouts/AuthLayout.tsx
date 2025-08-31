/**
 * Authentication Layout
 * Layout wrapper for login, signup, and password reset pages
 */

import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Stack spacing={3} alignItems="center">
            {/* Logo/Branding */}
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              🏥
            </Box>

            {/* Title */}
            {title && (
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                component="h1"
                textAlign="center"
                color="text.primary"
                fontWeight="600"
              >
                {title}
              </Typography>
            )}

            {/* Subtitle */}
            {subtitle && (
              <Typography
                variant="body1"
                textAlign="center"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {subtitle}
              </Typography>
            )}

            {/* Auth Form Content */}
            <Box sx={{ width: '100%' }}>
              {children || <Outlet />}
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}