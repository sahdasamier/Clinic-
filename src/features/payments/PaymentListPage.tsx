import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore
} from 'firebase/firestore';
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
  Paper,
  LinearProgress,
  Tooltip,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
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
  Edit,
  Download,
  Print,
  Send,
  AttachMoney,
  AccessTime,
  People,
  CalendarToday,
  DateRange,
  DeleteOutline,
  Share,
  LocalHospital,
  Percent,
  Business,
} from '@mui/icons-material';

import {
  generateDefaultPayments,
  samplePaymentPatients,
  paymentCategories,
  paymentMethods,
  paymentStatuses,
  defaultNewInvoiceData,
  type PaymentData,
  type VATSettings,
  defaultVATSettings,
} from '../../data/mockData';
import { 
  getVATSettings, 
  calculateVAT, 
  calculateProfitWithVAT,
  formatCurrencyWithVAT,
  type VATCalculation 
} from '../../utils/vatUtils';
import { 
  calculateFinancialSummary,
  loadVATAdjustmentsFromStorage,
  saveVATAdjustmentsToStorage,
  type FinancialSummary 
} from '../../utils/expenseUtils';
import InvoiceGenerator from './InvoiceGenerator';
import { doctorSchedules } from '../../data/mockData';
import { loadAppointmentsFromStorage } from '../appointments/AppointmentListPage';
import { 
  paymentSync, 
  appointmentSync, 
  doctorSync,
  initializeBidirectionalSync,
  debugStorageState 
} from '../../utils/dataSyncManager';
import { 
  testPaymentNotificationSystem,
  processAllAppointmentsForPayments,
  loadPaymentsFromStorage as loadPaymentsFromPaymentUtils,
  updatePaymentStatus,
  updatePaymentAmount
} from '../../utils/paymentUtils';
import VATAdjustmentModal from './components/VATAdjustmentModal';
import ExpenseManagementModal from './components/ExpenseManagementModal';

// Doctor interface for Firestore data
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  clinicId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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



interface NewInvoiceData {
  patient: string;
  doctor: string; // Added doctor field for clinic management
  appointmentId?: string; // Link to appointment
  amount: string;
  category: string;
  invoiceDate: string;
  dueDate: string;
  description: string;
  method: string;
  insuranceAmount: string;
  includeVAT: boolean;
  vatRate: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Generate recent dates for sample data
const generateRecentDates = () => {
  const today = new Date();
  const dates = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push({
      date: date.toISOString().split('T')[0],
      dueDate: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  
  return dates;
};



// Data persistence utilities
const STORAGE_KEY = 'clinic_payments_data';
const PATIENTS_STORAGE_KEY = 'clinic_patients_data';

export const loadPaymentsFromStorage = (): PaymentData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedData = JSON.parse(stored);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.warn('Error loading payments from localStorage:', error);
  }
  
  return generateDefaultPayments();
};

const savePaymentsToStorage = (payments: PaymentData[]) => {
  // ✅ Use centralized sync manager for consistent event dispatching
  paymentSync.save(payments, 'PaymentListPage');
};

// StatCard component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  trend, 
  trendDirection 
}) => {
  const { t } = useTranslation();
  
  return (
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
};

// Main PaymentListPage component
const PaymentListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, initialized } = useAuth();
  const { userProfile } = useUser();
  const isRTL = i18n.language === 'ar';
  
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'thisMonth' | 'lastMonth' | 'paid' | 'pending' | 'overdue' | 'withInsurance'>('all');
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<PaymentData | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPaymentForStatusChange, setSelectedPaymentForStatusChange] = useState<PaymentData | null>(null);
  const [exportOptionsOpen, setExportOptionsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAppointmentSelection, setShowAppointmentSelection] = useState(false);
  const [vatAdjustmentModalOpen, setVatAdjustmentModalOpen] = useState(false);
  const [expenseManagementModalOpen, setExpenseManagementModalOpen] = useState(false);
  
  // Payment amount editing state
  const [editPaymentModalOpen, setEditPaymentModalOpen] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<PaymentData | null>(null);
  const [editPaymentForm, setEditPaymentForm] = useState({
    amount: '',
    paidAmount: ''
  });
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Load VAT adjustments from localStorage using utility function
  const [vatAdjustments, setVatAdjustments] = useState(() => {
    try {
      const loaded = loadVATAdjustmentsFromStorage();
      console.log('✅ PaymentListPage: Loaded VAT adjustments from localStorage:', loaded.length);
      return loaded;
    } catch (error) {
      console.error('❌ PaymentListPage: Error loading VAT adjustments:', error);
      return [];
    }
  });
  
  // ✅ Initialize appointments from localStorage FIRST
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('clinic_appointments_data');
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log('✅ PaymentListPage: Loaded appointments from localStorage on init:', parsedData.length);
          return parsedData;
        }
      }
    } catch (error) {
      console.error('❌ PaymentListPage: Error loading appointments from localStorage:', error);
    }
    return [];
  });
  
  // ✅ Initialize payments from localStorage using sync manager
  const [payments, setPayments] = useState<PaymentData[]>(() => {
    const loadedPayments = paymentSync.load(generateDefaultPayments());
    console.log('✅ PaymentListPage: Initialized with sync manager');
    return loadedPayments;
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  // ✅ Initialize invoice form from localStorage FIRST
  const [newInvoiceData, setNewInvoiceData] = useState<NewInvoiceData>(() => {
    try {
      const saved = localStorage.getItem('clinic_new_invoice_form');
      if (saved) {
        const parsedData = JSON.parse(saved);
        console.log('✅ PaymentListPage: Loaded invoice form from localStorage');
        return {
          ...defaultNewInvoiceData,
          includeVAT: getVATSettings().defaultIncludeVAT,
          vatRate: getVATSettings().rate,
          ...parsedData
        };
      }
    } catch (error) {
      console.error('❌ PaymentListPage: Error loading invoice form:', error);
    }
    return {
      ...defaultNewInvoiceData,
      includeVAT: getVATSettings().defaultIncludeVAT,
      vatRate: getVATSettings().rate,
    };
  });
  const [vatSettings, setVATSettings] = useState<VATSettings>(getVATSettings());
  const [currentVATCalculation, setCurrentVATCalculation] = useState<VATCalculation | null>(null);
  
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);

// Load data from localStorage on component mount - wait for auth
useEffect(() => {
  // Wait for auth to be initialized and user to be available
  if (!initialized || authLoading || !user) {
    console.log('🔄 PaymentListPage: Waiting for auth initialization...', {
      initialized,
      authLoading,
      hasUser: !!user
    });
    return;
  }

  console.log('✅ PaymentListPage: Auth initialized, loading payment data...');
  setDataLoading(true);

  try {
    const loadedPayments = loadPaymentsFromStorage();
    setPayments(loadedPayments);
    setIsDataLoaded(true);
    console.log('✅ PaymentListPage: Payment data loaded successfully');
  } catch (error) {
    console.error('❌ PaymentListPage: Error loading payment data:', error);
  } finally {
    setDataLoading(false);
  }

  // Listen for mobile FAB action
  const handleOpenAddPayment = () => {
    setAddPaymentOpen(true);
  };

  // Listen for user data clearing
  const handleUserDataCleared = () => {
    // Reset to default state
    setPayments(generateDefaultPayments());
    setTabValue(0);
    setSearchQuery('');
    setActiveFilter('all');
    setNewInvoiceData({
      ...defaultNewInvoiceData,
      includeVAT: getVATSettings().defaultIncludeVAT,
      vatRate: getVATSettings().rate,
    });
    setSelectedPayment(null);
    setSelectedInvoiceForView(null);
    setSelectedPaymentForStatusChange(null);
    
    // Close all dialogs
    setAddPaymentOpen(false);
    setInvoiceDialogOpen(false);
    setExportOptionsOpen(false);
    setFilterAnchor(null);
    setStatusMenuAnchor(null);
    
    // Set view mode to default
    setViewMode('table');
    
    console.log('✅ Payments reset to default state');
  };

  window.addEventListener('userDataCleared', handleUserDataCleared);
  window.addEventListener('openAddPayment', handleOpenAddPayment);
  
  return () => {
    window.removeEventListener('userDataCleared', handleUserDataCleared);
    window.removeEventListener('openAddPayment', handleOpenAddPayment);
  };
}, [initialized, authLoading, user]);

// ✅ Real-time Firestore listener for doctors
useEffect(() => {
  const db = getFirestore();
  const clinicId = userProfile?.clinicId;
  
  if (!clinicId) {
    console.log('🔄 PaymentListPage: Waiting for clinicId...');
    return;
  }

  console.log('🔄 PaymentListPage: Setting up real-time doctor listener for clinic:', clinicId);

      const q = query(
      collection(db, 'users'),
      where('clinicId', '==', clinicId),
      where('role', '==', 'doctor'),
      where('isActive', '==', true)
    );

  const unsub = onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Doctor[];
    setAvailableDoctors(list);
    console.log('✅ PaymentListPage: Real-time doctors updated:', list.length);
  }, (error) => {
    console.error('❌ PaymentListPage: Error in doctor listener:', error);
    // Fallback to empty array on error
    setAvailableDoctors([]);
  });

  return () => {
    console.log('🔄 PaymentListPage: Cleaning up doctor listener');
    unsub();
  };
}, [userProfile?.clinicId]);

// ✅ Initialize bidirectional sync with centralized manager
useEffect(() => {
  // Set up appointment listener to update local state
  const cleanupAppointmentSync = appointmentSync.listen((event) => {
    const updatedAppointments = appointmentSync.load([]);
    setAppointments(updatedAppointments);
    console.log('🔄 PaymentListPage: Synced appointments from event');
  }, 'PaymentListPage');



  // Set up VAT adjustments listener
  const handleVATAdjustmentsUpdate = () => {
    try {
      const updatedAdjustments = loadVATAdjustmentsFromStorage();
      setVatAdjustments(updatedAdjustments);
      console.log('🔄 PaymentListPage: Synced VAT adjustments from storage event');
      
      // Trigger financial summary recalculation
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error syncing VAT adjustments:', error);
    }
  };

  window.addEventListener('vatAdjustmentsUpdated', handleVATAdjustmentsUpdate);

  // Debug current state
  debugStorageState();
  
  return () => {
    cleanupAppointmentSync();
    window.removeEventListener('vatAdjustmentsUpdated', handleVATAdjustmentsUpdate);
  };
}, []);

// Save data to localStorage whenever payments change
useEffect(() => {
  if (isDataLoaded && payments.length > 0) {
    savePaymentsToStorage(payments);
  }
}, [payments, isDataLoaded]);

// Save invoice form data to localStorage whenever it changes
useEffect(() => {
  try {
    localStorage.setItem('clinic_new_invoice_form', JSON.stringify(newInvoiceData));
    console.log('✅ PaymentListPage: Saved invoice form to localStorage');
  } catch (error) {
    console.error('❌ PaymentListPage: Error saving invoice form:', error);
  }
}, [newInvoiceData]);

// Calculate VAT whenever amount or VAT settings change
useEffect(() => {
  const amount = parseFloat(newInvoiceData.amount);
  if (!isNaN(amount) && amount > 0) {
    const calculation = calculateVAT(amount, newInvoiceData.vatRate, newInvoiceData.includeVAT);
    setCurrentVATCalculation(calculation);
  } else {
    setCurrentVATCalculation(null);
  }
  }, [newInvoiceData.amount, newInvoiceData.vatRate, newInvoiceData.includeVAT]);

// Appointment helper functions
const getAppointmentsByDate = (date: string) => {
  return appointments.filter(apt => apt.date === date);
};

const getCompletedAppointmentsByDate = (date: string) => {
  return appointments.filter(apt => 
    apt.date === date && (apt.status === 'completed' || apt.completed === true)
  );
};

const getPendingAppointmentsByDate = (date: string) => {
  return appointments.filter(apt => 
    apt.date === date && apt.status !== 'completed' && apt.completed !== true
  );
};

const handleAppointmentSelection = (appointment: any) => {
  setNewInvoiceData(prev => ({
    ...prev,
    patient: appointment.patient,
    doctor: appointment.doctor,
    appointmentId: appointment.id?.toString(),
    invoiceDate: appointment.date,
    description: `${appointment.type} appointment with Dr. ${appointment.doctor}`,
    category: appointment.type.toLowerCase().includes('consultation') ? 'consultation' : 
              appointment.type.toLowerCase().includes('checkup') ? 'checkup' :
              appointment.type.toLowerCase().includes('emergency') ? 'emergency' : 'consultation'
  }));
  setShowAppointmentSelection(false);
};

// Calculate appointment-related statistics
const todayAppointments = getAppointmentsByDate(new Date().toISOString().split('T')[0]);
const completedTodayAppointments = getCompletedAppointmentsByDate(new Date().toISOString().split('T')[0]);
const pendingTodayAppointments = getPendingAppointmentsByDate(new Date().toISOString().split('T')[0]);
const appointmentLinkedPayments = payments.filter(payment => payment.appointmentId);

// Calculate today's appointment revenue
const todayAppointmentRevenue = appointmentLinkedPayments
  .filter(payment => payment.date === new Date().toISOString().split('T')[0])
  .reduce((sum, payment) => sum + (payment.status === 'paid' ? payment.amount : 0), 0);

// Helper functions
const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  setTabValue(newValue);
};

const getStatusColor = (status: string) => {
  const statusColors = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
    partial: 'info'
  };
  return statusColors[status as keyof typeof statusColors] || 'default';
};

const getStatusIcon = (status: string) => {
  const statusIcons = {
    paid: <CheckCircle fontSize="small" />,
    pending: <AccessTime fontSize="small" />,
    overdue: <Warning fontSize="small" />,
    partial: <AttachMoney fontSize="small" />
  };
  return statusIcons[status as keyof typeof statusIcons] || <Receipt fontSize="small" />;
};

const getMethodIcon = (method: string) => {
  const methodIcons = {
    'credit card': <CreditCard fontSize="small" />,
    'cash': <MonetizationOn fontSize="small" />,
    'bank transfer': <AccountBalance fontSize="small" />,
    'insurance': <Receipt fontSize="small" />
  };
  return methodIcons[method.toLowerCase() as keyof typeof methodIcons] || <Payment fontSize="small" />;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(
    isRTL ? 'ar-EG' : 'en-US',
    { style: 'decimal', minimumFractionDigits: 2 }
  ).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(
    isRTL ? 'ar-EG' : 'en-US'
  );
};

// Filtering logic
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

// Calculate comprehensive financial summary with all expenses
const paidPayments = payments.filter(p => p.status === 'paid');
const baseRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
const totalInsurance = paidPayments.filter(p => p.insurance === 'Yes').reduce((sum, p) => sum + (p.insuranceAmount || 0), 0);

// Enhanced VAT calculations - only calculate VAT if there are actually VAT-enabled payments
const paymentsWithVAT = paidPayments.filter(p => p.includeVAT && (p.vatAmount || 0) > 0);
const automaticVATFromPayments = paymentsWithVAT.reduce((sum, p) => sum + (p.vatAmount || 0), 0);
const hasVATPayments = paymentsWithVAT.length > 0;

// Process appointments to create payments
useEffect(() => {
  if (appointments.length > 0) {
    processAllAppointmentsForPayments(appointments);
    
    // Reload payments after processing appointments
    setTimeout(() => {
      const updatedPayments = loadPaymentsFromPaymentUtils();
      setPayments(updatedPayments);
      console.log(`🔄 Reloaded ${updatedPayments.length} payments after processing appointments`);
    }, 100);
  }
}, [appointments]);

// Calculate comprehensive financial summary including salaries, business expenses, and VAT adjustments
// Use refreshTrigger to force recalculation when VAT adjustments change
const financialSummary: FinancialSummary = useMemo(() => {
  console.log('📊 Calculating financial summary with:', { 
    baseRevenue, 
    automaticVATFromPayments, 
    vatAdjustments: vatAdjustments.length,
    refreshTrigger 
  });
  
  // Debug VAT adjustments
  console.log('🔍 Current VAT adjustments in state:', vatAdjustments);
  
  const summary = calculateFinancialSummary(baseRevenue, automaticVATFromPayments);
  console.log('💰 Financial summary calculated:', {
    finalVATCollected: summary.finalVATCollected,
    netVATAdjustments: summary.netVATAdjustments,
    totalExpenses: summary.totalExpenses,
    netProfit: summary.netProfit,
    vatAdjustmentDetails: summary.vatAdjustmentDetails
  });
  
  // Additional debug for VAT card display
  console.log('🎯 VAT Card will show:', Math.abs(summary.finalVATCollected));
  
  return summary;
}, [baseRevenue, automaticVATFromPayments, vatAdjustments, refreshTrigger]);

// Extract key financial metrics
const totalRevenue = financialSummary.adjustedRevenue; // Revenue including VAT adjustments
const totalProfit = financialSummary.netProfit; // Profit after all expenses (salaries + business expenses)
const grossProfit = financialSummary.grossProfit; // Profit before expenses (after VAT only)
const totalExpenses = financialSummary.totalExpenses; // All expenses (salaries + business)
const finalVATCollected = financialSummary.finalVATCollected; // Final VAT after all adjustments
const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

// Event handlers
const handleCreatePayment = () => {
  // Validation
  if (!newInvoiceData.patient || !newInvoiceData.amount || !newInvoiceData.category || 
      !newInvoiceData.invoiceDate || !newInvoiceData.dueDate || !newInvoiceData.description || !newInvoiceData.method) {
    setSnackbar({
      open: true,
      message: t('payment.validation.fillAllFields'),
      severity: 'error'
    });
    return;
  }

  const amount = parseFloat(newInvoiceData.amount);
  if (isNaN(amount) || amount <= 0) {
    setSnackbar({
      open: true,
      message: t('payment.validation.validAmount'),
      severity: 'error'
    });
    return;
  }

  // Validate dates
  const invoiceDate = new Date(newInvoiceData.invoiceDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (invoiceDate > today) {
    setSnackbar({
      open: true,
      message: t('payment.validation.futureDateNotAllowed'),
      severity: 'error'
    });
    return;
  }

  const dueDate = new Date(newInvoiceData.dueDate);
  if (dueDate <= invoiceDate) {
    setSnackbar({
      open: true,
      message: t('payment.validation.dueDateAfterInvoice'),
      severity: 'error'
    });
    return;
  }

  const insuranceAmount = parseFloat(newInvoiceData.insuranceAmount) || 0;
  
  // Calculate VAT
  const vatCalculation = calculateVAT(amount, newInvoiceData.vatRate, newInvoiceData.includeVAT);

  const newPayment: PaymentData = {
    id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
    invoiceId: `INV-2024-${String(payments.length + 1).padStart(3, '0')}`,
    patientAvatar: newInvoiceData.patient.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
    date: newInvoiceData.invoiceDate,
    status: 'pending',
    currency: 'EGP',
    patient: newInvoiceData.patient,
    doctor: newInvoiceData.doctor, // Added doctor field
    amount: vatCalculation.totalAmountWithVAT, // Total amount including VAT if applicable
    category: newInvoiceData.category,
    dueDate: newInvoiceData.dueDate,
    description: newInvoiceData.description,
    method: newInvoiceData.method,
    insurance: insuranceAmount > 0 ? 'Yes' : 'No',
    insuranceAmount: insuranceAmount,
    includeVAT: vatCalculation.includeVAT,
    vatRate: vatCalculation.vatRate,
    vatAmount: vatCalculation.vatAmount,
    totalAmountWithVAT: vatCalculation.totalAmountWithVAT,
    baseAmount: vatCalculation.baseAmount,
    ...(newInvoiceData.appointmentId && { appointmentId: newInvoiceData.appointmentId }), // Link to appointment if selected
  };

  setPayments(prev => [newPayment, ...prev]);
  setAddPaymentOpen(false);
  
  // Reset form
  setNewInvoiceData({
    ...defaultNewInvoiceData,
    includeVAT: vatSettings.defaultIncludeVAT,
    vatRate: vatSettings.rate,
  });

  setSnackbar({
    open: true,
    message: t('payment.success.invoiceCreated', { invoiceId: newPayment.invoiceId, patient: newPayment.patient }),
    severity: 'success'
  });

  // Auto-open invoice for viewing
  setTimeout(() => {
    setSelectedInvoiceForView(newPayment);
    setInvoiceDialogOpen(true);
  }, 1000);
};

const handleUpdatePaymentStatus = async (paymentId: number, newStatus: string, paidAmount?: number) => {
  try {
    // Use the notification-enabled payment status update
    const success = await updatePaymentStatus(paymentId, newStatus, paidAmount);
    
    if (success) {
      // Reload payments from storage to get the updated data
      const updatedPayments = loadPaymentsFromPaymentUtils();
      setPayments(updatedPayments);
      
      const payment = updatedPayments.find(p => p.id === paymentId);
      const statusText = t(`payment.status.${newStatus}`);
      
      setSnackbar({
        open: true,
        message: `Payment ${payment?.invoiceId} status updated to ${statusText}. ${newStatus === 'paid' ? 'Notifications sent!' : ''}`,
        severity: 'success'
      });
    } else {
      throw new Error('Failed to update payment status');
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    setSnackbar({
      open: true,
      message: 'Failed to update payment status. Please try again.',
      severity: 'error'
    });
  }
};

const handleViewInvoice = (payment: PaymentData) => {
  setSelectedInvoiceForView(payment);
  setInvoiceDialogOpen(true);
};

const handleDownloadInvoice = (payment: PaymentData) => {
  setSnackbar({
    open: true,
    message: t('payment.actions.generatingPDF', { invoiceId: payment.invoiceId }),
    severity: 'info'
  });

  setTimeout(() => {
    // Generate and download PDF logic here
    const invoiceContent = generateInvoiceText(payment);
    downloadTextFile(invoiceContent, `Invoice_${payment.invoiceId}.txt`);
    
    setSnackbar({
      open: true,
      message: t('payment.success.invoiceDownloaded', { invoiceId: payment.invoiceId }),
      severity: 'success'
    });
  }, 1000);
};

const handlePrintInvoice = (payment: PaymentData) => {
  setSnackbar({
    open: true,
    message: t('payment.actions.preparingPrint', { invoiceId: payment.invoiceId }),
    severity: 'info'
  });

  setTimeout(() => {
    const printContent = generatePrintableInvoice(payment);
    openPrintWindow(printContent);
    
    setSnackbar({
      open: true,
      message: t('payment.success.invoiceSentToPrinter', { invoiceId: payment.invoiceId }),
      severity: 'success'
    });
  }, 800);
};

const handleSendReminder = (payment: PaymentData) => {
  if (payment.status === 'paid') {
    setSnackbar({
      open: true,
      message: t('payment.info.alreadyPaid', { invoiceId: payment.invoiceId }),
      severity: 'info'
    });
    return;
  }

  // Generate WhatsApp message and open
  const message = generateReminderMessage(payment);
  const phoneNumber = '+20123456789'; // This should come from patient data
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  setSnackbar({
    open: true,
    message: t('payment.actions.openingWhatsApp', { patient: payment.patient }),
    severity: 'info'
  });

  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
    setSnackbar({
      open: true,
      message: t('payment.success.reminderSent', { patient: payment.patient }),
      severity: 'success'
    });
  }, 1000);
};

const handleEditPayment = (payment: PaymentData) => {
  setSelectedPaymentForEdit(payment);
  setEditPaymentForm({
    amount: payment.baseAmount?.toString() || payment.amount.toString(),
    paidAmount: payment.paidAmount?.toString() || '0'
  });
  setEditPaymentModalOpen(true);
};

const handleSavePaymentEdit = async () => {
  if (!selectedPaymentForEdit) return;
  
  const newAmount = parseFloat(editPaymentForm.amount);
  const newPaidAmount = parseFloat(editPaymentForm.paidAmount);
  
  if (isNaN(newAmount) || newAmount <= 0) {
    setSnackbar({
      open: true,
      message: 'Please enter a valid amount',
      severity: 'error'
    });
    return;
  }
  
  if (isNaN(newPaidAmount) || newPaidAmount < 0) {
    setSnackbar({
      open: true,
      message: 'Please enter a valid paid amount',
      severity: 'error'
    });
    return;
  }
  
  try {
    const success = updatePaymentAmount(selectedPaymentForEdit.id, newAmount, newPaidAmount);
    
    if (success) {
      // Reload payments
      const updatedPayments = loadPaymentsFromPaymentUtils();
      setPayments(updatedPayments);
      
      setEditPaymentModalOpen(false);
      setSelectedPaymentForEdit(null);
      
      setSnackbar({
        open: true,
        message: `Payment ${selectedPaymentForEdit.invoiceId} amount updated successfully!`,
        severity: 'success'
      });
    } else {
      throw new Error('Failed to update payment amount');
    }
  } catch (error) {
    console.error('Error updating payment amount:', error);
    setSnackbar({
      open: true,
      message: 'Failed to update payment amount. Please try again.',
      severity: 'error'
    });
  }
};

const handleDeletePayment = (paymentId: number) => {
  const payment = payments.find(p => p.id === paymentId);
  if (window.confirm(t('payment.confirmation.deleteInvoice', { invoiceId: payment?.invoiceId }))) {
    setPayments(prev => prev.filter(payment => payment.id !== paymentId));
    setSnackbar({
      open: true,
      message: t('payment.success.invoiceDeleted', { invoiceId: payment?.invoiceId }),
      severity: 'success'
    });
  }
};

const handleOpenStatusMenu = (event: React.MouseEvent<HTMLElement>, payment: PaymentData) => {
  event.stopPropagation();
  setStatusMenuAnchor(event.currentTarget);
  setSelectedPaymentForStatusChange(payment);
};

const handleCloseStatusMenu = () => {
  setStatusMenuAnchor(null);
  setSelectedPaymentForStatusChange(null);
};

const handleChangeStatus = async (newStatus: string) => {
  if (selectedPaymentForStatusChange) {
    await handleUpdatePaymentStatus(selectedPaymentForStatusChange.id, newStatus);
  }
  handleCloseStatusMenu();
};

const handleCloseSnackbar = () => {
  setSnackbar(prev => ({ ...prev, open: false }));
};

// Handle VAT adjustments
const handleVATAdjustmentSave = (adjustments: any[]) => {
  console.log('💰 VAT Adjustments saved:', adjustments);
  
  // Save to both state and localStorage
  setVatAdjustments(adjustments);
  
  // Use the imported function to save to localStorage
  saveVATAdjustmentsToStorage(adjustments);
  console.log('💾 VAT adjustments saved to localStorage');
  
  // Trigger recalculation of financial summary by updating refresh trigger
  setRefreshTrigger(prev => {
    const newTrigger = prev + 1;
    console.log('🔄 Triggering financial summary recalculation:', newTrigger);
    return newTrigger;
  });
  
  // Force immediate recalculation by checking localStorage
  setTimeout(() => {
    const reloadedAdjustments = loadVATAdjustmentsFromStorage();
    console.log('🔍 Verification - Reloaded VAT adjustments from localStorage:', reloadedAdjustments);
    
    if (reloadedAdjustments.length !== adjustments.length) {
      console.warn('⚠️ VAT adjustments count mismatch!');
    }
  }, 100);
  
  setSnackbar({
    open: true,
    message: `VAT adjustments saved successfully! ${adjustments.length} adjustments applied.`,
    severity: 'success'
  });
};

// Enhanced utility functions
const generateInvoiceText = (payment: PaymentData): string => {
  // Enhanced VAT calculation - only apply if VAT is included
  const hasVAT = payment.includeVAT && (payment.vatRate || 0) > 0;
  const vatRate = hasVAT ? (payment.vatRate || 0) / 100 : 0;
  const vatAmount = hasVAT ? payment.amount * vatRate : 0;
  const totalAmount = payment.amount + vatAmount;
  
  const patientBalance = payment.insurance === 'Yes' 
    ? totalAmount - (payment.insuranceAmount || 0)
    : totalAmount;

  return `
${t('invoice.title')} ${payment.invoiceId}
========================================

${t('invoice.sections.billTo')}: ${payment.patient}
${t('invoice.labels.issueDate')}: ${formatDate(payment.date)}
${t('invoice.labels.dueDate')}: ${formatDate(payment.dueDate)}

${t('invoice.table.description')}: ${payment.description}
${t('invoice.table.category')}: ${t(`payment.categories.${payment.category}`)}
${t('invoice.table.paymentMethod')}: ${t(`payment.methods.${payment.method.toLowerCase().replace(' ', '_')}`)}

----------------------------------------
${t('invoice.calculations.subtotal')}: ${payment.currency} ${formatCurrency(payment.amount)}
${hasVAT 
  ? `${t('invoice.calculations.vat')} (${(vatRate * 100).toFixed(1)}%): ${payment.currency} ${formatCurrency(vatAmount)}`
  : `${t('invoice.calculations.vat')}: Not Applicable - ${payment.currency} 0.00`
}
${t('invoice.calculations.totalAmount')}: ${payment.currency} ${formatCurrency(totalAmount)}

${payment.insurance === 'Yes' ? `
${t('invoice.calculations.insuranceCoverage')}: ${payment.currency} ${formatCurrency(payment.insuranceAmount)}
${t('invoice.calculations.patientBalance')}: ${payment.currency} ${formatCurrency(patientBalance)}
` : ''}

${t('invoice.labels.status')}: ${t(`payment.status.${payment.status}`).toUpperCase()}

----------------------------------------
${t('invoice.footer.generatedBy')} ${t('invoice.defaultClinic.name')} ${t('invoice.footer.managementSystem')}
${formatDate(new Date().toISOString())}
  `;
};

const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const generatePrintableInvoice = (payment: PaymentData): string => {
  // Enhanced VAT calculation for printable invoice
  const hasVAT = payment.includeVAT && (payment.vatRate || 0) > 0;
  const vatRate = hasVAT ? (payment.vatRate || 0) / 100 : 0;
  const vatAmount = hasVAT ? payment.amount * vatRate : 0;
  const totalAmount = payment.amount + vatAmount;
  
  const patientBalance = payment.insurance === 'Yes' 
    ? totalAmount - (payment.insuranceAmount || 0)
    : totalAmount;

  return `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${i18n.language}">
    <head>
      <meta charset="UTF-8">
      <title>${t('invoice.title')} ${payment.invoiceId}</title>
      <style>
        body { 
          font-family: ${isRTL ? 'Noto Sans Arabic, Arial' : 'Arial'}, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
          color: #333;
          direction: ${isRTL ? 'rtl' : 'ltr'};
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
        /* Add more styles as needed */
      </style>
    </head>
    <body>
      <div class="header">
        <div class="clinic-name">${t('invoice.defaultClinic.name')}</div>
        <div>${t('invoice.defaultClinic.address')}</div>
        <div>${t('invoice.labels.phone')}: ${t('invoice.defaultClinic.phone')} | ${t('invoice.labels.email')}: ${t('invoice.defaultClinic.email')}</div>
      </div>

      <div class="invoice-title">${t('invoice.title')}</div>

      <!-- Add complete invoice HTML structure here -->
      
    </body>
    </html>
  `;
};

const openPrintWindow = (content: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
};

const generateReminderMessage = (payment: PaymentData): string => {
  // Enhanced VAT calculation for reminder message
  const hasVAT = payment.includeVAT && (payment.vatRate || 0) > 0;
  const vatRate = hasVAT ? (payment.vatRate || 0) / 100 : 0;
  const vatAmount = hasVAT ? payment.amount * vatRate : 0;
  const totalAmount = payment.amount + vatAmount;
  
  const amountDue = payment.insurance === 'Yes' 
    ? totalAmount - (payment.insuranceAmount || 0)
    : totalAmount;

  return `🏥 *${t('payment.reminder.title')}*\n\n${t('payment.reminder.dear')} ${payment.patient},\n\n${t('payment.reminder.friendlyReminder')}:\n\n📋 *${t('invoice.labels.invoiceId')}:* ${payment.invoiceId}\n🗓️ *${t('invoice.labels.serviceDate')}:* ${formatDate(payment.date)}\n📝 *${t('invoice.table.description')}:* ${payment.description}\n💰 *${t('payment.reminder.amountDue')}:* ${payment.currency} ${formatCurrency(amountDue)}\n📅 *${t('invoice.labels.dueDate')}:* ${formatDate(payment.dueDate)}\n\n${t('payment.reminder.pleaseArrange')}\n\n${t('payment.reminder.questions')}\n\n${t('payment.reminder.thankYou')} 🙏`;
};

// Show loading spinner while data is loading
if (dataLoading) {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading payment data...
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Please wait while we load your payment information
        </Typography>
      </Box>
    </Container>
  );
}

return (
  <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto', direction: isRTL ? 'rtl' : 'ltr' }}>
        {/* Header Section */}
        <Box sx={{ 
          mb: 4, 
          p: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            justifyContent: 'space-between', 
            position: 'relative', 
            zIndex: 1,
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 0 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
              <Box sx={{
                width: { xs: 48, md: 60 },
                height: { xs: 48, md: 60 },
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: isRTL ? 0 : { xs: 2, md: 3 },
                ml: isRTL ? { xs: 2, md: 3 } : 0,
                backdropFilter: 'blur(10px)',
                flexShrink: 0,
              }}>
                <MonetizationOn sx={{ fontSize: { xs: 24, md: 32 }, color: 'white' }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  color: 'white',
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  lineHeight: 1.2
                }}>
                  {t('payment.title')}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  fontSize: { xs: '0.9rem', md: '1.25rem' },
                  lineHeight: 1.3
                }}>
                  {t('payment.subtitle')}
                </Typography>
              </Box>
            </Box>
            
            {/* Responsive Button Container */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 2, md: 2 },
              width: { xs: '100%', md: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'stretch'
            }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setAddPaymentOpen(true)}
                sx={{ 
                  borderRadius: 3,
                  px: { xs: 3, md: 4 },
                  py: { xs: 1.5, md: 1.5 },
                  minHeight: 48,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', md: '1.1rem' },
                  flex: { xs: 1, sm: 'none' },
                  minWidth: { xs: 'auto', sm: 160 },
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {t('payment.actions.createNewInvoice')}
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  New Invoice
                </Box>
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<Download />}
                onClick={() => setExportOptionsOpen(true)}
                sx={{ 
                  borderRadius: 3,
                  px: { xs: 3, md: 4 },
                  py: { xs: 1.5, md: 1.5 },
                  minHeight: 48,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  flex: { xs: 1, sm: 'none' },
                  minWidth: { xs: 'auto', sm: 120 },
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {t('payment.actions.exportAll')}
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  Export All
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title={t('payment.stats.totalRevenue')}
              value={`EGP ${formatCurrency(totalRevenue)}`}
              icon={<TrendingUp />}
              color="#10B981"
              subtitle={t('payment.stats.thisMonth')}
              trend="+12.5%"
              trendDirection="up"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Net Profit (After All Expenses)"
              value={`EGP ${formatCurrency(totalProfit)}`}
              icon={<MonetizationOn />}
              color="#8B5CF6"
              subtitle={`Revenue: EGP ${formatCurrency(totalRevenue)} | Total Expenses: EGP ${formatCurrency(totalExpenses)} | Net: EGP ${formatCurrency(totalProfit)}`}
              trend="+15.3%"
              trendDirection="up"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title={t('payment.stats.pendingPayments')}
              value={`EGP ${formatCurrency(pendingAmount)}`}
              icon={<AccessTime />}
              color="#F59E0B"
              subtitle={t('payment.stats.pendingInvoices', { count: payments.filter(p => p.status === 'pending').length })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box 
              onClick={() => setExpenseManagementModalOpen(true)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease'
                }
              }}
            >
              <StatCard
                title="💼 Total Expenses (Click to Edit)"
                value={`EGP ${formatCurrency(totalExpenses)}`}
                icon={<Business />}
                color="#EF4444"
                subtitle={`Salaries: EGP ${formatCurrency(financialSummary.totalSalaryExpenses)} | Business: EGP ${formatCurrency(financialSummary.totalBusinessExpenses)}`}
                trend={totalExpenses > 0 ? "Active" : "None"}
                trendDirection={totalExpenses > 0 ? "up" : undefined}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <StatCard
              title="Today's Appointments Revenue"
              value={`EGP ${formatCurrency(todayAppointmentRevenue)}`}
              icon={<CalendarToday />}
              color="#2196F3"
              subtitle={`${todayAppointments.length} appointments: ${completedTodayAppointments.length} completed • ${pendingTodayAppointments.length} pending`}
              trend={todayAppointmentRevenue > 0 ? `+EGP ${formatCurrency(todayAppointmentRevenue)}` : "No Revenue"}
              trendDirection={todayAppointmentRevenue > 0 ? "up" : undefined}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box 
              onClick={() => vatSettings.enabled && setVatAdjustmentModalOpen(true)}
              sx={{ 
                cursor: vatSettings.enabled ? 'pointer' : 'default',
                '&:hover': vatSettings.enabled ? {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease'
                } : {}
              }}
            >
              <StatCard
                title={vatSettings.enabled ? 'VAT Adjustments (Click to Edit)' : 'Appointment Payments'}
                value={
                  vatSettings.enabled 
                    ? `EGP ${formatCurrency(Math.abs(finalVATCollected))}`
                    : appointmentLinkedPayments.length
                }
                icon={vatSettings.enabled ? <Percent /> : <Receipt />}
                color={vatSettings.enabled ? (finalVATCollected !== 0 ? "#F59E0B" : "#9CA3AF") : "#673AB7"}
                subtitle={
                  vatSettings.enabled 
                    ? finalVATCollected !== 0
                      ? `Manual VAT Adjustments: ${financialSummary.netVATAdjustments >= 0 ? '+' : ''}EGP ${formatCurrency(Math.abs(financialSummary.netVATAdjustments))} | ${financialSummary.vatAdjustmentDetails.length} adjustment(s)`
                      : `Rate: ${vatSettings.rate}% | Click to add manual VAT adjustments`
                    : `${appointmentLinkedPayments.length} linked to appointments`
                }
                trend={finalVATCollected !== 0 ? (finalVATCollected > 0 ? "+Manual" : "-Manual") : "0%"}
                trendDirection={finalVATCollected > 0 ? "up" : finalVATCollected < 0 ? "down" : undefined}
              />
            </Box>
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
                        placeholder={t('payment.search.placeholder')}
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
                      <Box sx={{ 
                        display: 'flex', 
                        gap: { xs: 1.5, md: 2 }, 
                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        <Button
                          variant="outlined"
                          startIcon={<FilterList />}
                          onClick={(e) => setFilterAnchor(e.currentTarget)}
                          sx={{
                            minHeight: 48,
                            px: { xs: 3, md: 3 },
                            py: { xs: 1.5, md: 1.5 },
                            fontSize: { xs: '0.875rem', md: '0.875rem' },
                            borderRadius: 2,
                            fontWeight: 600,
                            minWidth: { xs: 'auto', sm: 100 },
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden'
                          }}
                        >
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            {t('payment.actions.filter')}
                          </Box>
                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                            Filter
                          </Box>
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={() => setExportOptionsOpen(true)}
                          sx={{
                            minHeight: 48,
                            px: { xs: 3, md: 3 },
                            py: { xs: 1.5, md: 1.5 },
                            fontSize: { xs: '0.875rem', md: '0.875rem' },
                            borderRadius: 2,
                            fontWeight: 600,
                            minWidth: { xs: 'auto', sm: 100 },
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden'
                          }}
                        >
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            {t('payment.actions.export')}
                          </Box>
                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                            Export
                          </Box>
                        </Button>
                        <Button
                          variant={viewMode === 'table' ? 'contained' : 'outlined'}
                          onClick={() => setViewMode('table')}
                          sx={{
                            minHeight: 48,
                            px: { xs: 3, md: 3 },
                            py: { xs: 1.5, md: 1.5 },
                            fontSize: { xs: '0.875rem', md: '0.875rem' },
                            borderRadius: 2,
                            fontWeight: 600,
                            minWidth: { xs: 'auto', sm: 90 },
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden'
                          }}
                        >
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            {t('payment.view.table')}
                          </Box>
                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                            Table
                          </Box>
                        </Button>
                        <Button
                          variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                          onClick={() => setViewMode('cards')}
                          sx={{
                            minHeight: 48,
                            px: { xs: 3, md: 3 },
                            py: { xs: 1.5, md: 1.5 },
                            fontSize: { xs: '0.875rem', md: '0.875rem' },
                            borderRadius: 2,
                            fontWeight: 600,
                            minWidth: { xs: 'auto', sm: 90 },
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden'
                          }}
                        >
                          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                            {t('payment.view.cards')}
                          </Box>
                          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                            Cards
                          </Box>
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label={t('payment.tabs.all', { count: payments.length })} />
                    <Tab label={t('payment.tabs.paid', { count: payments.filter(p => p.status === 'paid').length })} />
                    <Tab label={t('payment.tabs.pending', { count: payments.filter(p => p.status === 'pending').length })} />
                    <Tab label={t('payment.tabs.overdue', { count: payments.filter(p => p.status === 'overdue').length })} />
                  </Tabs>
                </Box>

                {/* Payments Table */}
                {viewMode === 'table' && (
                  <TabPanel value={tabValue} index={0}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('payment.table.invoice')}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('payment.table.patient')}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('payment.table.amount')}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('payment.table.method')}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('payment.table.date')}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('payment.table.status')}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {t('payment.table.actions')}
                            </TableCell>
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
                                       mr: isRTL ? 0 : 1.5,
                                       ml: isRTL ? 1.5 : 0,
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
                                     {payment.currency} {formatCurrency(payment.amount)}
                                   </Typography>
                                   {payment.insurance === 'Yes' && (
                                     <Typography variant="caption" color="info.main">
                                       {t('payment.table.insurance')}: {payment.currency} {formatCurrency(payment.insuranceAmount)}
                                     </Typography>
                                   )}
                                 </Box>
                               </TableCell>
                               <TableCell>
                                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                   {getMethodIcon(payment.method)}
                                   <Typography variant="body2" sx={{ ml: isRTL ? 0 : 1, mr: isRTL ? 1 : 0 }}>
                                     {t(`payment.methods.${payment.method.toLowerCase().replace(' ', '_')}`)}
                                   </Typography>
                                 </Box>
                               </TableCell>
                               <TableCell>
                                 <Box>
                                   <Typography variant="body2">{formatDate(payment.date)}</Typography>
                                   <Typography variant="caption" color="text.secondary">
                                     {t('payment.table.due')}: {formatDate(payment.dueDate)}
                                   </Typography>
                                 </Box>
                               </TableCell>
                               <TableCell>
                                 <Tooltip title={t('payment.actions.clickToChangeStatus')}>
                                   <Chip
                                     icon={getStatusIcon(payment.status)}
                                     label={t(`payment.status.${payment.status}`)}
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
                                   <Tooltip title={t('payment.actions.viewInvoice')}>
                                     <IconButton 
                                       size="small" 
                                       color="primary"
                                       onClick={() => handleViewInvoice(payment)}
                                     >
                                       <Receipt fontSize="small" />
                                     </IconButton>
                                   </Tooltip>
                                   <Tooltip title={t('payment.actions.downloadPDF')}>
                                     <IconButton 
                                       size="small" 
                                       color="primary"
                                       onClick={() => handleDownloadInvoice(payment)}
                                     >
                                       <Download fontSize="small" />
                                     </IconButton>
                                   </Tooltip>
                                   <Tooltip title={t('payment.actions.sendReminder')}>
                                     <IconButton 
                                       size="small" 
                                       color="primary"
                                       onClick={() => handleSendReminder(payment)}
                                     >
                                       <Send fontSize="small" />
                                     </IconButton>
                                   </Tooltip>
                                   <Tooltip title={t('payment.actions.edit')}>
                                     <IconButton 
                                       size="small" 
                                       color="primary"
                                       onClick={() => handleEditPayment(payment)}
                                     >
                                       <Edit fontSize="small" />
                                     </IconButton>
                                   </Tooltip>
                                   <Tooltip title={t('payment.actions.delete')}>
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
                                 <Tooltip title={t('payment.actions.clickToChangeStatus')}>
                                   <Chip
                                     icon={getStatusIcon(payment.status)}
                                     label={t(`payment.status.${payment.status}`)}
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
                                     mr: isRTL ? 0 : 2,
                                     ml: isRTL ? 2 : 0,
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
                                     {t('payment.fields.amount')}
                                   </Typography>
                                   <Typography variant="h6" fontWeight={600} color="primary.main">
                                     {payment.currency} {formatCurrency(payment.amount)}
                                   </Typography>
                                 </Grid>
                                 <Grid item xs={6}>
                                   <Typography variant="body2" color="text.secondary">
                                     {t('payment.fields.dueDate')}
                                   </Typography>
                                   <Typography variant="body2" fontWeight={600}>
                                     {formatDate(payment.dueDate)}
                                   </Typography>
                                 </Grid>
                                 <Grid item xs={6}>
                                   <Typography variant="body2" color="text.secondary">
                                     {t('payment.fields.method')}
                                   </Typography>
                                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                     {getMethodIcon(payment.method)}
                                     <Typography variant="body2" sx={{ ml: isRTL ? 0 : 0.5, mr: isRTL ? 0.5 : 0 }}>
                                       {t(`payment.methods.${payment.method.toLowerCase().replace(' ', '_')}`)}
                                     </Typography>
                                   </Box>
                                 </Grid>
                                 <Grid item xs={6}>
                                   <Typography variant="body2" color="text.secondary">
                                     {t('payment.fields.insurance')}
                                   </Typography>
                                   <Typography variant="body2" fontWeight={600}>
                                     {payment.insurance === 'Yes' 
                                       ? `${payment.currency} ${formatCurrency(payment.insuranceAmount)}` 
                                       : t('payment.insurance.none')
                                     }
                                   </Typography>
                                 </Grid>
                               </Grid>

                               <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                 <Button 
                                   size="small" 
                                   startIcon={<Receipt />}
                                   onClick={() => handleViewInvoice(payment)}
                                 >
                                   {t('payment.actions.view')}
                                 </Button>
                                 <Button 
                                   size="small" 
                                   startIcon={<Download />}
                                   onClick={() => handleDownloadInvoice(payment)}
                                 >
                                   {t('payment.actions.download')}
                                 </Button>
                                 <Button 
                                   size="small" 
                                   startIcon={<Send />}
                                   onClick={() => handleSendReminder(payment)}
                                 >
                                   {t('payment.actions.send')}
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
                     <CreditCard sx={{ fontSize: 28, color: 'primary.main', mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }} />
                     <Typography variant="h6" sx={{ fontWeight: 700 }}>
                       {t('payment.analytics.paymentMethods')}
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
                               {t(`payment.methods.${method.toLowerCase().replace(' ', '_')}`)}
                             </Typography>
                           </Box>
                           <Typography variant="body2" fontWeight={600}>
                             EGP {formatCurrency(amount)}
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
                           {t('payment.analytics.transactions', { count })}
                         </Typography>
                       </Box>
                     );
                   })}
                 </CardContent>
               </Card>
             </Grid>
           </Grid>
         </Box>

         {/* Dialogs and Menus */}
         
         {/* Add Payment Dialog */}
         <Dialog
           open={addPaymentOpen}
           onClose={() => setAddPaymentOpen(false)}
           maxWidth="md"
           fullWidth
           PaperProps={{
             sx: { direction: isRTL ? 'rtl' : 'ltr' }
           }}
         >
           <DialogTitle>{t('payment.dialogs.createNewInvoice')}</DialogTitle>
           <DialogContent>
             {/* Appointment Selection Section */}
             <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
               <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                 <CalendarToday fontSize="small" />
                 Select Date to View Appointments
               </Typography>
               <Grid container spacing={2} alignItems="center">
                 <Grid item xs={12} md={6}>
                   <TextField
                     fullWidth
                     label="Appointment Date"
                     type="date"
                     value={selectedDate}
                     onChange={(e) => setSelectedDate(e.target.value)}
                     InputLabelProps={{ shrink: true }}
                     size="small"
                   />
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Button
                     variant="outlined"
                     startIcon={<People />}
                     onClick={() => setShowAppointmentSelection(!showAppointmentSelection)}
                     disabled={getCompletedAppointmentsByDate(selectedDate).length === 0}
                     size="small"
                     sx={{ 
                       height: 40,
                       fontSize: '0.875rem',
                       whiteSpace: 'nowrap'
                     }}
                   >
                     View Appointments ({getCompletedAppointmentsByDate(selectedDate).length})
                   </Button>
                 </Grid>
               </Grid>
               
               {/* Appointment List */}
               {showAppointmentSelection && (
                 <Box sx={{ mt: 2 }}>
                   <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                     🏥 Completed appointments for {formatDate(selectedDate)}:
                   </Typography>
                   {getCompletedAppointmentsByDate(selectedDate).length > 0 ? (
                     <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                       {getCompletedAppointmentsByDate(selectedDate).map((apt, index) => (
                         <Paper
                           key={apt.id || index}
                           sx={{
                             p: 2,
                             mb: 1,
                             cursor: 'pointer',
                             border: '1px solid',
                             borderColor: 'divider',
                             '&:hover': {
                               borderColor: 'primary.main',
                               backgroundColor: 'primary.light'
                             }
                           }}
                           onClick={() => handleAppointmentSelection(apt)}
                         >
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Box>
                               <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                 👤 {apt.patient} • 🩺 Dr. {apt.doctor}
                               </Typography>
                               <Typography variant="caption" color="text.secondary">
                                 ⏰ {apt.time} • 📋 {apt.type} • 📍 {apt.location}
                               </Typography>
                             </Box>
                             <Chip
                               label="Select"
                               size="small"
                               color="primary"
                               variant="outlined"
                             />
                           </Box>
                         </Paper>
                       ))}
                     </Box>
                   ) : (
                     <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                       No completed appointments found for this date
                     </Typography>
                   )}
                 </Box>
               )}
             </Box>

             <Grid container spacing={2} sx={{ mt: 1 }}>
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   name="patient"
                   label={t('payment.fields.patientName')}
                   required
                   value={newInvoiceData.patient}
                   onChange={(e) => setNewInvoiceData(prev => ({ ...prev, patient: e.target.value }))}
                   placeholder={t('payment.placeholders.patientName')}
                 />
               </Grid>
               <Grid item xs={12} md={6}>
                 <FormControl fullWidth required>
                   <InputLabel>Doctor</InputLabel>
                   <Select 
                     name="doctor" 
                     label="Doctor"
                     value={newInvoiceData.doctor}
                     onChange={(e) => setNewInvoiceData(prev => ({ ...prev, doctor: e.target.value }))}
                   >
                     {availableDoctors.map((doctor) => (
                       <MenuItem key={doctor.id} value={doctor.name}>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <LocalHospital sx={{ fontSize: 18, color: 'primary.main' }} />
                           <Box>
                             <Typography variant="body2" sx={{ fontWeight: 600 }}>
                               Dr. {doctor.name}
                             </Typography>
                             <Typography variant="caption" color="text.secondary">
                               {doctor.specialty}
                             </Typography>
                           </Box>
                         </Box>
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   name="amount"
                   label={t('payment.fields.amount')}
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
                 <TextField
                   fullWidth
                   name="invoiceDate"
                   label={t('payment.fields.invoiceDate')}
                   type="date"
                   required
                   value={newInvoiceData.invoiceDate}
                   onChange={(e) => setNewInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                   InputLabelProps={{ shrink: true }}
                   inputProps={{ 
                     max: new Date().toISOString().split('T')[0]
                   }}
                   helperText={t('payment.helpers.serviceDate')}
                 />
               </Grid>
               <Grid item xs={12} md={6}>
                 <FormControl fullWidth required>
                   <InputLabel>{t('payment.fields.serviceCategory')}</InputLabel>
                   <Select 
                     name="category" 
                     label={t('payment.fields.serviceCategory')}
                     value={newInvoiceData.category}
                     onChange={(e) => setNewInvoiceData(prev => ({ ...prev, category: e.target.value }))}
                   >
                     <MenuItem value="consultation">{t('payment.categories.consultation')}</MenuItem>
                     <MenuItem value="checkup">{t('payment.categories.checkup')}</MenuItem>
                     <MenuItem value="surgery">{t('payment.categories.surgery')}</MenuItem>
                     <MenuItem value="emergency">{t('payment.categories.emergency')}</MenuItem>
                     <MenuItem value="followup">{t('payment.categories.followup')}</MenuItem>
                     <MenuItem value="procedure">{t('payment.categories.procedure')}</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   name="dueDate"
                   label={t('payment.fields.dueDate')}
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
                   label={t('payment.fields.description')}
                   multiline
                   rows={3}
                   required
                   value={newInvoiceData.description}
                   onChange={(e) => setNewInvoiceData(prev => ({ ...prev, description: e.target.value }))}
                   placeholder={t('payment.placeholders.description')}
                 />
               </Grid>
               <Grid item xs={12} md={6}>
                 <FormControl fullWidth required>
                   <InputLabel>{t('payment.fields.paymentMethod')}</InputLabel>
                   <Select 
                     name="method" 
                     label={t('payment.fields.paymentMethod')}
                     value={newInvoiceData.method}
                     onChange={(e) => setNewInvoiceData(prev => ({ ...prev, method: e.target.value }))}
                   >
                     <MenuItem value="Cash">{t('payment.methods.cash')}</MenuItem>
                     <MenuItem value="Credit Card">{t('payment.methods.credit_card')}</MenuItem>
                     <MenuItem value="Bank Transfer">{t('payment.methods.bank_transfer')}</MenuItem>
                     <MenuItem value="Insurance">{t('payment.methods.insurance')}</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} md={6}>
                 <TextField
                   fullWidth
                   name="insuranceAmount"
                   label={t('payment.fields.insuranceCoverage')}
                   type="number"
                   value={newInvoiceData.insuranceAmount}
                   onChange={(e) => setNewInvoiceData(prev => ({ ...prev, insuranceAmount: e.target.value }))}
                   InputProps={{
                     startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                   }}
                   inputProps={{ min: 0, step: 0.01 }}
                   placeholder="0"
                   helperText={t('payment.helpers.insuranceCoverage')}
                 />
               </Grid>

               {/* VAT Section */}
               {vatSettings.enabled && (
                 <>
                   <Grid item xs={12}>
                     <Divider sx={{ my: 2 }}>
                       <Chip label="VAT Settings" icon={<Percent />} />
                     </Divider>
                   </Grid>
                   
                   <Grid item xs={12} md={6}>
                     <FormControlLabel
                       control={
                         <Switch
                           checked={newInvoiceData.includeVAT}
                           onChange={(e) => setNewInvoiceData(prev => ({ ...prev, includeVAT: e.target.checked }))}
                           color="primary"
                         />
                       }
                       label={
                         <Box>
                           <Typography variant="body2" sx={{ fontWeight: 600 }}>
                             Include VAT
                           </Typography>
                           <Typography variant="caption" color="text.secondary">
                             Add VAT to the invoice amount
                           </Typography>
                         </Box>
                       }
                     />
                   </Grid>

                   <Grid item xs={12} md={6}>
                     <TextField
                       fullWidth
                       name="vatRate"
                       label="VAT Rate"
                       type="number"
                       value={newInvoiceData.vatRate}
                       onChange={(e) => setNewInvoiceData(prev => ({ ...prev, vatRate: parseFloat(e.target.value) || 0 }))}
                       InputProps={{
                         endAdornment: <InputAdornment position="end">%</InputAdornment>,
                       }}
                       inputProps={{ min: 0, max: 100, step: 0.1 }}
                       disabled={!newInvoiceData.includeVAT}
                       helperText={newInvoiceData.includeVAT ? "Current VAT rate" : "Enable VAT to set rate"}
                     />
                   </Grid>

                   {/* VAT Calculation Preview */}
                   {currentVATCalculation && newInvoiceData.includeVAT && (
                     <Grid item xs={12}>
                       <Box sx={{ 
                         p: 2, 
                         bgcolor: 'primary.light', 
                         borderRadius: 2,
                         border: '1px solid',
                         borderColor: 'primary.main'
                       }}>
                         <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                           📊 VAT Calculation Preview
                         </Typography>
                         <Grid container spacing={1}>
                           <Grid item xs={12} sm={4}>
                             <Typography variant="body2">
                               💰 Base Amount: <strong>EGP {currentVATCalculation.baseAmount.toFixed(2)}</strong>
                             </Typography>
                           </Grid>
                           <Grid item xs={12} sm={4}>
                             <Typography variant="body2">
                               📈 VAT ({currentVATCalculation.vatRate}%): <strong>EGP {currentVATCalculation.vatAmount.toFixed(2)}</strong>
                             </Typography>
                           </Grid>
                           <Grid item xs={12} sm={4}>
                             <Typography variant="body2" sx={{ fontWeight: 600 }}>
                               💳 Total with VAT: <strong>EGP {currentVATCalculation.totalAmountWithVAT.toFixed(2)}</strong>
                             </Typography>
                           </Grid>
                         </Grid>
                       </Box>
                     </Grid>
                   )}
                 </>
               )}
             </Grid>
           </DialogContent>
           <DialogActions>
             <Button onClick={() => setAddPaymentOpen(false)}>
               {t('common.cancel')}
             </Button>
             <Button 
               variant="contained" 
               onClick={handleCreatePayment}
             >
               {t('payment.actions.createInvoice')}
             </Button>
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
               backgroundColor: '#f5f5f5',
               direction: isRTL ? 'rtl' : 'ltr'
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
               {t('payment.dialogs.invoicePreview')}
             </Typography>
             <Box sx={{ display: 'flex', gap: 1 }}>
               <Button
                 variant="outlined"
                 startIcon={<Share />}
                 onClick={() => selectedInvoiceForView && window.navigator.share && window.navigator.share({
                   title: `${t('invoice.title')} ${selectedInvoiceForView.invoiceId}`,
                   text: `${t('invoice.title')} ${t('common.for')} ${selectedInvoiceForView.patient}`,
                   url: window.location.href
                 })}
               >
                 {t('payment.actions.share')}
               </Button>
               <Button
                 variant="contained"
                 startIcon={<Download />}
                 onClick={() => selectedInvoiceForView && handleDownloadInvoice(selectedInvoiceForView)}
               >
                 {t('payment.actions.download')}
               </Button>
             </Box>
           </DialogTitle>
           <DialogContent sx={{ p: 3 }}>
             {selectedInvoiceForView && (
               <InvoiceGenerator
                 invoiceData={selectedInvoiceForView}
                 onDownload={() => handleDownloadInvoice(selectedInvoiceForView)}
                 onPrint={() => handlePrintInvoice(selectedInvoiceForView)}
                 onShare={() => window.navigator.share && window.navigator.share({
                   title: `${t('invoice.title')} ${selectedInvoiceForView.invoiceId}`,
                   text: `${t('invoice.title')} ${t('common.for')} ${selectedInvoiceForView.patient}`,
                   url: window.location.href
                 })}
               />
             )}
           </DialogContent>
           <DialogActions>
             <Button onClick={() => setInvoiceDialogOpen(false)}>
               {t('common.close')}
             </Button>
           </DialogActions>
         </Dialog>

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
               direction: isRTL ? 'rtl' : 'ltr'
             }
           }}
         >
           <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
             <Typography variant="subtitle2" fontWeight={600}>
               {t('payment.filters.title')}
             </Typography>
             <Typography variant="caption" color="text.secondary">
               {t('payment.filters.subtitle')}
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
               <Typography variant="body2" fontWeight={600}>
                 {t('payment.filters.allPayments')}
               </Typography>
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
               <Typography variant="body2" fontWeight={600}>
                 {t('payment.filters.thisMonth')}
               </Typography>
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
               <Typography variant="body2" fontWeight={600}>
                 {t('payment.filters.lastMonth')}
               </Typography>
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
               <Typography variant="body2" fontWeight={600}>
                 {t('payment.filters.paidOnly')}
               </Typography>
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
               <Typography variant="body2" fontWeight={600}>
                 {t('payment.filters.pendingOnly')}
               </Typography>
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
               <Typography variant="body2" fontWeight={600}>
                 {t('payment.filters.overdueOnly')}
               </Typography>
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
               <Typography variant="body2" fontWeight={600}>
                 {t('payment.filters.withInsurance')}
               </Typography>
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
               direction: isRTL ? 'rtl' : 'ltr'
             }
           }}
         >
           <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
             <Typography variant="subtitle2" fontWeight={600}>
               {t('payment.statusMenu.title')}
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
                 <Typography variant="body2" fontWeight={600}>
                   {t('payment.status.pending')}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">
                   {t('payment.statusMenu.pendingDesc')}
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
                 <Typography variant="body2" fontWeight={600}>
                   {t('payment.status.paid')}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">
                   {t('payment.statusMenu.paidDesc')}
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
                 <Typography variant="body2" fontWeight={600}>
                   {t('payment.status.overdue')}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">
                   {t('payment.statusMenu.overdueDesc')}
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
                 <Typography variant="body2" fontWeight={600}>
                   {t('payment.status.partial')}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">
                   {t('payment.statusMenu.partialDesc')}
                 </Typography>
               </Box>
             </Box>
           </MenuItem>
         </Menu>

         {/* Snackbar for notifications */}
         <Snackbar
           open={snackbar.open}
           autoHideDuration={4000}
           onClose={handleCloseSnackbar}
           anchorOrigin={{ vertical: 'bottom', horizontal: isRTL ? 'left' : 'right' }}
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

         {/* VAT Adjustment Modal */}
         <VATAdjustmentModal
           open={vatAdjustmentModalOpen}
           onClose={() => setVatAdjustmentModalOpen(false)}
           currentRevenue={baseRevenue}
           currentVATCollected={0}
           onSave={handleVATAdjustmentSave}
         />

         {/* Expense Management Modal */}
         <ExpenseManagementModal
           open={expenseManagementModalOpen}
           onClose={() => setExpenseManagementModalOpen(false)}
           totalRevenue={baseRevenue}
           automaticVATFromPayments={automaticVATFromPayments}
         />

         {/* Edit Payment Amount Modal */}
         <Dialog
           open={editPaymentModalOpen}
           onClose={() => setEditPaymentModalOpen(false)}
           maxWidth="sm"
           fullWidth
         >
           <DialogTitle>
             <Typography variant="h6" sx={{ fontWeight: 600 }}>
               💰 Edit Payment Amount
             </Typography>
             {selectedPaymentForEdit && (
               <Typography variant="body2" color="text.secondary">
                 {selectedPaymentForEdit.invoiceId} • {selectedPaymentForEdit.patient}
               </Typography>
             )}
           </DialogTitle>
           <DialogContent>
             <Box sx={{ pt: 2 }}>
               <Grid container spacing={3}>
                 <Grid item xs={12}>
                   <TextField
                     fullWidth
                     label="Payment Amount"
                     type="number"
                     value={editPaymentForm.amount}
                     onChange={(e) => setEditPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                     InputProps={{
                       startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                     }}
                     inputProps={{ min: 0, step: 0.01 }}
                     helperText="Base amount (before VAT)"
                   />
                 </Grid>
                 <Grid item xs={12}>
                   <TextField
                     fullWidth
                     label="Paid Amount"
                     type="number"
                     value={editPaymentForm.paidAmount}
                     onChange={(e) => setEditPaymentForm(prev => ({ ...prev, paidAmount: e.target.value }))}
                     InputProps={{
                       startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                     }}
                     inputProps={{ min: 0, step: 0.01 }}
                     helperText="Amount already paid by patient"
                   />
                 </Grid>
                 {selectedPaymentForEdit && (
                   <Grid item xs={12}>
                     <Box sx={{ 
                       p: 2, 
                       bgcolor: 'grey.50', 
                       borderRadius: 2,
                       border: '1px solid',
                       borderColor: 'grey.200'
                     }}>
                       <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                         💳 Current Payment Info
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         Current Total: EGP {formatCurrency(selectedPaymentForEdit.amount)}<br/>
                         Current Paid: EGP {formatCurrency(selectedPaymentForEdit.paidAmount || 0)}<br/>
                         Current Status: {selectedPaymentForEdit.status}
                       </Typography>
                     </Box>
                   </Grid>
                 )}
               </Grid>
             </Box>
           </DialogContent>
           <DialogActions>
             <Button onClick={() => setEditPaymentModalOpen(false)}>
               Cancel
             </Button>
             <Button 
               variant="contained" 
               onClick={handleSavePaymentEdit}
               sx={{ fontWeight: 600 }}
             >
               💾 Save Changes
             </Button>
           </DialogActions>
         </Dialog>

         {/* Process Appointments Button */}
         <Tooltip title="Process All Appointments to Create Payments" placement="left">
           <Button
             variant="contained"
             onClick={() => {
               const created = processAllAppointmentsForPayments(appointments);
               
               // Reload payments
               setTimeout(() => {
                 const updatedPayments = loadPaymentsFromPaymentUtils();
                 setPayments(updatedPayments);
                 
                 setSnackbar({
                   open: true,
                   message: `🔄 Processed ${appointments.length} appointments, ${created.length} payments created/updated!`,
                   severity: 'success'
                 });
               }, 100);
             }}
             sx={{
               position: 'fixed',
               bottom: 100,
               right: 24,
               borderRadius: '50%',
               width: 64,
               height: 64,
               minWidth: 64,
               background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
               color: 'white',
               boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)',
               zIndex: 1000,
               '&:hover': {
                 background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                 transform: 'scale(1.1)',
                 boxShadow: '0 12px 48px rgba(76, 175, 80, 0.6)',
               },
               transition: 'all 0.3s ease',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}
           >
             📋
           </Button>
         </Tooltip>

         {/* Test Notification Button */}
         <Tooltip title="Test Payment Notification System" placement="left">
           <Button
             variant="contained"
             onClick={() => testPaymentNotificationSystem()}
             sx={{
               position: 'fixed',
               bottom: 24,
               right: 24,
               borderRadius: '50%',
               width: 64,
               height: 64,
               minWidth: 64,
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
               color: 'white',
               boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
               zIndex: 1000,
               '&:hover': {
                 background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
                 transform: 'scale(1.1)',
                 boxShadow: '0 12px 48px rgba(102, 126, 234, 0.6)',
               },
               transition: 'all 0.3s ease',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
             }}
           >
             💰
           </Button>
         </Tooltip>
       </Container>
 );
};

export default PaymentListPage;