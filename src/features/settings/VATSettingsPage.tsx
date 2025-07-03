import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Settings, Home, Percent } from '@mui/icons-material';
import VATSettingsComponent from '../../components/VATSettings';

const VATSettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          aria-label="breadcrumb" 
          sx={{ mb: 2 }}
          separator={isRTL ? '‹' : '›'}
        >
          <Link
            underline="hover"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
            href="#"
          >
            <Home sx={{ mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} fontSize="inherit" />
            {t('navigation.home')}
          </Link>
          <Link
            underline="hover"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
            href="#"
          >
            <Settings sx={{ mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} fontSize="inherit" />
            {t('navigation.settings')}
          </Link>
          <Typography
            color="text.primary"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <Percent sx={{ mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} fontSize="inherit" />
            VAT Settings
          </Typography>
        </Breadcrumbs>

        {/* Page Title */}
        <Box sx={{ 
          p: 4,
          background: 'linear-gradient(90deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
          borderRadius: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: isRTL ? 0 : 3,
              ml: isRTL ? 3 : 0,
              backdropFilter: 'blur(10px)',
            }}>
              <Percent sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 800, 
                color: 'white',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                VAT & Tax Management
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 400
              }}>
                Configure VAT rates and tax calculation settings for your clinic
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <VATSettingsComponent />
        </Grid>
        
        {/* Information Panel */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings sx={{ color: 'primary.main' }} />
              Quick Help
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                🧮 How VAT Calculations Work
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                When VAT is enabled, you can choose to include or exclude VAT for each invoice. This affects how your profit is calculated.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                💰 Profit Impact
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • <strong>VAT Included:</strong> VAT amount is deducted from the payment when calculating profit
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                • <strong>VAT Not Included:</strong> VAT is deducted from your profit calculations
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                🌍 Common VAT Rates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Egypt: 14%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • UAE: 5%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Saudi Arabia: 15%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                • Jordan: 16%
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                ⚙️ Settings Tips
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Enable VAT to show VAT options in payment forms
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Set default rate to automatically populate new invoices
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Choose whether to include VAT by default for new payments
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default VATSettingsPage; 