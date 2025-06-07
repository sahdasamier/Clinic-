import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Payment,
  MonetizationOn,
  Receipt,
  CreditCard,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Cancel,
  Edit,
  Visibility,
  Download,
  Print,
  Send,
  AttachMoney,
  AccessTime,
  Euro,
  People,
  CalendarToday,
  DateRange,
} from '@mui/icons-material';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Generate recent dates relative to today for proper filtering
const generateRecentDates = () => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formatDueDate = (date: Date) => new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    today: formatDate(today),
    yesterday: formatDate(yesterday),
    twoDaysAgo: formatDate(twoDaysAgo),
    threeDaysAgo: formatDate(threeDaysAgo),
    fiveDaysAgo: formatDate(fiveDaysAgo),
    oneWeekAgo: formatDate(oneWeekAgo),
    twoWeeksAgo: formatDate(twoWeeksAgo),
    oneMonthAgo: formatDate(oneMonthAgo),
    todayDue: formatDueDate(today),
    yesterdayDue: formatDueDate(yesterday),
    twoDaysAgoDue: formatDueDate(twoDaysAgo),
    threeDaysAgoDue: formatDueDate(threeDaysAgo),
    fiveDaysAgoDue: formatDueDate(fiveDaysAgo),
    oneWeekAgoDue: formatDueDate(oneWeekAgo),
    twoWeeksAgoDue: formatDueDate(twoWeeksAgo),
    oneMonthAgoDue: formatDueDate(oneMonthAgo),
  };
};

// Default sample data to show when no saved data exists
const defaultPayments = (() => {
  const dates = generateRecentDates();
  return [
    {
      id: 1,
      invoiceId: 'INV-2024-001',
      patient: 'Ahmed Al-Rashid',
      patientAvatar: 'AR',
      amount: 450.00,
      currency: 'EGP',
      date: dates.today,
      dueDate: dates.todayDue,
      status: 'paid',
      method: 'Credit Card',
      description: 'Consultation + Blood Test',
      category: 'consultation',
      insurance: 'Yes',
      insuranceAmount: 150.00,
    },
    {
      id: 2,
      invoiceId: 'INV-2024-002',
      patient: 'Fatima Hassan',
      patientAvatar: 'FH',
      amount: 320.00,
      currency: 'EGP',
      date: dates.yesterday,
      dueDate: dates.yesterdayDue,
      status: 'pending',
      method: 'Cash',
      description: 'Routine Check-up',
      category: 'checkup',
      insurance: 'No',
      insuranceAmount: 0,
    },
    {
      id: 3,
      invoiceId: 'INV-2024-003',
      patient: 'Mohammed Ali',
      patientAvatar: 'MA',
      amount: 280.00,
      currency: 'EGP',
      date: dates.twoDaysAgo,
      dueDate: dates.twoDaysAgoDue,
      status: 'overdue',
      method: 'Bank Transfer',
      description: 'Follow-up + Prescription',
      category: 'followup',
      insurance: 'Yes',
      insuranceAmount: 100.00,
    },
    {
      id: 4,
      invoiceId: 'INV-2024-004',
      patient: 'Sara Ahmed',
      patientAvatar: 'SA',
      amount: 650.00,
      currency: 'EGP',
      date: dates.threeDaysAgo,
      dueDate: dates.threeDaysAgoDue,
      status: 'paid',
      method: 'Insurance',
      description: 'Surgery Consultation + X-Ray',
      category: 'surgery',
      insurance: 'Yes',
      insuranceAmount: 400.00,
    },
    {
      id: 5,
      invoiceId: 'INV-2024-005',
      patient: 'Omar Khalil',
      patientAvatar: 'OK',
      amount: 180.00,
      currency: 'EGP',
      date: dates.fiveDaysAgo,
      dueDate: dates.fiveDaysAgoDue,
      status: 'partial',
      method: 'Credit Card',
      description: 'Emergency Visit',
      category: 'emergency',
      insurance: 'No',
      insuranceAmount: 0,
      paidAmount: 100.00,
    },
    {
      id: 6,
      invoiceId: 'INV-2024-006',
      patient: 'Layla Al-Zahra',
      patientAvatar: 'LZ',
      amount: 275.00,
      currency: 'EGP',
      date: dates.oneWeekAgo,
      dueDate: dates.oneWeekAgoDue,
      status: 'paid',
      method: 'Credit Card',
      description: 'Pediatric Consultation',
      category: 'consultation',
      insurance: 'Yes',
      insuranceAmount: 125.00,
    },
    {
      id: 7,
      invoiceId: 'INV-2024-007',
      patient: 'Hassan Mahmoud',
      patientAvatar: 'HM',
      amount: 520.00,
      currency: 'EGP',
      date: dates.twoWeeksAgo,
      dueDate: dates.twoWeeksAgoDue,
      status: 'pending',
      method: 'Bank Transfer',
      description: 'Cardiology Check-up + ECG',
      category: 'checkup',
      insurance: 'Yes',
      insuranceAmount: 300.00,
    },
    {
      id: 8,
      invoiceId: 'INV-2024-008',
      patient: 'Nadia Abdullah',
      patientAvatar: 'NA',
      amount: 195.00,
      currency: 'EGP',
      date: dates.oneMonthAgo,
      dueDate: dates.oneMonthAgoDue,
      status: 'paid',
      method: 'Cash',
      description: 'Dermatology Consultation',
      category: 'consultation',
      insurance: 'No',
      insuranceAmount: 0,
    }
  ];
})();

// Data persistence utilities
const STORAGE_KEY = 'clinic_payments_data';

const loadPaymentsFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedData = JSON.parse(stored);
      // Validate data structure
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.warn('Error loading payments from localStorage:', error);
  }
  
  // Return default data if no valid stored data exists
  return defaultPayments;
};

const savePaymentsToStorage = (payments: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  } catch (error) {
    console.warn('Error saving payments to localStorage:', error);
  }
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}> = ({ title, value, icon, color, subtitle, trend, trendDirection }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trendDirection === 'up' ? (
              <TrendingUp sx={{ fontSize: 16, color: '#10B981', mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: '#EF4444', mr: 0.5 }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trendDirection === 'up' ? '#10B981' : '#EF4444',
                fontWeight: 600,
              }}
            >
              {trend}
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const PaymentListPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [transactionPeriod, setTransactionPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [transactionDetailOpen, setTransactionDetailOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    patient: '',
    amount: '',
    category: '',
    invoiceDate: new Date().toISOString().split('T')[0], // Default to today, but user can change
    dueDate: '',
    description: '',
    method: '',
    insuranceAmount: '',
  });

  // Load data from localStorage on component mount
  React.useEffect(() => {
    const loadedPayments = loadPaymentsFromStorage();
    setPayments(loadedPayments);
    setIsDataLoaded(true);
  }, []);

  // Save data to localStorage whenever payments change
  React.useEffect(() => {
    if (isDataLoaded && payments.length > 0) {
      savePaymentsToStorage(payments);
    }
  }, [payments, isDataLoaded]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'partial':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle fontSize="small" />;
      case 'pending':
        return <AccessTime fontSize="small" />;
      case 'overdue':
        return <Warning fontSize="small" />;
      case 'partial':
        return <AttachMoney fontSize="small" />;
      default:
        return <Receipt fontSize="small" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
        return <CreditCard fontSize="small" />;
      case 'cash':
        return <MonetizationOn fontSize="small" />;
      case 'bank transfer':
        return <AccountBalance fontSize="small" />;
      case 'insurance':
        return <Receipt fontSize="small" />;
      default:
        return <Payment fontSize="small" />;
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  // Enhanced transaction utilities
  const getFilteredTransactions = () => {
    let filtered = payments;
    
    // Filter by status
    if (transactionFilter !== 'all') {
      filtered = filtered.filter(p => p.status === transactionFilter);
    }
    
    // Filter by period
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    filtered = filtered.filter(p => {
      const paymentDate = new Date(p.date);
      switch (transactionPeriod) {
        case 'today':
          return paymentDate >= today;
        case 'week':
          return paymentDate >= weekAgo;
        case 'month':
          return paymentDate >= monthAgo;
        default:
          return true;
      }
    });
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getTransactionsByDate = () => {
    const transactions = getFilteredTransactions();
    const grouped: { [key: string]: any[] } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      let dateKey;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });
    
    return grouped;
  };

  const getTransactionTrend = () => {
    const thisWeek = payments.filter(p => {
      const date = new Date(p.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo && p.status === 'paid';
    }).reduce((sum, p) => sum + p.amount, 0);
    
    const lastWeek = payments.filter(p => {
      const date = new Date(p.date);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return date >= twoWeeksAgo && date < weekAgo && p.status === 'paid';
    }).reduce((sum, p) => sum + p.amount, 0);
    
    const percentChange = lastWeek === 0 ? 100 : ((thisWeek - lastWeek) / lastWeek) * 100;
    return {
      amount: thisWeek,
      percentChange: Math.round(percentChange * 10) / 10,
      isPositive: percentChange >= 0
    };
  };

  // Handle creating new payment/invoice
  const handleCreatePayment = () => {
    // Validate required fields using state
    if (!newInvoiceData.patient || !newInvoiceData.amount || !newInvoiceData.category || 
        !newInvoiceData.invoiceDate || !newInvoiceData.dueDate || !newInvoiceData.description || !newInvoiceData.method) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(newInvoiceData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Amount must be a valid number greater than 0');
      return;
    }

    // Validate that invoice date is not in the future
    const invoiceDate = new Date(newInvoiceData.invoiceDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (invoiceDate > today) {
      alert('Invoice date cannot be in the future');
      return;
    }

    // Validate that due date is after invoice date
    const dueDate = new Date(newInvoiceData.dueDate);
    if (dueDate <= invoiceDate) {
      alert('Due date must be after the invoice date');
      return;
    }

    const insuranceAmount = parseFloat(newInvoiceData.insuranceAmount) || 0;

    const newPayment = {
      id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
      invoiceId: `INV-2024-${String(payments.length + 1).padStart(3, '0')}`,
      patientAvatar: newInvoiceData.patient.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      date: newInvoiceData.invoiceDate, // Use the selected invoice date
      status: 'pending',
      currency: 'EGP',
      patient: newInvoiceData.patient,
      amount: amount,
      category: newInvoiceData.category,
      dueDate: newInvoiceData.dueDate,
      description: newInvoiceData.description,
      method: newInvoiceData.method,
      insurance: insuranceAmount > 0 ? 'Yes' : 'No',
      insuranceAmount: insuranceAmount,
    };

    setPayments(prev => [newPayment, ...prev]);
    setAddPaymentOpen(false);
    
    // Reset form data
    setNewInvoiceData({
      patient: '',
      amount: '',
      category: '',
      invoiceDate: new Date().toISOString().split('T')[0], // Reset to today
      dueDate: '',
      description: '',
      method: '',
      insuranceAmount: '',
    });

    // Show success message
    alert(`Invoice ${newPayment.invoiceId} created successfully for ${newPayment.patient}!`);
  };

  // Handle updating payment status
  const handleUpdatePaymentStatus = (paymentId: number, newStatus: string) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId ? { ...payment, status: newStatus } : payment
      )
    );
  };

  // Handle editing payment
  const handleEditPayment = (paymentId: number, updatedData: any) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId ? { ...payment, ...updatedData } : payment
      )
    );
  };

  // Handle deleting payment
  const handleDeletePayment = (paymentId: number) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));
    }
  };

  // Reset to sample data (for demonstration)
  const handleResetToSampleData = () => {
    if (window.confirm('This will replace all current data with sample data. Are you sure?')) {
      setPayments(defaultPayments);
    }
  };

  // Handle opening the add payment dialog
  const handleOpenAddPayment = () => {
    setNewInvoiceData({
      patient: '',
      amount: '',
      category: '',
      invoiceDate: new Date().toISOString().split('T')[0], // Default to today
      dueDate: '',
      description: '',
      method: '',
      insuranceAmount: '',
    });
    setAddPaymentOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MonetizationOn sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {t('payments')} & Billing
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage payments, invoices, and financial transactions
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddPayment}
                sx={{ borderRadius: 3 }}
              >
                Create Invoice
              </Button>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Revenue"
                value={`EGP ${totalRevenue.toLocaleString()}`}
                icon={<TrendingUp />}
                color="#10B981"
                subtitle="This month"
                trend="+12.5%"
                trendDirection="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Payments"
                value={`EGP ${pendingAmount.toLocaleString()}`}
                icon={<AccessTime />}
                color="#F59E0B"
                subtitle={`${payments.filter(p => p.status === 'pending').length} invoices`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Overdue Amount"
                value={`EGP ${overdueAmount.toLocaleString()}`}
                icon={<Warning />}
                color="#EF4444"
                subtitle={`${payments.filter(p => p.status === 'overdue').length} overdue`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="This Month"
                value={payments.length}
                icon={<Receipt />}
                color="#3B82F6"
                subtitle="Total invoices"
                trend="+8.2%"
                trendDirection="up"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {/* Main Payments View */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent sx={{ p: 0 }}>
                  {/* Search and Filters */}
                  <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          placeholder="Search payments by patient, invoice ID, or description..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={(e) => setFilterAnchor(e.currentTarget)}
                          >
                            Filter
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Download />}
                          >
                            Export
                          </Button>
                          <Button
                            variant={viewMode === 'table' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('table')}
                          >
                            Table
                          </Button>
                          <Button
                            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('cards')}
                          >
                            Cards
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                      <Tab label={`All (${payments.length})`} />
                      <Tab label={`Paid (${payments.filter(p => p.status === 'paid').length})`} />
                      <Tab label={`Pending (${payments.filter(p => p.status === 'pending').length})`} />
                      <Tab label={`Overdue (${payments.filter(p => p.status === 'overdue').length})`} />
                    </Tabs>
                  </Box>

                  {/* Payments Table */}
                  {viewMode === 'table' && (
                    <TabPanel value={tabValue} index={0}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredPayments.map((payment) => (
                              <TableRow key={payment.id} hover>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {payment.invoiceId}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {payment.description}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        mr: 1.5,
                                        backgroundColor: 'primary.main',
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      {payment.patientAvatar}
                                    </Avatar>
                                    <Typography variant="body2">{payment.patient}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {payment.currency} {payment.amount.toLocaleString()}
                                    </Typography>
                                    {payment.insurance === 'Yes' && (
                                      <Typography variant="caption" color="info.main">
                                        Insurance: {payment.currency} {payment.insuranceAmount}
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {getMethodIcon(payment.method)}
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      {payment.method}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2">{payment.date}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Due: {payment.dueDate}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={getStatusIcon(payment.status)}
                                    label={payment.status}
                                    color={getStatusColor(payment.status) as any}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="View Invoice">
                                      <IconButton size="small" color="primary">
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download PDF">
                                      <IconButton size="small" color="primary">
                                        <Download fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Send Reminder">
                                      <IconButton size="small" color="primary">
                                        <Send fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                      <IconButton size="small" color="primary">
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TabPanel>
                  )}

                  {/* Payment Cards View */}
                  {viewMode === 'cards' && (
                    <TabPanel value={tabValue} index={0}>
                      <Grid container spacing={3} sx={{ p: 3 }}>
                        {filteredPayments.map((payment) => (
                          <Grid item xs={12} sm={6} md={6} key={payment.id}>
                            <Card sx={{ 
                              height: '100%', 
                              '&:hover': { boxShadow: 4 },
                              border: payment.status === 'overdue' ? '2px solid #EF4444' : 
                                      payment.status === 'pending' ? '2px solid #F59E0B' : 'none',
                            }}>
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {payment.invoiceId}
                                  </Typography>
                                  <Chip
                                    icon={getStatusIcon(payment.status)}
                                    label={payment.status}
                                    color={getStatusColor(payment.status) as any}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      mr: 2,
                                      backgroundColor: 'primary.main',
                                    }}
                                  >
                                    {payment.patientAvatar}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" fontWeight={600}>
                                      {payment.patient}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {payment.description}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Amount
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600} color="primary.main">
                                      {payment.currency} {payment.amount.toLocaleString()}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Due Date
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                      {payment.dueDate}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Method
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      {getMethodIcon(payment.method)}
                                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                                        {payment.method}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                      Insurance
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                      {payment.insurance === 'Yes' ? `${payment.currency} ${payment.insuranceAmount}` : 'None'}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                  <Button size="small" startIcon={<Visibility />}>
                                    View
                                  </Button>
                                  <Button size="small" startIcon={<Download />}>
                                    Download
                                  </Button>
                                  <Button size="small" startIcon={<Send />}>
                                    Send
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </TabPanel>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Sidebar - Payment Info */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Enhanced Recent Transactions */}
                <Card>
                  <CardContent sx={{ p: 0 }}>
                    {/* Header with Statistics */}
                    <Box sx={{ p: 3, pb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Recent Transactions
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={`${payments.length} Total`} 
                            size="small" 
                            color="default"
                            variant="outlined"
                          />
                          <Chip 
                            label={`${getFilteredTransactions().length} Filtered`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      
                      {/* Data Status Indicator */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        p: 1.5, 
                        backgroundColor: isDataLoaded ? 'success.light' : 'warning.light',
                        borderRadius: 1,
                        mb: 2
                      }}>
                        <CheckCircle sx={{ fontSize: 16, color: isDataLoaded ? 'success.main' : 'warning.main' }} />
                        <Typography variant="caption" color={isDataLoaded ? 'success.dark' : 'warning.dark'}>
                          {isDataLoaded ? '✓ Data loaded from storage' : '⏳ Loading data...'}
                        </Typography>
                      </Box>
                      
                      {/* Quick Stats */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2, 
                        p: 2, 
                        backgroundColor: 'primary.main', 
                        color: 'white',
                        borderRadius: 2,
                        mb: 2
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            This Week
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            EGP {getTransactionTrend().amount.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getTransactionTrend().isPositive ? (
                            <TrendingUp fontSize="small" />
                          ) : (
                            <TrendingDown fontSize="small" />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {getTransactionTrend().percentChange}%
                          </Typography>
                        </Box>
                      </Box>

                      {/* Filter Controls */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                        {/* Current Filter Display */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          p: 1.5, 
                          backgroundColor: 'info.light', 
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'info.main'
                        }}>
                          <FilterList sx={{ fontSize: 16, color: 'info.main' }} />
                          <Typography variant="caption" color="info.dark" sx={{ fontWeight: 600 }}>
                            Showing: {transactionFilter === 'all' ? 'All Status' : transactionFilter.charAt(0).toUpperCase() + transactionFilter.slice(1)} • 
                            {transactionPeriod === 'today' ? 'Today' : 
                             transactionPeriod === 'week' ? 'This Week' : 'This Month'} 
                            ({getFilteredTransactions().length} transactions)
                          </Typography>
                        </Box>
                        
                        {/* Filter Dropdowns */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Status Filter</InputLabel>
                            <Select
                              value={transactionFilter}
                              onChange={(e) => setTransactionFilter(e.target.value as any)}
                              label="Status Filter"
                            >
                              <MenuItem value="all">All Status</MenuItem>
                              <MenuItem value="paid">Paid Only</MenuItem>
                              <MenuItem value="pending">Pending Only</MenuItem>
                              <MenuItem value="overdue">Overdue Only</MenuItem>
                            </Select>
                          </FormControl>
                          
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Time Period</InputLabel>
                            <Select
                              value={transactionPeriod}
                              onChange={(e) => setTransactionPeriod(e.target.value as any)}
                              label="Time Period"
                            >
                              <MenuItem value="today">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AccessTime fontSize="small" />
                                  Today
                                </Box>
                              </MenuItem>
                              <MenuItem value="week">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <DateRange fontSize="small" />
                                  This Week
                                </Box>
                              </MenuItem>
                              <MenuItem value="month">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CalendarToday fontSize="small" />
                                  This Month
                                </Box>
                              </MenuItem>
                            </Select>
                          </FormControl>
                          
                          {/* Reset Filters Button */}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setTransactionFilter('all');
                              setTransactionPeriod('week');
                            }}
                            sx={{ minWidth: 'auto', px: 2 }}
                          >
                            Reset
                          </Button>
                        </Box>
                      </Box>
                    </Box>

                    {/* Transactions List */}
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {!isDataLoaded ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Loading transactions...
                          </Typography>
                        </Box>
                      ) : Object.keys(getTransactionsByDate()).length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            No transactions found for the selected period
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleOpenAddPayment}
                            startIcon={<Add />}
                          >
                            Create First Invoice
                          </Button>
                        </Box>
                      ) : (
                        Object.entries(getTransactionsByDate()).map(([dateGroup, transactions]) => (
                          <Box key={dateGroup}>
                            <Box sx={{ 
                              px: 3, 
                              py: 1.5, 
                              backgroundColor: 'grey.50', 
                              borderBottom: 1, 
                              borderColor: 'divider' 
                            }}>
                              <Typography variant="caption" fontWeight={600} color="text.secondary">
                                {dateGroup}
                              </Typography>
                            </Box>
                            <List sx={{ p: 0 }}>
                              {transactions.map((payment, index) => (
                                <ListItem 
                                  key={payment.id} 
                                  sx={{ 
                                    px: 3, 
                                    py: 2,
                                    '&:hover': { backgroundColor: 'action.hover' },
                                    cursor: 'pointer',
                                    borderBottom: index < transactions.length - 1 ? 1 : 0,
                                    borderColor: 'divider'
                                  }}
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setTransactionDetailOpen(true);
                                  }}
                                >
                                  <ListItemAvatar>
                                    <Avatar
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: payment.status === 'paid' ? 'success.main' : 
                                                       payment.status === 'pending' ? 'warning.main' : 
                                                       payment.status === 'overdue' ? 'error.main' : 'info.main',
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      {payment.patientAvatar}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                          {payment.patient}
                                        </Typography>
                                        <Chip
                                          label={payment.status}
                                          size="small"
                                          color={getStatusColor(payment.status) as any}
                                          variant="outlined"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                      </Box>
                                    }
                                    secondary={
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          {payment.invoiceId} • {payment.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                          {getMethodIcon(payment.method)}
                                          <Typography variant="caption" color="text.secondary">
                                            {payment.method}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    }
                                  />
                                  <ListItemSecondaryAction>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography 
                                        variant="body2" 
                                        fontWeight={700}
                                        color={payment.status === 'paid' ? 'success.main' : 
                                               payment.status === 'pending' ? 'warning.main' : 
                                               payment.status === 'overdue' ? 'error.main' : 'text.primary'}
                                      >
                                        {payment.status === 'paid' ? '+' : ''}
                                        {payment.currency} {payment.amount.toLocaleString()}
                                      </Typography>
                                      {payment.status === 'partial' && payment.paidAmount && (
                                        <Typography variant="caption" color="info.main">
                                          Paid: {payment.currency} {payment.paidAmount}
                                        </Typography>
                                      )}
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {new Date(payment.date).toLocaleDateString()}
                                      </Typography>
                                      
                                      {/* Quick Status Actions */}
                                      {payment.status !== 'paid' && (
                                        <Box sx={{ mt: 0.5 }}>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            color="success"
                                            sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1, py: 0.25 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUpdatePaymentStatus(payment.id, 'paid');
                                            }}
                                          >
                                            Mark Paid
                                          </Button>
                                        </Box>
                                      )}
                                    </Box>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        ))
                      )}
                    </Box>

                    {/* Footer Actions */}
                    <Box sx={{ p: 2, backgroundColor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            startIcon={<Add />}
                            onClick={handleOpenAddPayment}
                          >
                            New
                          </Button>
                        </Grid>
                        <Grid item xs={4}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth
                            startIcon={<Download />}
                          >
                            Export
                          </Button>
                        </Grid>
                        <Grid item xs={4}>
                          <Button 
                            variant="contained" 
                            size="small" 
                            fullWidth
                            startIcon={<Visibility />}
                            onClick={() => setTabValue(0)}
                          >
                            View All
                          </Button>
                        </Grid>
                      </Grid>
                      
                      {/* Demo Reset Button */}
                      <Box sx={{ mt: 1 }}>
                        <Button 
                          variant="text" 
                          size="small" 
                          fullWidth
                          color="secondary"
                          onClick={handleResetToSampleData}
                          sx={{ fontSize: '0.7rem' }}
                        >
                          Reset to Sample Data
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Add />}
                        onClick={handleOpenAddPayment}
                      >
                        Create Invoice
                      </Button>
                      <Button variant="outlined" fullWidth startIcon={<Send />}>
                        Send Reminders
                      </Button>
                      <Button variant="outlined" fullWidth startIcon={<Download />}>
                        Export Reports
                      </Button>
                      <Button variant="outlined" fullWidth startIcon={<Receipt />}>
                        Payment History
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Payment Methods
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">Credit Card</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          45%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MonetizationOn sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="body2">Cash</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          30%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Receipt sx={{ mr: 1, color: 'info.main' }} />
                          <Typography variant="body2">Insurance</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          20%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccountBalance sx={{ mr: 1, color: 'warning.main' }} />
                          <Typography variant="body2">Bank Transfer</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          5%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
          >
            <MenuItem>All Payments</MenuItem>
            <MenuItem>This Month</MenuItem>
            <MenuItem>Last Month</MenuItem>
            <MenuItem>Paid Only</MenuItem>
            <MenuItem>Pending Only</MenuItem>
            <MenuItem>Overdue Only</MenuItem>
            <MenuItem>With Insurance</MenuItem>
          </Menu>

          {/* Add Payment Dialog */}
          <Dialog
            open={addPaymentOpen}
            onClose={() => setAddPaymentOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogContent>
              <form id="invoice-form">
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="patient"
                      label="Patient Name"
                      required
                      value={newInvoiceData.patient}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, patient: e.target.value }))}
                      placeholder="e.g., Ahmed Al-Rashid"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="invoiceDate"
                      label="Invoice Date"
                      type="date"
                      required
                      value={newInvoiceData.invoiceDate}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ 
                        max: new Date().toISOString().split('T')[0] // Cannot be in the future
                      }}
                      helperText="Date when the service was provided"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="amount"
                      label="Amount"
                      type="number"
                      required
                      value={newInvoiceData.amount}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, amount: e.target.value }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Service Category</InputLabel>
                      <Select 
                        name="category" 
                        label="Service Category"
                        value={newInvoiceData.category}
                        onChange={(e) => setNewInvoiceData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <MenuItem value="consultation">Consultation</MenuItem>
                        <MenuItem value="checkup">Check-up</MenuItem>
                        <MenuItem value="surgery">Surgery</MenuItem>
                        <MenuItem value="emergency">Emergency</MenuItem>
                        <MenuItem value="followup">Follow-up</MenuItem>
                        <MenuItem value="procedure">Medical Procedure</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="dueDate"
                      label="Due Date"
                      type="date"
                      required
                      value={newInvoiceData.dueDate}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="description"
                      label="Description"
                      multiline
                      rows={3}
                      required
                      value={newInvoiceData.description}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description of services provided..."
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Payment Method</InputLabel>
                      <Select 
                        name="method" 
                        label="Payment Method"
                        value={newInvoiceData.method}
                        onChange={(e) => setNewInvoiceData(prev => ({ ...prev, method: e.target.value }))}
                      >
                        <MenuItem value="Cash">Cash</MenuItem>
                        <MenuItem value="Credit Card">Credit Card</MenuItem>
                        <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                        <MenuItem value="Insurance">Insurance</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="insuranceAmount"
                      label="Insurance Coverage"
                      type="number"
                      value={newInvoiceData.insuranceAmount}
                      onChange={(e) => setNewInvoiceData(prev => ({ ...prev, insuranceAmount: e.target.value }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                      placeholder="0"
                      helperText="Leave blank if no insurance coverage"
                    />
                  </Grid>
                </Grid>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddPaymentOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleCreatePayment}
              >
                Create Invoice
              </Button>
            </DialogActions>
          </Dialog>

          {/* Transaction Detail Dialog */}
          <Dialog
            open={transactionDetailOpen}
            onClose={() => setTransactionDetailOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    backgroundColor: selectedPayment?.status === 'paid' ? 'success.main' : 
                                   selectedPayment?.status === 'pending' ? 'warning.main' : 
                                   selectedPayment?.status === 'overdue' ? 'error.main' : 'info.main'
                  }}
                >
                  {selectedPayment?.patientAvatar}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedPayment?.patient}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedPayment?.invoiceId} • {selectedPayment?.date}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    icon={getStatusIcon(selectedPayment?.status || '')}
                    label={selectedPayment?.status}
                    color={getStatusColor(selectedPayment?.status || '') as any}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Amount Details */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Total Amount
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {selectedPayment?.currency} {selectedPayment?.amount.toLocaleString()}
                      </Typography>
                      {selectedPayment?.insurance === 'Yes' && (
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Insurance Coverage: {selectedPayment?.currency} {selectedPayment?.insuranceAmount}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Payment Method */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ backgroundColor: 'grey.50' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        {getMethodIcon(selectedPayment?.method || '')}
                        <Typography variant="h6" fontWeight={600}>
                          {selectedPayment?.method}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Transaction Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Transaction Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Service Description
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedPayment?.description}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Service Category
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                          {selectedPayment?.category}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedPayment?.dueDate}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Insurance
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedPayment?.insurance === 'Yes' ? 'Covered' : 'Not Covered'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Payment Status Timeline */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Payment Status
                  </Typography>
                  <Box sx={{ 
                    p: 3, 
                    backgroundColor: selectedPayment?.status === 'paid' ? 'success.light' :
                                   selectedPayment?.status === 'pending' ? 'warning.light' :
                                   selectedPayment?.status === 'overdue' ? 'error.light' : 'info.light',
                    borderRadius: 2,
                    color: selectedPayment?.status === 'paid' ? 'success.dark' :
                           selectedPayment?.status === 'pending' ? 'warning.dark' :
                           selectedPayment?.status === 'overdue' ? 'error.dark' : 'info.dark'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getStatusIcon(selectedPayment?.status || '')}
                      <Typography variant="h6" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {selectedPayment?.status === 'paid' ? 'Payment Completed' :
                         selectedPayment?.status === 'pending' ? 'Payment Pending' :
                         selectedPayment?.status === 'overdue' ? 'Payment Overdue' :
                         selectedPayment?.status === 'partial' ? 'Partial Payment Received' : 'Unknown Status'}
                      </Typography>
                    </Box>
                    {selectedPayment?.status === 'partial' && selectedPayment?.paidAmount && (
                      <Typography variant="body2">
                        Paid Amount: {selectedPayment?.currency} {selectedPayment?.paidAmount} of {selectedPayment?.currency} {selectedPayment?.amount}
                      </Typography>
                    )}
                    {selectedPayment?.status === 'overdue' && (
                      <Typography variant="body2">
                        This payment is overdue. Please follow up with the patient.
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Actions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" startIcon={<Download />}>
                      Download Invoice
                    </Button>
                    <Button variant="outlined" startIcon={<Print />}>
                      Print Invoice
                    </Button>
                    <Button variant="outlined" startIcon={<Send />}>
                      Send Reminder
                    </Button>
                    <Button variant="outlined" startIcon={<Edit />}>
                      Edit Details
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTransactionDetailOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default PaymentListPage; 