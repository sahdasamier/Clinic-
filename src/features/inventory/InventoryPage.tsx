import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import {
  Inventory,
} from '@mui/icons-material';


const InventoryPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Inventory sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {t('inventory')}
              </Typography>
            </Box>
                      <Typography variant="body1" color="text.secondary">
            {t('manage_inventory')}
          </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Inventory sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                {t('coming_soon')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('feature_under_development')}
              </Typography>
            </CardContent>
          </Card>
        </Container>
  );
};

export default InventoryPage; 