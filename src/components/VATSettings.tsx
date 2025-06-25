import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Divider,
  Alert,
  Button,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Settings, Percent, AttachMoney } from '@mui/icons-material';
import { VATSettings, defaultVATSettings, vatRateOptions } from '../data/mockData';

interface VATSettingsProps {
  onSettingsChange?: (settings: VATSettings) => void;
}

const VATSettingsComponent: React.FC<VATSettingsProps> = ({ onSettingsChange }) => {
  const { t } = useTranslation();
  const [vatSettings, setVATSettings] = useState<VATSettings>(defaultVATSettings);
  const [customRate, setCustomRate] = useState<string>('');
  const [showCustomRate, setShowCustomRate] = useState(false);

  // Removed: localStorage loading - using default settings only
  // useEffect(() => {
  //   // localStorage operations removed
  // }, []);

  // Notify parent of settings changes (no localStorage persistence)
  useEffect(() => {
    onSettingsChange?.(vatSettings);
  }, [vatSettings, onSettingsChange]);

  const handleVATEnabledChange = (enabled: boolean) => {
    setVATSettings(prev => ({ ...prev, enabled }));
  };

  const handleVATRateChange = (rate: number) => {
    if (rate === 0) {
      setShowCustomRate(true);
    } else {
      setShowCustomRate(false);
      setVATSettings(prev => ({ ...prev, rate }));
    }
  };

  const handleCustomRateChange = (value: string) => {
    setCustomRate(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setVATSettings(prev => ({ ...prev, rate: numValue }));
    }
  };

  const handleDefaultIncludeVATChange = (defaultIncludeVAT: boolean) => {
    setVATSettings(prev => ({ ...prev, defaultIncludeVAT }));
  };

  const resetToDefaults = () => {
    setVATSettings(defaultVATSettings);
    setCustomRate('');
    setShowCustomRate(false);
  };

  const calculateVATExample = (baseAmount: number) => {
    if (!vatSettings.enabled) return { base: baseAmount, vat: 0, total: baseAmount };
    
    const vatAmount = (baseAmount * vatSettings.rate) / 100;
    const totalAmount = baseAmount + vatAmount;
    
    return {
      base: baseAmount,
      vat: vatAmount,
      total: totalAmount
    };
  };

  const exampleCalculation = calculateVATExample(1000);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Percent sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('vat_settings')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('configure_vat_tax_settings')}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Enable/Disable VAT */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={vatSettings.enabled}
                  onChange={(e) => handleVATEnabledChange(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {t('enable_vat_tax')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('enable_disable_vat_calculations')}
                  </Typography>
                </Box>
              }
            />
          </Grid>

          {vatSettings.enabled && (
            <>
              {/* VAT Rate Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('vat_rate')}</InputLabel>
                  <Select
                    value={showCustomRate ? 0 : vatSettings.rate}
                    label={t('vat_rate')}
                    onChange={(e) => handleVATRateChange(Number(e.target.value))}
                  >
                    {vatRateOptions.map((option) => (
                      <MenuItem key={option.value + option.label} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Custom Rate Input */}
              {showCustomRate && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('custom_vat_rate')}
                    value={customRate}
                    onChange={(e) => handleCustomRateChange(e.target.value)}
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    InputProps={{
                      endAdornment: <Typography sx={{ color: 'text.secondary' }}>%</Typography>
                    }}
                    helperText={t('enter_vat_rate_percentage')}
                  />
                </Grid>
              )}

              {/* Default Include VAT */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={vatSettings.defaultIncludeVAT}
                      onChange={(e) => handleDefaultIncludeVATChange(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {t('include_vat_by_default')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('automatically_include_vat_new_payments')}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Example Calculation */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('calculation_example')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2">
                      💰 {t('base_amount')}: <strong>EGP {exampleCalculation.base.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="body2">
                      📊 {t('vat_amount')} ({vatSettings.rate}%): <strong>EGP {exampleCalculation.vat.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      💳 {t('total_with_vat')}: <strong>EGP {exampleCalculation.total.toFixed(2)}</strong>
                    </Typography>
                  </Box>
                </Alert>
              </Grid>

              {/* Profit Impact Information */}
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('profit_calculation_impact')}
                  </Typography>
                  <Typography variant="body2">
                    • {t('if_vat_included')}: {t('vat_deducted_from_payment')}
                  </Typography>
                  <Typography variant="body2">
                    • {t('if_vat_not_included')}: {t('vat_deducted_from_profit')}
                  </Typography>
                </Alert>
              </Grid>
            </>
          )}

          {/* Reset Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={resetToDefaults}
                startIcon={<Settings />}
              >
                {t('reset_to_defaults')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default VATSettingsComponent; 