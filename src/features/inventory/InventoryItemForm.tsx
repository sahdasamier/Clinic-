import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Inventory,
  Store,
  Numbers,
  Save
} from '@mui/icons-material';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import { usePersistentForm } from '../../hooks/usePersistentForm';

interface InventoryItemFormData {
  itemName: string;
  quantity: number;
  supplier: string;
  description: string;
  category: string;
  price: number;
  expiryDate: string;
  location: string;
}

const InventoryItemForm: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Use persistent form hook for data persistence
  const defaultFormData: InventoryItemFormData = {
    itemName: '',
    quantity: 0,
    supplier: '',
    description: '',
    category: '',
    price: 0,
    expiryDate: '',
    location: ''
  };

  const { 
    formData, 
    updateField, 
    handleSave, 
    resetForm, 
    isDirty,
    lastSaved 
  } = usePersistentForm('inventoryItemForm', defaultFormData, { 
    autoSave: true, 
    autoSaveDelay: 2000 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Save inventory item clicked!');
    console.log('📋 Inventory data to save:', formData);
    
    // Basic validation
    if (!formData.itemName || !formData.supplier || formData.quantity <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save using persistent form hook
      const success = await handleSave();
      
      if (success) {
        setSuccess(true);
        console.log('✅ Inventory item saved successfully');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setError('Failed to save inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Card sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: 'white',
            borderRadius: 4
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Inventory sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    Add Inventory Item
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    📦 Enter inventory item details below
                  </Typography>
                  
                  {/* ✅ Data persistence status indicator */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDirty ? (
                      <Chip
                        label="⏳ Auto-saving..."
                        size="small"
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                      />
                    ) : lastSaved ? (
                      <Chip
                        label="✅ Saved"
                        size="small"
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                      />
                    ) : null}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Item Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Item Name *"
                      value={formData.itemName}
                      onChange={(e) => updateField('itemName', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Inventory sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Enter the name of the inventory item"
                    />
                  </Grid>

                  {/* Quantity */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Quantity *"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => updateField('quantity', Number(e.target.value))}
                      required
                      inputProps={{ min: 0 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Numbers sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Current stock quantity"
                    />
                  </Grid>

                  {/* Supplier */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Supplier *"
                      value={formData.supplier}
                      onChange={(e) => updateField('supplier', e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Store sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Name of the supplier"
                    />
                  </Grid>

                  {/* Price */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Unit Price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateField('price', Number(e.target.value))}
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText="Price per unit"
                    />
                  </Grid>

                  {/* Category */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Category"
                      value={formData.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      helperText="Item category (e.g., Medicine, Equipment)"
                    />
                  </Grid>

                  {/* Expiry Date */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => updateField('expiryDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      helperText="Expiration date (if applicable)"
                    />
                  </Grid>

                  {/* Location */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Storage Location"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      helperText="Where the item is stored"
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Enter detailed description of the inventory item"
                      helperText={`${formData.description.length}/500 characters`}
                    />
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12} sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={resetForm}
                        disabled={loading}
                        sx={{ borderRadius: 3, px: 4 }}
                      >
                        Reset
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !formData.itemName || !formData.supplier || formData.quantity <= 0}
                        startIcon={loading ? null : <Save />}
                        sx={{ 
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                          px: 4,
                          minWidth: 140
                        }}
                      >
                        {loading ? 'Saving...' : 'Save Item'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Inventory item saved successfully! 🎉
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryItemForm; 