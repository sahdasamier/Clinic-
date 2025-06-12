import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { Download, Print, Share } from '@mui/icons-material';

interface InvoiceData {
  invoiceId: string;
  patient: string;
  patientAvatar: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  status: string;
  method: string;
  description: string;
  category: string;
  insurance: string;
  insuranceAmount: number;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
}

interface InvoiceGeneratorProps {
  invoiceData: InvoiceData;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  invoiceData,
  onDownload,
  onPrint,
  onShare,
}) => {
  const {
    invoiceId,
    patient,
    amount,
    currency,
    date,
    dueDate,
    status,
    method,
    description,
    category,
    insurance,
    insuranceAmount,
    clinicName = "Modern Clinic",
    clinicAddress = "123 Medical Street, Healthcare City",
    clinicPhone = "+20 123 456 7890",
    clinicEmail = "info@modernclinic.com"
  } = invoiceData;

  const subtotal = amount;
  const taxRate = 0.14; // 14% VAT
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  const insuranceCoverage = insuranceAmount || 0;
  const patientBalance = totalAmount - insuranceCoverage;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 4,
        backgroundColor: '#fafafa',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                color: '#1976d2',
                mb: 1,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {clinicName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {clinicAddress}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Phone: {clinicPhone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: {clinicEmail}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 3, md: 0 } }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#1976d2',
                mb: 2,
              }}
            >
              INVOICE
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#e3f2fd',
              borderRadius: 2,
              border: '2px solid #1976d2',
            }}>
              <Typography variant="body2" color="text.secondary">
                Invoice Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {invoiceId}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3, borderWidth: 2, borderColor: '#1976d2' }} />

      {/* Invoice Details */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
            Bill To:
          </Typography>
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {patient}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient ID: {patient.split(' ').map(n => n[0]).join('')}-001
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
            Invoice Details:
          </Typography>
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Issue Date:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {new Date(date).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Due Date:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {new Date(dueDate).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    color: status === 'paid' ? '#4caf50' : 
                           status === 'pending' ? '#ff9800' : '#f44336',
                    textTransform: 'uppercase',
                  }}
                >
                  {status}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Services Table */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
        Services & Procedures:
      </Typography>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          mb: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Category</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Payment Method</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {description}
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
                {category}
              </TableCell>
              <TableCell align="center">
                {method}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {currency} {amount.toLocaleString()}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Totals */}
      <Box sx={{ 
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        p: 3,
        border: '1px solid #e0e0e0',
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {insurance === 'Yes' && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#e8f5e8',
                borderRadius: 1,
                border: '1px solid #4caf50',
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  ✓ Insurance Coverage Applied
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This patient has active insurance coverage
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currency} {subtotal.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">VAT (14%):</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currency} {taxAmount.toFixed(2)}
                </Typography>
              </Grid>
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Total Amount:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {currency} {totalAmount.toFixed(2)}
                </Typography>
              </Grid>
              
              {insurance === 'Yes' && insuranceCoverage > 0 && (
                <>
                  <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="success.main">Insurance Coverage:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      -{currency} {insuranceCoverage.toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Patient Balance:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {currency} {patientBalance.toFixed(2)}
                    </Typography>
                  </Grid>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #e0e0e0' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Payment Terms & Notes:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Payment is due within 30 days of invoice date
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Late payments may incur additional charges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • For questions, please contact us at {clinicPhone}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={onDownload}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Download PDF
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={onPrint}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Print Invoice
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={onShare}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Share
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Watermark */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 4, 
        pt: 2, 
        borderTop: '1px solid #e0e0e0',
        opacity: 0.6,
      }}>
        <Typography variant="caption" color="text.secondary">
          Generated by {clinicName} Management System • {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default InvoiceGenerator; 