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
  Snackbar,
  Alert,
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
  Download,
  Print,
  Send,
  AttachMoney,
  AccessTime,
  Euro,
  People,
  CalendarToday,
  DateRange,
  DeleteOutline,
  Share,
  Email,
  LocalHospital,
} from '@mui/icons-material';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import InvoiceGenerator from './InvoiceGenerator';

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

// EXPORT: Default sample data to show when no saved data exists
export const defaultPayments = (() => {
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
const PATIENTS_STORAGE_KEY = 'clinic_patients_data';

// EXPORT: Load payments from localStorage
export const loadPaymentsFromStorage = (): any[] => {
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

// EXPORT: Save payments to localStorage
export const savePaymentsToStorage = (payments: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  } catch (error) {
    console.warn('Error saving payments to localStorage:', error);
  }
};

// Default patients data (matches PatientListPage structure)
const defaultPatientsData = [
  {
    id: 1,
    name: 'Ahmed Al-Rashid',
    phone: '+971 50 123 4567',
    email: 'ahmed.rashid@email.com',
  },
  {
    id: 2,
    name: 'Fatima Hassan',
    phone: '+971 50 234 5678', 
    email: 'fatima.hassan@email.com',
  },
  {
    id: 3,
    name: 'Mohammed Ali',
    phone: '+971 50 345 6789',
    email: 'mohammed.ali@email.com',
  },
  {
    id: 4,
    name: 'Sara Ahmed',
    phone: '+971 50 456 7890',
    email: 'sara.ahmed@email.com',
  },
  {
    id: 5,
    name: 'Omar Khalil',
    phone: '+971 50 567 8901',
    email: 'omar.khalil@email.com',
  },
  {
    id: 6,
    name: 'Layla Al-Zahra',
    phone: '+971 50 678 9012',
    email: 'layla.zahra@email.com',
  },
  {
    id: 7,
    name: 'Hassan Mahmoud',
    phone: '+971 50 789 0123',
    email: 'hassan.mahmoud@email.com',
  },
  {
    id: 8,
    name: 'Nadia Abdullah',
    phone: '+971 50 890 1234',
    email: 'nadia.abdullah@email.com',
  },
];

// EXPORT: Load patients from localStorage
export const loadPatientsFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (stored) {
      const parsedData = JSON.parse(stored);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.warn('Error loading patients from localStorage:', error);
  }
  
  // Return default data if no stored data exists
  return defaultPatientsData;
};

const findPatientPhone = (patientName: string): string | null => {
  const patients = loadPatientsFromStorage();
  const patient = patients.find(p => 
    p.name && p.name.toLowerCase() === patientName.toLowerCase()
  );
  return patient ? patient.phone : null;
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
  <Card sx={{ 
    height: '100%',
    background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${color}20`,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 25px ${color}25`,
    },
    transition: 'all 0.3s ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
    }
  }}>
    <CardContent sx={{ p: 3, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${color}30`,
            '& svg': {
              fontSize: 28,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }
          }}
        >
          {icon}
        </Box>
        {trend && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            backgroundColor: trendDirection === 'up' ? '#10B98110' : '#EF444410',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            border: `1px solid ${trendDirection === 'up' ? '#10B98130' : '#EF444430'}`
          }}>
            {trendDirection === 'up' ? (
              <TrendingUp sx={{ fontSize: 16, color: '#10B981', mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: '#EF4444', mr: 0.5 }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trendDirection === 'up' ? '#10B981' : '#EF4444',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              {trend}
            </Typography>
          </Box>
        )}
      </Box>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 800, 
          mb: 0.5, 
          color: 'text.primary',
          background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none'
        }}
      >
        {value}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
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
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPaymentForStatusChange, setSelectedPaymentForStatusChange] = useState<any>(null);
  const [exportOptionsOpen, setExportOptionsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'thisMonth' | 'lastMonth' | 'paid' | 'pending' | 'overdue' | 'withInsurance'>('all');
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

  const getFilteredPayments = () => {
    let filtered = payments;

    // Apply main filter
    switch (activeFilter) {
      case 'thisMonth':
        const thisMonth = new Date();
        thisMonth.setDate(1);
        filtered = filtered.filter(payment => new Date(payment.date) >= thisMonth);
        break;
      case 'lastMonth':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const endLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        lastMonth.setDate(1);
        filtered = filtered.filter(payment => {
          const paymentDate = new Date(payment.date);
          return paymentDate >= lastMonth && paymentDate <= endLastMonth;
        });
        break;
      case 'paid':
        filtered = filtered.filter(payment => payment.status === 'paid');
        break;
      case 'pending':
        filtered = filtered.filter(payment => payment.status === 'pending');
        break;
      case 'overdue':
        filtered = filtered.filter(payment => payment.status === 'overdue');
        break;
      case 'withInsurance':
        filtered = filtered.filter(payment => payment.insurance === 'Yes');
        break;
      default: // 'all'
        break;
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPayments = getFilteredPayments();

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalInsurance = payments.filter(p => p.status === 'paid' && p.insurance === 'Yes').reduce((sum, p) => sum + (p.insuranceAmount || 0), 0);
  const totalProfit = totalRevenue - totalInsurance;
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

    // Show success message with snackbar
    setSnackbar({
      open: true,
      message: `✅ Invoice ${newPayment.invoiceId} created successfully for ${newPayment.patient}!`,
      severity: 'success'
    });

    // Optional: Auto-open the new invoice for viewing
    setTimeout(() => {
      setSelectedInvoiceForView(newPayment);
      setInvoiceDialogOpen(true);
    }, 1000);
  };

  // Handle updating payment status
  const handleUpdatePaymentStatus = (paymentId: number, newStatus: string) => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId ? { ...payment, status: newStatus } : payment
      )
    );
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

  // Enhanced button handlers
  const handleViewInvoice = (payment: any) => {
    setSelectedInvoiceForView(payment);
    setInvoiceDialogOpen(true);
  };

  const handleDownloadInvoice = (payment: any) => {
    setSnackbar({
      open: true,
      message: `📄 Generating PDF for invoice ${payment.invoiceId}...`,
      severity: 'info'
    });

    // Generate PDF content
    const generateInvoicePDF = () => {
      const invoiceData = `
INVOICE ${payment.invoiceId}
========================================

Bill To: ${payment.patient}
Date: ${new Date(payment.date).toLocaleDateString()}
Due Date: ${new Date(payment.dueDate).toLocaleDateString()}

Service Description: ${payment.description}
Category: ${payment.category}
Payment Method: ${payment.method}

----------------------------------------
Subtotal:                ${payment.currency} ${payment.amount.toFixed(2)}
VAT (14%):              ${payment.currency} ${(payment.amount * 0.14).toFixed(2)}
Total Amount:           ${payment.currency} ${(payment.amount * 1.14).toFixed(2)}

${payment.insurance === 'Yes' ? `
Insurance Coverage:     ${payment.currency} ${payment.insuranceAmount}
Patient Balance:        ${payment.currency} ${(payment.amount * 1.14 - payment.insuranceAmount).toFixed(2)}
` : ''}

Status: ${payment.status.toUpperCase()}

----------------------------------------
Generated by Modern Clinic Management System
${new Date().toLocaleString()}
      `;

      // Create and download the file
      const blob = new Blob([invoiceData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${payment.invoiceId}_${payment.patient.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: `✅ Invoice ${payment.invoiceId} downloaded successfully!`,
        severity: 'success'
      });
    };

    // Simulate processing time then download
    setTimeout(generateInvoicePDF, 1000);
  };

  const handlePrintInvoice = (payment: any) => {
    setSnackbar({
      open: true,
      message: `🖨️ Preparing invoice ${payment.invoiceId} for printing...`,
      severity: 'info'
    });

    // Create a printable invoice
    const printInvoice = () => {
      const totalAmount = payment.amount * 1.14; // Including VAT
      const patientBalance = payment.insurance === 'Yes' 
        ? totalAmount - (payment.insuranceAmount || 0)
        : totalAmount;

      const printContent = `
        <html>
        <head>
          <title>Invoice ${payment.invoiceId}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #1976d2; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .clinic-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #1976d2; 
              margin-bottom: 10px;
            }
            .invoice-title { 
              font-size: 24px; 
              margin: 20px 0; 
              color: #1976d2;
            }
            .invoice-details { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px;
            }
            .bill-to, .invoice-info { 
              width: 45%; 
            }
            .bill-to h3, .invoice-info h3 { 
              color: #1976d2; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px;
            }
            .services-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            .services-table th, .services-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left;
            }
            .services-table th { 
              background-color: #1976d2; 
              color: white;
            }
            .totals { 
              float: right; 
              width: 300px; 
              margin-top: 20px;
            }
            .totals table { 
              width: 100%; 
              border-collapse: collapse;
            }
            .totals td { 
              padding: 8px; 
              border-bottom: 1px solid #ddd;
            }
            .total-row { 
              font-weight: bold; 
              background-color: #f5f5f5;
            }
            .status { 
              display: inline-block; 
              padding: 5px 15px; 
              border-radius: 20px; 
              color: white; 
              font-weight: bold;
              background-color: ${payment.status === 'paid' ? '#4caf50' : 
                                 payment.status === 'pending' ? '#ff9800' : '#f44336'};
            }
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              border-top: 1px solid #ddd; 
              padding-top: 20px; 
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">Modern Clinic</div>
            <div>123 Medical Street, Healthcare City</div>
            <div>Phone: +20 123 456 7890 | Email: info@modernclinic.com</div>
          </div>

          <div class="invoice-title">INVOICE</div>

          <div class="invoice-details">
            <div class="bill-to">
              <h3>Bill To:</h3>
              <strong>${payment.patient}</strong><br>
                             Patient ID: ${payment.patient.split(' ').map((n: string) => n[0]).join('')}-001
            </div>
            <div class="invoice-info">
              <h3>Invoice Details:</h3>
              <strong>Invoice #:</strong> ${payment.invoiceId}<br>
              <strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}<br>
              <strong>Due Date:</strong> ${new Date(payment.dueDate).toLocaleDateString()}<br>
              <strong>Status:</strong> <span class="status">${payment.status.toUpperCase()}</span>
            </div>
          </div>

          <table class="services-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${payment.description}</td>
                <td style="text-transform: capitalize;">${payment.category}</td>
                <td>${payment.method}</td>
                <td>${payment.currency} ${payment.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr><td>Subtotal:</td><td>${payment.currency} ${payment.amount.toFixed(2)}</td></tr>
              <tr><td>VAT (14%):</td><td>${payment.currency} ${(payment.amount * 0.14).toFixed(2)}</td></tr>
              <tr class="total-row"><td>Total Amount:</td><td>${payment.currency} ${totalAmount.toFixed(2)}</td></tr>
              ${payment.insurance === 'Yes' ? `
                <tr><td>Insurance Coverage:</td><td>-${payment.currency} ${payment.insuranceAmount}</td></tr>
                <tr class="total-row"><td>Patient Balance:</td><td>${payment.currency} ${patientBalance.toFixed(2)}</td></tr>
              ` : ''}
            </table>
          </div>

          <div style="clear: both;"></div>

          <div class="footer">
            <p><strong>Payment Terms:</strong> Payment is due within 30 days of invoice date</p>
            <p>Generated by Modern Clinic Management System on ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;

      // Open print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);

        setSnackbar({
          open: true,
          message: `✅ Invoice ${payment.invoiceId} sent to printer!`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: `❌ Unable to open print dialog. Please check popup settings.`,
          severity: 'error'
        });
      }
    };

    // Simulate processing time then print
    setTimeout(printInvoice, 800);
  };

  const handleSendReminder = (payment: any) => {
    if (payment.status === 'paid') {
      setSnackbar({
        open: true,
        message: `ℹ️ Invoice ${payment.invoiceId} is already paid. No reminder needed.`,
        severity: 'info'
      });
      return;
    }

    // Get patient phone number from patient data
    const patientPhone = findPatientPhone(payment.patient);
    if (!patientPhone) {
      setSnackbar({
        open: true,
        message: `❌ WhatsApp number not found for ${payment.patient}. Please check patient records.`,
        severity: 'error'
      });
      return;
    }

    // Calculate total amount due including VAT
    const originalAmount = payment.amount;
    const vatAmount = originalAmount * 0.14;
    const totalAmount = originalAmount + vatAmount;
    const insuranceCoverage = payment.insuranceAmount || 0;
    const amountDueFromPatient = totalAmount - insuranceCoverage;

    // Calculate days overdue
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    const isOverdue = payment.status === 'overdue';
    const daysOverdue = isOverdue 
      ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Create WhatsApp message
    let message = `🏥 *Clinic Payment Reminder*\n\n`;
    message += `Dear ${payment.patient},\n\n`;
    message += `This is a friendly reminder about your outstanding payment:\n\n`;
    message += `📋 *Invoice ID:* ${payment.invoiceId}\n`;
    message += `🗓️ *Service Date:* ${new Date(payment.date).toLocaleDateString()}\n`;
    message += `📝 *Service:* ${payment.description}\n`;
    message += `💰 *Amount Due:* ${payment.currency} ${amountDueFromPatient.toFixed(2)}\n`;
    
    if (insuranceCoverage > 0) {
      message += `🛡️ *Insurance Coverage:* ${payment.currency} ${insuranceCoverage.toFixed(2)}\n`;
    }
    
    message += `📅 *Due Date:* ${new Date(payment.dueDate).toLocaleDateString()}\n`;
    
    if (isOverdue) {
      message += `⚠️ *Overdue by:* ${daysOverdue} days\n`;
    }
    
    message += `\nPlease arrange payment at your earliest convenience.\n\n`;
    message += `For any questions, please contact our clinic.\n\n`;
    message += `Thank you! 🙏`;

    // Create WhatsApp URL
    const whatsappNumber = patientPhone.replace(/\D/g, ''); // Remove non-digits
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    setSnackbar({
      open: true,
      message: `📱 Opening WhatsApp to send reminder to ${payment.patient}...`,
      severity: 'info'
    });

    // Open WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setSnackbar({
        open: true,
        message: `✅ WhatsApp reminder opened for ${payment.patient} (${payment.currency} ${amountDueFromPatient.toFixed(2)})`,
        severity: 'success'
      });
    }, 1000);
  };

  const handleShareInvoice = (payment: any) => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${payment.invoiceId}`,
        text: `Invoice for ${payment.patient} - ${payment.currency} ${payment.amount}`,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`Invoice ${payment.invoiceId} for ${payment.patient} - ${payment.currency} ${payment.amount}`);
      setSnackbar({
        open: true,
        message: `📋 Invoice details copied to clipboard!`,
        severity: 'success'
      });
    }
  };

  const handleEditPayment = (payment: any) => {
    setNewInvoiceData({
      patient: payment.patient,
      amount: payment.amount.toString(),
      category: payment.category,
      invoiceDate: payment.date,
      dueDate: payment.dueDate,
      description: payment.description,
      method: payment.method,
      insuranceAmount: payment.insuranceAmount?.toString() || '',
    });
    setAddPaymentOpen(true);
  };

  const handleDeletePayment = (paymentId: number) => {
    const payment = payments.find(p => p.id === paymentId);
    if (window.confirm(`Are you sure you want to delete invoice ${payment?.invoiceId}?\n\nThis action cannot be undone.`)) {
      setPayments(prev => prev.filter(payment => payment.id !== paymentId));
      setSnackbar({
        open: true,
        message: `🗑️ Invoice ${payment?.invoiceId} deleted successfully!`,
        severity: 'success'
      });
    }
  };

  const handleExportData = () => {
    setExportOptionsOpen(true);
  };

  const handleExportWithOptions = (exportType: 'all' | 'paid') => {
    setSnackbar({
      open: true,
      message: `📊 Generating ${exportType === 'all' ? 'all invoices PDF report' : 'revenue analysis PDF report'}...`,
      severity: 'info'
    });

    const exportData = () => {
      if (exportType === 'all') {
        // PDF Export for All Invoices
        generatePDFReport();
      } else {
        // CSV Export for Paid Only (Revenue Report)
        generateCSVReport();
      }
    };

    const generatePDFReport = () => {
      // Create PDF content as HTML string for printing
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalInsurance = payments.reduce((sum, p) => sum + (p.insuranceAmount || 0), 0);
      const totalProfit = totalRevenue - totalInsurance;

      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>All Invoices Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1976d2; padding-bottom: 20px; }
            .clinic-name { font-size: 28px; font-weight: bold; color: #1976d2; margin: 0; }
            .report-title { font-size: 20px; color: #666; margin: 10px 0; }
            .date { font-size: 14px; color: #888; }
            .summary { background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%); padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary h3 { color: #1976d2; margin-top: 0; font-size: 18px; }
            .totals { display: flex; justify-content: space-around; margin: 20px 0; }
            .total-item { text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .total-label { font-size: 14px; color: #666; margin-bottom: 5px; }
            .total-value { font-size: 24px; font-weight: bold; }
            .revenue { color: #1976d2; }
            .insurance { color: #ff9800; }
            .profit { color: #4caf50; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; color: #333; }
            .status-paid { color: #4caf50; font-weight: bold; }
            .status-pending { color: #ff9800; font-weight: bold; }
            .status-overdue { color: #f44336; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">🏥 CLINIC MANAGEMENT SYSTEM</div>
            <div class="report-title">All Invoices Report</div>
            <div class="date">Generated on ${new Date().toLocaleString()}</div>
          </div>

          <div class="summary">
            <h3>📊 Financial Summary</h3>
            <div class="totals">
              <div class="total-item">
                <div class="total-label">Total Revenue</div>
                <div class="total-value revenue">EGP ${totalRevenue.toLocaleString()}</div>
              </div>
              <div class="total-item">
                <div class="total-label">Total Insurance</div>
                <div class="total-value insurance">EGP ${totalInsurance.toLocaleString()}</div>
              </div>
              <div class="total-item">
                <div class="total-label">Net Profit</div>
                <div class="total-value profit">EGP ${totalProfit.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <h3>📋 Invoice Details</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Insurance</th>
                <th>Method</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(payment => `
                <tr>
                  <td>${payment.invoiceId}</td>
                  <td>${payment.patient}</td>
                  <td>${payment.date}</td>
                  <td>EGP ${payment.amount.toLocaleString()}</td>
                  <td>EGP ${(payment.insuranceAmount || 0).toLocaleString()}</td>
                  <td>${payment.method}</td>
                  <td class="status-${payment.status}">${payment.status.toUpperCase()}</td>
                  <td>${payment.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report contains ${payments.length} total invoices</p>
            <p>Clinic Management System - Generated automatically</p>
          </div>
        </body>
        </html>
      `;

      // Create and download PDF using print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      }

      setSnackbar({
        open: true,
        message: `📄 PDF report generated successfully! (${payments.length} invoices)`,
        severity: 'success'
      });
    };

    const generatePaidOnlyPDFReport = () => {
      // PAID ONLY EXPORT - PDF Revenue Report (No VAT)
      const paidPayments = payments.filter(p => p.status === 'paid');
      
      // Calculate simple revenue summary
      const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalInsuranceCovered = paidPayments.reduce((sum, p) => sum + (p.insuranceAmount || 0), 0);
      const totalProfit = totalRevenue - totalInsuranceCovered;

      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Paid Invoices Revenue Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4caf50; padding-bottom: 20px; }
            .clinic-name { font-size: 28px; font-weight: bold; color: #4caf50; margin: 0; }
            .report-title { font-size: 20px; color: #666; margin: 10px 0; }
            .date { font-size: 14px; color: #888; }
            .summary { background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%); padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary h3 { color: #4caf50; margin-top: 0; font-size: 18px; }
            .totals { display: flex; justify-content: space-around; margin: 20px 0; }
            .total-item { text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .total-label { font-size: 14px; color: #666; margin-bottom: 5px; }
            .total-value { font-size: 24px; font-weight: bold; }
            .revenue { color: #4caf50; }
            .insurance { color: #ff9800; }
            .profit { color: #2e7d32; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; font-weight: bold; color: #333; }
            .status-paid { color: #4caf50; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
            .stats { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .stats h4 { color: #4caf50; margin-top: 0; }
            .stat-row { display: flex; justify-content: space-between; margin: 8px 0; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">💰 CLINIC REVENUE REPORT</div>
            <div class="report-title">Paid Invoices Only</div>
            <div class="date">Generated on ${new Date().toLocaleString()}</div>
          </div>

          <div class="summary">
            <h3>💵 Revenue Summary</h3>
            <div class="totals">
              <div class="total-item">
                <div class="total-label">Total Revenue</div>
                <div class="total-value revenue">EGP ${totalRevenue.toLocaleString()}</div>
              </div>
              <div class="total-item">
                <div class="total-label">Insurance Coverage</div>
                <div class="total-value insurance">EGP ${totalInsuranceCovered.toLocaleString()}</div>
              </div>
              <div class="total-item">
                <div class="total-label">Net Profit</div>
                <div class="total-value profit">EGP ${totalProfit.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="stats">
            <h4>📊 Financial Analysis</h4>
            <div class="stat-row">
              <span>Total Paid Transactions:</span>
              <span><strong>${paidPayments.length}</strong></span>
            </div>
            <div class="stat-row">
              <span>Average Transaction Value:</span>
              <span><strong>EGP ${paidPayments.length > 0 ? (totalRevenue / paidPayments.length).toFixed(2) : '0'}</strong></span>
            </div>
            <div class="stat-row">
              <span>Insurance Coverage Percentage:</span>
              <span><strong>${totalRevenue > 0 ? ((totalInsuranceCovered / totalRevenue) * 100).toFixed(1) : 0}%</strong></span>
            </div>
            <div class="stat-row">
              <span>Profit Margin:</span>
              <span><strong>${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%</strong></span>
            </div>
          </div>

          <h3>💳 Payment Method Breakdown</h3>
          <div class="stats">
            <div class="stat-row">
              <span>Credit Card:</span>
              <span><strong>${paidPayments.filter(p => p.method === 'Credit Card').length} transactions</strong></span>
            </div>
            <div class="stat-row">
              <span>Cash:</span>
              <span><strong>${paidPayments.filter(p => p.method === 'Cash').length} transactions</strong></span>
            </div>
            <div class="stat-row">
              <span>Bank Transfer:</span>
              <span><strong>${paidPayments.filter(p => p.method === 'Bank Transfer').length} transactions</strong></span>
            </div>
            <div class="stat-row">
              <span>Insurance Direct:</span>
              <span><strong>${paidPayments.filter(p => p.method === 'Insurance').length} transactions</strong></span>
            </div>
          </div>

          <h3>📋 Paid Invoice Details</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Insurance</th>
                <th>Net Payment</th>
                <th>Method</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${paidPayments.map(payment => {
                const insuranceAmount = payment.insuranceAmount || 0;
                const netPayment = payment.amount - insuranceAmount;
                return `
                  <tr>
                    <td>${payment.invoiceId}</td>
                    <td>${payment.patient}</td>
                    <td>${payment.date}</td>
                    <td>EGP ${payment.amount.toLocaleString()}</td>
                    <td>EGP ${insuranceAmount.toLocaleString()}</td>
                    <td>EGP ${netPayment.toLocaleString()}</td>
                    <td>${payment.method}</td>
                    <td>${payment.description}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report contains ${paidPayments.length} paid invoices</p>
            <p>Formula: Revenue - Insurance = Profit (No VAT calculations)</p>
            <p>Clinic Management System - Generated automatically</p>
          </div>
        </body>
        </html>
      `;

      // Create and download PDF using print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      }

      setSnackbar({
        open: true,
        message: `💰 Revenue PDF report generated successfully! (${paidPayments.length} paid invoices)`,
        severity: 'success'
      });
    };

    const generateCSVReport = () => {
      if (exportType === 'paid') {
        // Now calls PDF instead
        generatePaidOnlyPDFReport();
      } else {
        // ALL TRANSACTIONS EXPORT - Complete Financial Overview
        const headers = [
          'Invoice ID',
          'Patient Name',
          'Status',
          'Service Date',
          'Due Date',
          'Days Overdue',
          'Original Amount',
          'VAT (14%)',
          'Total Amount',
          'Insurance Coverage',
          'Patient Balance',
          'Payment Method',
          'Service Category',
          'Description'
        ];

        const csvRows = payments.map(payment => {
          const originalAmount = payment.amount;
          const vatAmount = originalAmount * 0.14;
          const totalAmount = originalAmount + vatAmount;
          const insuranceCoverage = payment.insuranceAmount || 0;
          const patientBalance = totalAmount - insuranceCoverage;
          
          // Calculate days overdue
          const dueDate = new Date(payment.dueDate);
          const today = new Date();
          const daysOverdue = payment.status === 'overdue' 
            ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          return [
            payment.invoiceId,
            payment.patient,
            payment.status.toUpperCase(),
            new Date(payment.date).toLocaleDateString(),
            new Date(payment.dueDate).toLocaleDateString(),
            daysOverdue > 0 ? daysOverdue.toString() : 'N/A',
            `${payment.currency} ${originalAmount.toFixed(2)}`,
            `${payment.currency} ${vatAmount.toFixed(2)}`,
            `${payment.currency} ${totalAmount.toFixed(2)}`,
            `${payment.currency} ${insuranceCoverage.toFixed(2)}`,
            `${payment.currency} ${patientBalance.toFixed(2)}`,
            payment.method,
            payment.category,
            `"${payment.description}"`
          ];
        });

        // Calculate comprehensive totals
        const paidPayments = payments.filter(p => p.status === 'paid');
        const pendingPayments = payments.filter(p => p.status === 'pending');
        const overduePayments = payments.filter(p => p.status === 'overdue');
        const partialPayments = payments.filter(p => p.status === 'partial');

        const calculateTotals = (paymentArray: any[]) => {
          const originalSum = paymentArray.reduce((sum, p) => sum + p.amount, 0);
          const vatSum = originalSum * 0.14;
          const totalSum = originalSum + vatSum;
          const insuranceSum = paymentArray.reduce((sum, p) => sum + (p.insuranceAmount || 0), 0);
          const patientSum = totalSum - insuranceSum;
          return { originalSum, vatSum, totalSum, insuranceSum, patientSum };
        };

        const paidTotals = calculateTotals(paidPayments);
        const pendingTotals = calculateTotals(pendingPayments);
        const overdueTotals = calculateTotals(overduePayments);
        const partialTotals = calculateTotals(partialPayments);
        const allTotals = calculateTotals(payments);

        const summaryRows = [
          [''],
          ['=== COMPREHENSIVE FINANCIAL REPORT ==='],
          ['Report Type:', 'All Transactions'],
          ['Generated On:', new Date().toLocaleString()],
          ['Total Records:', payments.length.toString()],
          [''],
          ['=== REVENUE REALIZED (PAID) ==='],
          ['Paid Transactions:', paidPayments.length.toString()],
          ['Paid Original Amount:', `EGP ${paidTotals.originalSum.toFixed(2)}`],
          ['Paid VAT Amount:', `EGP ${paidTotals.vatSum.toFixed(2)}`],
          ['Paid Total Revenue:', `EGP ${paidTotals.totalSum.toFixed(2)}`],
          ['Paid Insurance Coverage:', `EGP ${paidTotals.insuranceSum.toFixed(2)}`],
          ['Paid by Patients:', `EGP ${paidTotals.patientSum.toFixed(2)}`],
          [''],
          ['=== PENDING REVENUE ==='],
          ['Pending Transactions:', pendingPayments.length.toString()],
          ['Pending Original Amount:', `EGP ${pendingTotals.originalSum.toFixed(2)}`],
          ['Pending VAT Amount:', `EGP ${pendingTotals.vatSum.toFixed(2)}`],
          ['Pending Total Amount:', `EGP ${pendingTotals.totalSum.toFixed(2)}`],
          ['Expected Insurance Coverage:', `EGP ${pendingTotals.insuranceSum.toFixed(2)}`],
          ['Expected from Patients:', `EGP ${pendingTotals.patientSum.toFixed(2)}`],
          [''],
          ['=== OVERDUE AMOUNTS ==='],
          ['Overdue Transactions:', overduePayments.length.toString()],
          ['Overdue Original Amount:', `EGP ${overdueTotals.originalSum.toFixed(2)}`],
          ['Overdue VAT Amount:', `EGP ${overdueTotals.vatSum.toFixed(2)}`],
          ['Overdue Total Amount:', `EGP ${overdueTotals.totalSum.toFixed(2)}`],
          ['Overdue Insurance Coverage:', `EGP ${overdueTotals.insuranceSum.toFixed(2)}`],
          ['Overdue from Patients:', `EGP ${overdueTotals.patientSum.toFixed(2)}`],
          [''],
          ['=== PARTIAL PAYMENTS ==='],
          ['Partial Transactions:', partialPayments.length.toString()],
          ['Partial Original Amount:', `EGP ${partialTotals.originalSum.toFixed(2)}`],
          ['Partial Total Amount:', `EGP ${partialTotals.totalSum.toFixed(2)}`],
          [''],
          ['=== GRAND TOTALS ==='],
          ['Total Original Amount:', `EGP ${allTotals.originalSum.toFixed(2)}`],
          ['Total VAT Amount:', `EGP ${allTotals.vatSum.toFixed(2)}`],
          ['Total Potential Revenue:', `EGP ${allTotals.totalSum.toFixed(2)}`],
          ['Total Insurance Coverage:', `EGP ${allTotals.insuranceSum.toFixed(2)}`],
          ['Total Patient Responsibility:', `EGP ${allTotals.patientSum.toFixed(2)}`],
          [''],
          ['=== COLLECTION EFFICIENCY ==='],
          ['Revenue Collected %:', `${((paidTotals.totalSum / allTotals.totalSum) * 100).toFixed(1)}%`],
          ['Outstanding %:', `${(((pendingTotals.totalSum + overdueTotals.totalSum) / allTotals.totalSum) * 100).toFixed(1)}%`],
          ['Insurance Dependency %:', `${((allTotals.insuranceSum / allTotals.totalSum) * 100).toFixed(1)}%`]
        ];

        const csvContent = [headers, ...csvRows, ...summaryRows]
          .map(row => Array.isArray(row) ? row.join(',') : row)
          .join('\n');

        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;
        
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Complete_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

              setSnackbar({
          open: true,
          message: `✅ Revenue PDF report generated successfully!`,
          severity: 'success'
        });
    };

    setExportOptionsOpen(false);
    setTimeout(exportData, 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenStatusMenu = (event: React.MouseEvent<HTMLElement>, payment: any) => {
    event.stopPropagation();
    setStatusMenuAnchor(event.currentTarget);
    setSelectedPaymentForStatusChange(payment);
  };

  const handleCloseStatusMenu = () => {
    setStatusMenuAnchor(null);
    setSelectedPaymentForStatusChange(null);
  };

  const handleChangeStatus = (newStatus: string) => {
    if (selectedPaymentForStatusChange) {
      const oldStatus = selectedPaymentForStatusChange.status;
      handleUpdatePaymentStatus(selectedPaymentForStatusChange.id, newStatus);
      
      setSnackbar({
        open: true,
        message: `✅ Payment ${selectedPaymentForStatusChange.invoiceId} status changed from "${oldStatus}" to "${newStatus}"`,
        severity: 'success'
      });
    }
    handleCloseStatusMenu();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ 
            mb: 4, 
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3Ccircle cx="53" cy="53" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 3,
                  backdropFilter: 'blur(10px)',
                }}>
                  <MonetizationOn sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    Payment Management
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 400
                  }}>
                    Streamline invoices, track payments, and manage billing seamlessly
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={handleOpenAddPayment}
                  sx={{ 
                    borderRadius: 4,
                    px: 4,
                    py: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Create New Invoice
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Download />}
                  onClick={handleExportData}
                  sx={{ 
                    borderRadius: 4,
                    px: 3,
                    py: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Export All
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
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
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                title="Total Profit"
                value={`EGP ${totalProfit.toLocaleString()}`}
                icon={<MonetizationOn />}
                color="#8B5CF6"
                subtitle="Revenue - Insurance"
                trend="+15.3%"
                trendDirection="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                title="Pending Payments"
                value={`EGP ${pendingAmount.toLocaleString()}`}
                icon={<AccessTime />}
                color="#F59E0B"
                subtitle={`${payments.filter(p => p.status === 'pending').length} invoices`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard
                title="Overdue Amount"
                value={`EGP ${overdueAmount.toLocaleString()}`}
                icon={<Warning />}
                color="#EF4444"
                subtitle={`${payments.filter(p => p.status === 'overdue').length} overdue`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
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
            <Grid item xs={12}>
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
                            onClick={handleExportData}
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
                                  <Tooltip title="Click to change status">
                                    <Chip
                                      icon={getStatusIcon(payment.status)}
                                      label={payment.status}
                                      color={getStatusColor(payment.status) as any}
                                      size="small"
                                      variant="filled"
                                      clickable
                                      onClick={(e) => handleOpenStatusMenu(e, payment)}
                                      sx={{ 
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                          boxShadow: 2,
                                        },
                                        transition: 'all 0.2s ease'
                                      }}
                                    />
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="View Invoice">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleViewInvoice(payment)}
                                      >
                                        <Receipt fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download PDF">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleDownloadInvoice(payment)}
                                      >
                                        <Download fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Send Reminder">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleSendReminder(payment)}
                                      >
                                        <Send fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleEditPayment(payment)}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeletePayment(payment.id)}
                                      >
                                        <DeleteOutline fontSize="small" />
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
                                  <Tooltip title="Click to change status">
                                    <Chip
                                      icon={getStatusIcon(payment.status)}
                                      label={payment.status}
                                      color={getStatusColor(payment.status) as any}
                                      size="small"
                                      variant="filled"
                                      clickable
                                      onClick={(e) => handleOpenStatusMenu(e, payment)}
                                      sx={{ 
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                          boxShadow: 2,
                                        },
                                        transition: 'all 0.2s ease'
                                      }}
                                    />
                                  </Tooltip>
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
                                  <Button 
                                    size="small" 
                                    startIcon={<Receipt />}
                                    onClick={() => handleViewInvoice(payment)}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    size="small" 
                                    startIcon={<Download />}
                                    onClick={() => handleDownloadInvoice(payment)}
                                  >
                                    Download
                                  </Button>
                                  <Button 
                                    size="small" 
                                    startIcon={<Send />}
                                    onClick={() => handleSendReminder(payment)}
                                  >
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


          </Grid>

          {/* Payment Analytics Dashboard */}
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              {/* Main Analytics Card */}
              <Grid item xs={12}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3Ccircle cx="53" cy="53" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  }
                }}>
                  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        backdropFilter: 'blur(10px)',
                      }}>
                        <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                          Payment Analytics
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Real-time insights and performance metrics
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      {/* Revenue Metrics */}
                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 3, 
                          backgroundColor: 'rgba(255,255,255,0.15)', 
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
                            Collection Rate
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            {((payments.filter(p => p.status === 'paid').length / payments.length) * 100).toFixed(0)}%
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {payments.filter(p => p.status === 'paid').length} of {payments.length} invoices
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 3, 
                          backgroundColor: 'rgba(255,255,255,0.15)', 
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
                            Average Payment
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            EGP {Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Per transaction
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 3, 
                          backgroundColor: 'rgba(255,255,255,0.15)', 
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
                            Overdue Amount
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            EGP {overdueAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {payments.filter(p => p.status === 'overdue').length} invoices
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Box sx={{ 
                          p: 3, 
                          backgroundColor: 'rgba(255,255,255,0.15)', 
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 1 }}>
                            Insurance Coverage
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            {((payments.filter(p => p.insurance === 'Yes').length / payments.length) * 100).toFixed(0)}%
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Of all transactions
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Payment Method Distribution */}
              <Grid item xs={12}>
                <Card sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  border: '1px solid #e9ecef',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CreditCard sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Payment Methods
                      </Typography>
                    </Box>

                    {['Credit Card', 'Cash', 'Bank Transfer', 'Insurance'].map((method) => {
                      const count = payments.filter(p => p.method === method).length;
                      const percentage = payments.length > 0 ? (count / payments.length) * 100 : 0;
                      const amount = payments.filter(p => p.method === method).reduce((sum, p) => sum + p.amount, 0);

                      return (
                        <Box key={method} sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getMethodIcon(method)}
                              <Typography variant="body1" fontWeight={600}>
                                {method}
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                              EGP {amount.toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage} 
                              sx={{ 
                                flex: 1, 
                                height: 8, 
                                borderRadius: 2,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  backgroundColor: method === 'Credit Card' ? '#1976d2' :
                                                method === 'Cash' ? '#2e7d32' :
                                                method === 'Bank Transfer' ? '#ed6c02' : '#9c27b0'
                                }
                              }} 
                            />
                            <Typography variant="caption" fontWeight={600} sx={{ minWidth: 40 }}>
                              {percentage.toFixed(0)}%
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {count} transactions
                          </Typography>
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>



              {/* Payment Methods Section */}
              <Grid item xs={12}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  border: '1px solid #e9ecef',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Payment sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Payment Methods & Settings
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Manage accepted payment methods and preferences
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Grid container spacing={3}>
                      {[
                        { 
                          icon: <CreditCard />, 
                          title: 'Credit Cards', 
                          description: 'Visa, Mastercard, Fawry, Vodafone Cash',
                          color: '#1976d2',
                          enabled: true
                        },
                        { 
                          icon: <MonetizationOn />, 
                          title: 'Cash Payments', 
                          description: 'In-person cash transactions',
                          color: '#2e7d32',
                          enabled: true
                        },
                        { 
                          icon: <AccountBalance />, 
                          title: 'Bank Transfers', 
                          description: 'Wire transfers and ACH payments',
                          color: '#ed6c02',
                          enabled: true
                        },
                        { 
                          icon: <LocalHospital />, 
                          title: 'Insurance', 
                          description: 'Direct insurance billing',
                          color: '#9c27b0',
                          enabled: true
                        },
                      ].map((method, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                          <Card sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            border: `2px solid ${method.enabled ? method.color + '30' : '#e0e0e0'}`,
                            backgroundColor: method.enabled ? method.color + '10' : '#f5f5f5',
                            '&:hover': {
                              boxShadow: 3,
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease'
                          }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: method.enabled ? method.color : '#bdbdbd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                mx: 'auto',
                                mb: 2,
                              }}
                            >
                              {method.icon}
                            </Box>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                              {method.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {method.description}
                            </Typography>
                            <Chip 
                              label={method.enabled ? 'Active' : 'Inactive'}
                              size="small"
                              color={method.enabled ? 'success' : 'default'}
                              variant="filled"
                            />
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
            PaperProps={{
              sx: {
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Filter Payments
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Filter by status or period
              </Typography>
            </Box>
            
            <MenuItem 
              onClick={() => {
                setActiveFilter('all');
                setFilterAnchor(null);
              }}
              selected={activeFilter === 'all'}
              sx={{ py: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Receipt sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600}>All Payments</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                setActiveFilter('thisMonth');
                setFilterAnchor(null);
              }}
              selected={activeFilter === 'thisMonth'}
              sx={{ py: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600}>This Month</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                setActiveFilter('lastMonth');
                setFilterAnchor(null);
              }}
              selected={activeFilter === 'lastMonth'}
              sx={{ py: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DateRange sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600}>Last Month</Typography>
              </Box>
            </MenuItem>
            
            <Divider />
            
            <MenuItem 
              onClick={() => {
                setActiveFilter('paid');
                setFilterAnchor(null);
              }}
              selected={activeFilter === 'paid'}
              sx={{ py: 1.5, '&:hover': { backgroundColor: 'success.light' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600}>Paid Only</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                setActiveFilter('pending');
                setFilterAnchor(null);
              }}
              selected={activeFilter === 'pending'}
              sx={{ py: 1.5, '&:hover': { backgroundColor: 'warning.light' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTime sx={{ color: 'warning.main', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600}>Pending Only</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                setActiveFilter('overdue');
                setFilterAnchor(null);
              }}
              selected={activeFilter === 'overdue'}
              sx={{ py: 1.5, '&:hover': { backgroundColor: 'error.light' } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning sx={{ color: 'error.main', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600}>Overdue Only</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                setActiveFilter('withInsurance');
                setFilterAnchor(null);
              }}
              selected={activeFilter === 'withInsurance'}
              sx={{ py: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocalHospital sx={{ color: 'info.main', fontSize: 20 }} />
                <Typography variant="body2" fontWeight={600}>With Insurance</Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* Status Change Menu */}
          <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={handleCloseStatusMenu}
            PaperProps={{
              sx: {
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Change Payment Status
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedPaymentForStatusChange?.invoiceId} • {selectedPaymentForStatusChange?.patient}
              </Typography>
            </Box>
            
            <MenuItem 
              onClick={() => handleChangeStatus('pending')}
              disabled={selectedPaymentForStatusChange?.status === 'pending'}
              sx={{ 
                py: 1.5,
                '&:hover': { backgroundColor: 'warning.light' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTime sx={{ color: 'warning.main', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>Pending</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Payment is awaiting
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleChangeStatus('paid')}
              disabled={selectedPaymentForStatusChange?.status === 'paid'}
              sx={{ 
                py: 1.5,
                '&:hover': { backgroundColor: 'success.light' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>Paid</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Payment completed
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleChangeStatus('overdue')}
              disabled={selectedPaymentForStatusChange?.status === 'overdue'}
              sx={{ 
                py: 1.5,
                '&:hover': { backgroundColor: 'error.light' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning sx={{ color: 'error.main', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>Overdue</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Payment is late
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleChangeStatus('partial')}
              disabled={selectedPaymentForStatusChange?.status === 'partial'}
              sx={{ 
                py: 1.5,
                '&:hover': { backgroundColor: 'info.light' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney sx={{ color: 'info.main', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>Partial</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Partially paid
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
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
                  <Tooltip title="Click to change status">
                    <Chip
                      icon={getStatusIcon(selectedPayment?.status || '')}
                      label={selectedPayment?.status}
                      color={getStatusColor(selectedPayment?.status || '') as any}
                      variant="filled"
                      clickable
                      onClick={(e) => selectedPayment && handleOpenStatusMenu(e, selectedPayment)}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 2,
                        },
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </Tooltip>
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
                    <Button 
                      variant="contained" 
                      startIcon={<Download />}
                      onClick={() => handleDownloadInvoice(selectedPayment)}
                    >
                      Download Invoice
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Print />}
                      onClick={() => handlePrintInvoice(selectedPayment)}
                    >
                      Print Invoice
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Send />}
                      onClick={() => handleSendReminder(selectedPayment)}
                    >
                      Send Reminder
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Edit />}
                      onClick={() => handleEditPayment(selectedPayment)}
                    >
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

          {/* Invoice View Dialog */}
          <Dialog
            open={invoiceDialogOpen}
            onClose={() => setInvoiceDialogOpen(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
              sx: { 
                minHeight: '90vh',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 2,
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Invoice Preview
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={() => selectedInvoiceForView && handleShareInvoice(selectedInvoiceForView)}
                >
                  Share
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => selectedInvoiceForView && handleDownloadInvoice(selectedInvoiceForView)}
                >
                  Download
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {selectedInvoiceForView && (
                <InvoiceGenerator
                  invoiceData={selectedInvoiceForView}
                  onDownload={() => handleDownloadInvoice(selectedInvoiceForView)}
                  onPrint={() => handlePrintInvoice(selectedInvoiceForView)}
                  onShare={() => handleShareInvoice(selectedInvoiceForView)}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setInvoiceDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Export Options Dialog */}
          <Dialog
            open={exportOptionsOpen}
            onClose={() => setExportOptionsOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              }
            }}
          >
            <DialogTitle sx={{ 
              pb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px 12px 0 0',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Download sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Export Payment Data
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Choose what data to export with detailed summaries
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'text.primary' }}>
                Select Export Option:
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      p: 3, 
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      '&:hover': { 
                        border: '2px solid #1976d2',
                        boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleExportWithOptions('all')}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Receipt sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        All Transactions (PDF)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Professional PDF report with Revenue, Insurance & Profit totals
                      </Typography>
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: '#e3f2fd',
                        borderRadius: 2,
                        mb: 2
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                          {payments.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Records
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        PDF format with all invoice details & totals
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      p: 3, 
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      '&:hover': { 
                        border: '2px solid #4caf50',
                        boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleExportWithOptions('paid')}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <CheckCircle sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        Paid Only (PDF)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Revenue analysis PDF: Amount minus Insurance equals Profit
                      </Typography>
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: '#e8f5e8',
                        borderRadius: 2,
                        mb: 2
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                          {payments.filter(p => p.status === 'paid').length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Paid Records
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        PDF format with Revenue - Insurance = Profit
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ 
                mt: 4, 
                p: 3, 
                backgroundColor: '#f5f5f5',
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1976d2' }}>
                  📊 Smart Export Features:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#4caf50' }}>
                      💰 Paid Only (PDF):
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.9rem' }}>
                      • Professional revenue analysis PDF
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.9rem' }}>
                      • Detailed financial breakdown
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                      • Profit = Revenue - Insurance (No VAT)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#1976d2' }}>
                      📈 All Invoices (PDF):
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.9rem' }}>
                      • Professional PDF with all invoices
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.9rem' }}>
                      • Revenue, Insurance & Profit totals
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                      • Detailed invoice breakdown table
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={() => setExportOptionsOpen(false)}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default PaymentListPage; 