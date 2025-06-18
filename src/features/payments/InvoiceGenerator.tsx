import React from 'react';
import { useTranslation } from 'react-i18next';
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
  Avatar,
  Chip,
} from '@mui/material';
import { Download, Print, Share, CheckCircle } from '@mui/icons-material';

interface InvoiceData {
  invoiceId: string;
  patient: string;
  patientAvatar: string;
  amount: number;
  currency: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  method: string;
  description: string;
  category: string;
  insurance: 'Yes' | 'No';
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

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
    clinicName = t('invoice.defaultClinic.name'),
    clinicAddress = t('invoice.defaultClinic.address'),
    clinicPhone = t('invoice.defaultClinic.phone'),
    clinicEmail = t('invoice.defaultClinic.email')
  } = invoiceData;

  // Financial calculations
  const subtotal = amount;
  const taxRate = 0.14; // 14% VAT
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  const insuranceCoverage = insuranceAmount || 0;
  const patientBalance = totalAmount - insuranceCoverage;

  const getStatusColor = (status: string) => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      overdue: 'error',
      partial: 'info'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      isRTL ? 'ar-EG' : 'en-US'
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(
      isRTL ? 'ar-EG' : 'en-US',
      { style: 'decimal', minimumFractionDigits: 2 }
    ).format(amount);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        maxWidth: 800, 
        mx: 'auto', 
        p: 4,
        backgroundColor: '#fafafa',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        direction: isRTL ? 'rtl' : 'ltr',
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
              {t('invoice.labels.phone')}: {clinicPhone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('invoice.labels.email')}: {clinicEmail}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ 
            textAlign: { xs: 'left', md: isRTL ? 'left' : 'right' }, 
            mt: { xs: 3, md: 0 } 
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#1976d2',
                mb: 2,
              }}
            >
              {t('invoice.title')}
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#e3f2fd',
              borderRadius: 2,
              border: '2px solid #1976d2',
            }}>
              <Typography variant="body2" color="text.secondary">
                {t('invoice.labels.invoiceNumber')}
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
            {t('invoice.sections.billTo')}:
          </Typography>
          <Box sx={{ 
            p: 3, 
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'primary.main',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                }}
              >
                {invoiceData.patientAvatar}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {patient}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('invoice.labels.patientId')}: {patient.split(' ').map(n => n[0]).join('')}-001
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
            {t('invoice.sections.invoiceDetails')}:
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
                  {t('invoice.labels.issueDate')}:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(date)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('invoice.labels.dueDate')}:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatDate(dueDate)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {t('invoice.labels.status')}:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Chip
                  label={t(`invoice.status.${status}`)}
                  color={getStatusColor(status) as any}
                  size="small"
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Services Table */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
        {t('invoice.sections.servicesAndProcedures')}:
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
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>
                {t('invoice.table.description')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                {t('invoice.table.category')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                {t('invoice.table.paymentMethod')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">
                {t('invoice.table.amount')}
              </TableCell>
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
                {t(`invoice.categories.${category}`)}
              </TableCell>
              <TableCell align="center">
                {t(`invoice.paymentMethods.${method.toLowerCase().replace(' ', '_')}`)}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {currency} {formatCurrency(amount)}
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
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <CheckCircle sx={{ color: '#2e7d32', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                    {t('invoice.insurance.coverageApplied')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('invoice.insurance.activeDescription')}
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: isRTL ? 'left' : 'right' }}>
              <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {t('invoice.calculations.subtotal')}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currency} {formatCurrency(subtotal)}
                </Typography>
              </Grid>
              
              <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {t('invoice.calculations.vat')} (14%):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currency} {formatCurrency(taxAmount)}
                </Typography>
              </Grid>
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {t('invoice.calculations.totalAmount')}:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {currency} {formatCurrency(totalAmount)}
                </Typography>
              </Grid>
              
              {insurance === 'Yes' && insuranceCoverage > 0 && (
                <>
                  <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="success.main">
                      {t('invoice.calculations.insuranceCoverage')}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      -{currency} {formatCurrency(insuranceCoverage)}
                    </Typography>
                  </Grid>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Grid container justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {t('invoice.calculations.patientBalance')}:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {currency} {formatCurrency(patientBalance)}
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
              {t('invoice.footer.paymentTermsTitle')}:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • {t('invoice.footer.paymentDue30Days')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • {t('invoice.footer.latePaymentCharges')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {t('invoice.footer.questionsContact')}: {clinicPhone}
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
                {t('invoice.actions.downloadPDF')}
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
                {t('invoice.actions.printInvoice')}
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
                {t('invoice.actions.share')}
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
          {t('invoice.footer.generatedBy')} {clinicName} {t('invoice.footer.managementSystem')} • {formatDate(new Date().toISOString())}
        </Typography>
      </Box>
    </Paper>
  );
};

export default InvoiceGenerator;