import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Percent,
  MonetizationOn,
  Edit,
  Save,
  Cancel,
  Info,
} from '@mui/icons-material';

interface VATAdjustment {
  id: string;
  amount: number;
  reason: string;
  type: 'deduction' | 'addition';
  date: string;
  description: string;
}

interface VATAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  currentRevenue: number;
  currentVATCollected: number;
  onSave: (adjustments: VATAdjustment[]) => void;
}

const VATAdjustmentModal: React.FC<VATAdjustmentModalProps> = ({
  open,
  onClose,
  currentRevenue,
  currentVATCollected,
  onSave,
}) => {
  const { t } = useTranslation();
  
  // Load existing adjustments from localStorage
  const [adjustments, setAdjustments] = useState<VATAdjustment[]>(() => {
    try {
      const saved = localStorage.getItem('clinic_vat_adjustments');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading VAT adjustments:', error);
      return [];
    }
  });

  const [newAdjustment, setNewAdjustment] = useState({
    amount: 0,
    reason: '',
    type: 'deduction' as 'deduction' | 'addition',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const totalAdjustments = adjustments.reduce((sum, adj) => {
    return adj.type === 'addition' ? sum + adj.amount : sum - adj.amount;
  }, 0);

  const adjustedRevenue = currentRevenue + totalAdjustments;
  const finalVATCollected = currentVATCollected + totalAdjustments;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newAdjustment.amount || newAdjustment.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!newAdjustment.reason) {
      newErrors.reason = 'Reason is required';
    }

    // Description is now optional
    // if (!newAdjustment.description.trim()) {
    //   newErrors.description = 'Description is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAdjustment = () => {
    if (!validateForm()) return;

    const adjustment: VATAdjustment = {
      id: Date.now().toString(),
      amount: newAdjustment.amount,
      reason: newAdjustment.reason,
      type: newAdjustment.type,
      date: new Date().toISOString(),
      description: newAdjustment.description,
    };

    const updatedAdjustments = [...adjustments, adjustment];
    setAdjustments(updatedAdjustments);
    
    // Save to localStorage
    localStorage.setItem('clinic_vat_adjustments', JSON.stringify(updatedAdjustments));

    // Reset form
    setNewAdjustment({
      amount: 0,
      reason: '',
      type: 'deduction',
      description: '',
    });
    setErrors({});
  };

  const handleDeleteAdjustment = (id: string) => {
    const updatedAdjustments = adjustments.filter(adj => adj.id !== id);
    setAdjustments(updatedAdjustments);
    localStorage.setItem('clinic_vat_adjustments', JSON.stringify(updatedAdjustments));
  };

  const handleSave = () => {
    onSave(adjustments);
    onClose();
  };

  const reasonOptions = [
    { value: 'manual_vat_correction', label: 'Manual VAT Correction' },
    { value: 'tax_adjustment', label: 'Tax Adjustment' },
    { value: 'accounting_correction', label: 'Accounting Correction' },
    { value: 'external_vat_payment', label: 'External VAT Payment' },
    { value: 'vat_refund', label: 'VAT Refund' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '70vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Percent sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            VAT Collection Adjustments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manually adjust VAT deductions from total revenue
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Current Financial Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <MonetizationOn sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Current Revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  EGP {currentRevenue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Percent sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  Current VAT Adjustments
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  EGP {totalAdjustments.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manual adjustments only
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: totalAdjustments >= 0 ? 'success.light' : 'error.light', 
              border: '1px solid', 
              borderColor: totalAdjustments >= 0 ? 'success.main' : 'error.main' 
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Edit sx={{ 
                  fontSize: 32, 
                  color: totalAdjustments >= 0 ? 'success.main' : 'error.main', 
                  mb: 1 
                }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: totalAdjustments >= 0 ? 'success.main' : 'error.main' 
                }}>
                  Adjusted Revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  EGP {adjustedRevenue.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalAdjustments >= 0 ? '+' : ''}EGP {totalAdjustments.toLocaleString()} adjustment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            💡 <strong>Manual VAT Adjustments:</strong> Use this to manually add or deduct amounts from your total revenue. 
            These are separate from automatic invoice VAT and are useful for external payments, corrections, or manual adjustments.
            <br/><strong>Note:</strong> Employee expenses are automatically deducted from revenue.
          </Typography>
        </Alert>

        {/* Add New Adjustment Form */}
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Edit sx={{ color: 'primary.main' }} />
              Add New VAT Adjustment
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Adjustment Amount (EGP)"
                  type="number"
                  value={newAdjustment.amount || ''}
                  onChange={(e) => setNewAdjustment(prev => ({ 
                    ...prev, 
                    amount: parseFloat(e.target.value) || 0 
                  }))}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Adjustment Type</InputLabel>
                  <Select
                    value={newAdjustment.type}
                    label="Adjustment Type"
                    onChange={(e) => setNewAdjustment(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'deduction' | 'addition' 
                    }))}
                  >
                    <MenuItem value="deduction">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="−" color="error" size="small" />
                        Deduction (Reduce Revenue)
                      </Box>
                    </MenuItem>
                    <MenuItem value="addition">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="+" color="success" size="small" />
                        Addition (Increase Revenue)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.reason}>
                  <InputLabel>Reason</InputLabel>
                  <Select
                    value={newAdjustment.reason}
                    label="Reason"
                    onChange={(e) => setNewAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                  >
                    {reasonOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.reason && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.reason}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                                        value={newAdjustment.description}
                      onChange={(e) => setNewAdjustment(prev => ({ ...prev, description: e.target.value }))}
                      error={!!errors.description}
                      helperText="Optional: Detailed description of the adjustment"
                      placeholder="e.g., Manual VAT payment for Q4 2023 (Optional)"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleAddAdjustment}
                  startIcon={<Save />}
                  sx={{ borderRadius: 2 }}
                >
                  Add Adjustment
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Existing Adjustments List */}
        {adjustments.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info sx={{ color: 'primary.main' }} />
                Current VAT Adjustments ({adjustments.length})
              </Typography>

              {adjustments.map((adjustment, index) => (
                <Box key={adjustment.id} sx={{ mb: 2 }}>
                  <Card sx={{ 
                    bgcolor: adjustment.type === 'addition' ? 'success.light' : 'error.light',
                    border: '1px solid',
                    borderColor: adjustment.type === 'addition' ? 'success.main' : 'error.main'
                  }}>
                    <CardContent sx={{ py: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {adjustment.type === 'addition' ? '+' : '-'}EGP {adjustment.amount.toLocaleString()}
                          </Typography>
                          <Chip
                            label={adjustment.type === 'addition' ? 'Addition' : 'Deduction'}
                            color={adjustment.type === 'addition' ? 'success' : 'error'}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {reasonOptions.find(r => r.value === adjustment.reason)?.label || adjustment.reason}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {adjustment.description}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(adjustment.date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={1}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteAdjustment(adjustment.id)}
                          >
                            Delete
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  {index < adjustments.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}

              <Box sx={{ 
                p: 3, 
                bgcolor: 'primary.light', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.main',
                mt: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                  📊 VAT Adjustments Impact
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Net Adjustment Amount
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700,
                      color: totalAdjustments >= 0 ? 'success.main' : 'error.main'
                    }}>
                      {totalAdjustments >= 0 ? '+' : ''}EGP {Math.abs(totalAdjustments).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalAdjustments >= 0 ? 'Revenue Increase' : 'Revenue Decrease'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Adjusted Total Revenue
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      EGP {adjustedRevenue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Original: EGP {currentRevenue.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Net VAT Adjustment
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {totalAdjustments >= 0 ? '+' : ''}EGP {totalAdjustments.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Manual adjustments only
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} startIcon={<Cancel />}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          startIcon={<Save />}
          sx={{ borderRadius: 2 }}
        >
          Save & Apply Adjustments
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VATAdjustmentModal; 