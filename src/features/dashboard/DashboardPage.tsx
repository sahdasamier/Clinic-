import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  People,
  CalendarToday,
  CheckCircle,
  LocalHospital,
  Analytics,
  MedicalServices,
  Timeline,
  Assignment,
  Groups,
  ShowChart,
  Refresh,
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  Tooltip as RechartsTooltip,
} from 'recharts';

import { useTranslation } from 'react-i18next';

// DIRECT IMPORTS from actual pages
import { 
  loadAppointmentsFromStorage
} from '../appointments/AppointmentListPage';
import { loadPatientsFromStorage } from '../patients/PatientListPage';
import { doctorSchedules } from '../DoctorScheduling';
import { loadPaymentsFromStorage } from '../payments/PaymentListPage';
import { getDefaultAppointments } from '../../data/mockData';
import { 
  organizeAppointmentsByCompletion,
  getPatientsOrganizedByAppointmentStatus,
  setupAppointmentPatientSync 
} from '../../utils/appointmentPatientSync';

// Professional Color Palette
const colorPalette = {
  primary: '#1976d2',
  secondary: '#2196f3',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#00bcd4',
  purple: '#9c27b0',
  indigo: '#3f51b5',
  teal: '#009688',
  pink: '#e91e63',
  gradient: {
    blue: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
    green: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
    orange: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
    purple: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
    teal: 'linear-gradient(135deg, #009688 0%, #4db6ac 100%)',
  }
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  change?: string;
  trend?: 'up' | 'down';
  subtitle?: string;
}> = ({ title, value, icon, gradient, change, trend, subtitle }) => (
  <Card sx={{ 
    height: '100%', 
    position: 'relative', 
    overflow: 'hidden',
    background: gradient,
    color: 'white',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
    }
  }}>
    <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            backdropFilter: 'blur(10px)',
          }}
        >
          {icon}
        </Box>
        {change && (
          <Chip
            size="small"
            label={change}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 700,
              backdropFilter: 'blur(10px)',
            }}
          />
        )}
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: 'white' }}>
        {value}
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
    {/* Decorative Elements */}
    <Box sx={{
      position: 'absolute',
      top: -20,
      right: -20,
      width: 80,
      height: 80,
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.1)',
      zIndex: 1,
    }} />
    <Box sx={{
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 100,
      height: 100,
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.05)',
      zIndex: 1,
    }} />
  </Card>
);

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Load real data directly from the pages
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const doctors = doctorSchedules;

  // Load all data directly from the pages and setup sync
  useEffect(() => {
    const loadedAppointments = loadAppointmentsFromStorage();
    setAppointments(loadedAppointments.length > 0 ? loadedAppointments : getDefaultAppointments());
    
    const loadedPatients = loadPatientsFromStorage();
    setPatients(loadedPatients);
    
    const loadedPayments = loadPaymentsFromStorage();
    setPayments(loadedPayments);
    
    // Setup appointment-patient sync on dashboard load
    setupAppointmentPatientSync();

    // Listen for user data clearing
    const handleUserDataCleared = () => {
      // Reset dashboard data
      setAppointments(getDefaultAppointments());
      setPatients([]);
      setPayments([]);
      setRefreshKey(prev => prev + 1);
      console.log('✅ Dashboard reset to default state');
    };

    window.addEventListener('userDataCleared', handleUserDataCleared);
    
    return () => {
      window.removeEventListener('userDataCleared', handleUserDataCleared);
    };
  }, [refreshKey]);

  // Refresh function
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    const loadedAppointments = loadAppointmentsFromStorage();
    setAppointments(loadedAppointments.length > 0 ? loadedAppointments : getDefaultAppointments());
    
    const loadedPatients = loadPatientsFromStorage();
    setPatients(loadedPatients);
    
    const loadedPayments = loadPaymentsFromStorage();
    setPayments(loadedPayments);
  };

  // Calculate statistics from real data
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Working doctors today
    const workingDoctors = doctors.filter(doctor => 
      !doctor.offDays.includes(daysOfWeek[new Date().getDay()])
    );
    
    // Appointment statistics
    const todayAppointments = appointments.filter(apt => apt.date === today);
    const completedAppointments = appointments.filter(apt => 
      apt.status === 'completed' || apt.completed === true
    );
    const pendingAppointments = appointments.filter(apt => 
      apt.status === 'pending' || (apt.status === 'confirmed' && !apt.completed)
    );
    const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no-show');
    
    // Revenue calculation from real payment data (EGP)
    const paidPayments = payments.filter(p => p.status === 'paid');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const overduePayments = payments.filter(p => p.status === 'overdue');
    const partialPayments = payments.filter(p => p.status === 'partial');
    
    const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPendingRevenue = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOverdueRevenue = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPartialRevenue = partialPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Debug logging for revenue analytics
    console.log('💰 Revenue Analytics Debug:', {
      allPayments: payments.length,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
      partialCount: partialPayments.length,
      totalRevenue: `EGP ${totalRevenue}`,
      totalPendingRevenue: `EGP ${totalPendingRevenue}`,
      totalOverdueRevenue: `EGP ${totalOverdueRevenue}`,
      totalPartialRevenue: `EGP ${totalPartialRevenue}`,
      paymentDetails: payments.map(p => ({ 
        patient: p.patient, 
        amount: `EGP ${p.amount}`, 
        status: p.status, 
        currency: p.currency 
      }))
    });

    // Patient statistics
    const uniquePatients = new Set(appointments.map(apt => apt.patient)).size;
    const newPatients = patients.filter(patient => patient.status === 'new').length;
    
    // Time statistics
    const avgConsultationTime = appointments.length > 0 
      ? Math.round(appointments.reduce((sum, apt) => sum + (apt.duration || 30), 0) / appointments.length)
      : 30;

    // Weekly data for charts
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(apt => apt.date === dateStr);
      
      last7Days.push({
        name: date.toLocaleDateString('en', { weekday: 'short' }),
        date: dateStr,
        appointments: dayAppointments.length,
        completed: dayAppointments.filter(apt => apt.status === 'completed' || apt.completed).length,
        pending: dayAppointments.filter(apt => apt.status === 'pending').length,
        cancelled: dayAppointments.filter(apt => apt.status === 'cancelled' || apt.status === 'no-show').length,
      });
    }

    // Specialty distribution - Fixed matching logic
    const specialtyStats = doctors.reduce((acc, doctor) => {
      // Match exact doctor names from appointments with doctor scheduling
      const doctorAppointments = appointments.filter(apt => 
        apt.doctor === doctor.name || // Exact match: 'Dr. Sarah Ahmed' === 'Dr. Sarah Ahmed'
        apt.doctor?.includes(doctor.name.replace('Dr. ', '')) || // Partial match for backwards compatibility
        apt.type === doctor.specialty // Match by specialty type
      );
      acc[doctor.specialty] = doctorAppointments.length;
      return acc;
    }, {} as Record<string, number>);

    console.log('🔍 Department Status Debug:', {
      doctors: doctors.map(d => ({ name: d.name, specialty: d.specialty })),
      appointments: appointments.map(a => ({ doctor: a.doctor, type: a.type })),
      specialtyStats
    });

    // Doctor performance - Fixed matching logic
    const doctorPerformance = doctors.map(doctor => {
      const doctorAppointments = appointments.filter(apt => 
        apt.doctor === doctor.name || // Exact match: 'Dr. Sarah Ahmed' === 'Dr. Sarah Ahmed'
        apt.doctor?.includes(doctor.name.replace('Dr. ', '')) // Partial match for backwards compatibility
      );
      const completed = doctorAppointments.filter(apt => apt.status === 'completed' || apt.completed).length;
      const total = doctorAppointments.length;
      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: doctor.id,
        name: doctor.name,
        avatar: doctor.avatar,
        specialty: doctor.specialty,
        appointments: total,
        completed,
        efficiency,
        workingHours: doctor.workingHours || { start: '09:00', end: '17:00' },
        offDays: doctor.offDays || [],
      };
    });

    return {
      // Basic counts
      workingDoctors: workingDoctors.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      
      // Appointment status
      completedAppointments: completedAppointments.length,
      pendingAppointments: pendingAppointments.length,
      confirmedAppointments: confirmedAppointments.length,
      cancelledAppointments: cancelledAppointments.length,
      
      // Financial (EGP from PaymentListPage)
      totalRevenue,
      totalPendingRevenue,
      totalOverdueRevenue,
      totalPartialRevenue,
      avgRevenuePerPayment: paidPayments.length > 0 ? Math.round(totalRevenue / paidPayments.length) : 0,
      totalPayments: payments.length,
      paidPayments: paidPayments.length,
      pendingPayments: pendingPayments.length,
      overduePayments: overduePayments.length,
      partialPayments: partialPayments.length,
      
      // Patients
      totalPatients: patients.length,
      uniquePatients,
      newPatients,
      
      // Time metrics
      avgConsultationTime,
      clinicUtilization: Math.round((appointments.length / (doctors.length * 8)) * 100),
      
      // Chart data
      weeklyData: last7Days,
      specialtyStats,
      doctorPerformance,
      
      // Status distribution for pie chart
      statusDistribution: [
            { name: t('completed'), value: completedAppointments.length, color: '#4caf50' },
    { name: t('confirmed'), value: confirmedAppointments.length, color: '#2196f3' },
    { name: t('pending'), value: pendingAppointments.length, color: '#ff9800' },
    { name: t('cancelled'), value: cancelledAppointments.length, color: '#f44336' },
      ].filter(item => item.value > 0),
    };
  }, [appointments, patients, doctors, refreshKey]);

  // Prepare specialty data for charts
  const specialtyData = Object.entries(stats.specialtyStats).map(([specialty, count], index) => ({
    name: specialty,
    value: count,
    color: [colorPalette.primary, colorPalette.success, colorPalette.warning, colorPalette.purple][index % 4],
  }));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Welcome Section */}
          <Box sx={{ 
            mb: 4, 
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    {t('clinical_dashboard')} 🏥
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    {t('real_time_data_description')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Tooltip title={t('refresh_data')}>
                    <IconButton 
                      onClick={refreshData}
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
               
                </Box>
              </Box>
            </Box>
            {/* Decorative background */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 1,
            }} />
          </Box>

          {/* Enhanced Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title={t('working_doctors_today')}
                value={`${stats.workingDoctors}/${stats.totalDoctors}`}
                icon={<LocalHospital sx={{ fontSize: 32 }} />}
                gradient={colorPalette.gradient.blue}
                change={stats.workingDoctors > 0 ? `${stats.workingDoctors} ${t('active')}` : t('none_today')}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title={t('total_appointments')}
                value={stats.totalAppointments}
                icon={<CalendarToday sx={{ fontSize: 32 }} />}
                gradient={colorPalette.gradient.green}
                change={stats.todayAppointments > 0 ? `${stats.todayAppointments} ${t('today')}` : t('none_today')}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title={t('completion_rate')}
                value={stats.totalAppointments > 0 ? `${Math.round((stats.completedAppointments / stats.totalAppointments) * 100)}%` : '0%'}
                icon={<CheckCircle sx={{ fontSize: 32 }} />}
                gradient={colorPalette.gradient.orange}
                change={`${stats.completedAppointments} ${t('completed')}`}
                subtitle={`${stats.pendingAppointments} ${t('pending_completion')}`}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard
                title={t('total_patients')}
                value={stats.totalPatients}
                icon={<Groups sx={{ fontSize: 32 }} />}
                gradient={colorPalette.gradient.purple}
                change={`${stats.newPatients} ${t('new_patients')}`}
              />
            </Grid>
          </Grid>
          

          {/* Key Performance Indicators */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Analytics sx={{ fontSize: 28, color: colorPalette.primary, mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t('revenue_analytics_egp')}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: colorPalette.success }}>
                    EGP {stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('total_paid_revenue')} ({stats.paidPayments} {t('invoices')})
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{t('avg_per_payment')}:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    EGP {stats.avgRevenuePerPayment}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{t('pending')} ({stats.pendingPayments}):</Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    EGP {stats.totalPendingRevenue.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{t('overdue')} ({stats.overduePayments}):</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    EGP {stats.totalOverdueRevenue.toLocaleString()}
                  </Typography>
                </Box>
                {stats.partialPayments > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t('partial')} ({stats.partialPayments}):</Typography>
                    <Typography variant="body2" fontWeight={600} color="info.main">
                      EGP {stats.totalPartialRevenue.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={700}>{t('total_expected')}:</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    EGP {(stats.totalRevenue + stats.totalPendingRevenue + stats.totalOverdueRevenue + stats.totalPartialRevenue).toLocaleString()}
                  </Typography>
                </Box>

              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Timeline sx={{ fontSize: 28, color: colorPalette.info, mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t('efficiency_metrics')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t('average_consultation')}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats.avgConsultationTime} {t('min')}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(stats.avgConsultationTime / 60) * 100} 
                    sx={{ height: 8, borderRadius: 4, backgroundColor: '#e0e0e0' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t('clinic_utilization')}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats.clinicUtilization}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.clinicUtilization} 
                    sx={{ height: 8, borderRadius: 4, backgroundColor: '#e0e0e0' }}
                  />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <MedicalServices sx={{ fontSize: 28, color: colorPalette.success, mr: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t('department_status')}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  {t('doctor_specialties_description')}
                </Typography>
                {specialtyData.length > 0 && specialtyData.some(s => s.value > 0) ? (
                  specialtyData.filter(s => s.value > 0).map((specialty, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{t(specialty.name)}</Typography>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {specialty.value} {t('appointments')}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(specialty.value / Math.max(...specialtyData.filter(s => s.value > 0).map(s => s.value))) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: specialty.color,
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>
                  ))
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {t('no_appointments_found')}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                      {t('check_appointment_doctors')}
                    </Typography>
                  </Alert>
                )}
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Weekly Appointments Trend */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChart sx={{ color: colorPalette.primary }} />
                    {t('weekly_appointment_trends')}
                  </Typography>
                  <Alert severity="info">
                    {t('last_7_days_real_data')}
                  </Alert>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.weeklyData}>
                      <defs>
                        <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colorPalette.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colorPalette.primary} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="appointments" 
                        stroke={colorPalette.primary} 
                        fillOpacity={1} 
                        fill="url(#appointmentGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {/* Appointment Status Distribution */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment sx={{ color: colorPalette.warning }} />
                  {t('status_distribution')}
                </Typography>
                <Box sx={{ height: 200, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box>
                  {stats.statusDistribution.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: item.color,
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.value} ({stats.totalAppointments > 0 ? Math.round((item.value / stats.totalAppointments) * 100) : 0}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Doctor Performance Table */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, pb: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People sx={{ color: colorPalette.success }} />
                      {t('doctor_performance_analytics')}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 700, py: 2 }}>{t('doctor')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('specialty')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('total_appointments')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('completed')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('efficiency_rate')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('performance')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.doctorPerformance.map((doctor, index) => (
                          <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    backgroundColor: colorPalette.primary,
                                    fontWeight: 700,
                                  }}
                                >
                                  {doctor.avatar}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={700}>
                                    {doctor.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {doctor.workingHours.start} - {doctor.workingHours.end}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={t(doctor.specialty)} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: `${colorPalette.info}15`,
                                  color: colorPalette.info,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {doctor.appointments}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color="success.main">
                                {doctor.completed}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {doctor.efficiency}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={doctor.efficiency}
                                  sx={{
                                    width: 80,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: '#e0e0e0',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: doctor.efficiency >= 80 ? colorPalette.success :
                                                     doctor.efficiency >= 60 ? colorPalette.warning :
                                                     colorPalette.error,
                                    }
                                  }}
                                />
                                <Chip 
                                  label={doctor.efficiency >= 80 ? t('excellent') : 
                                        doctor.efficiency >= 60 ? t('good') : 
                                        doctor.appointments === 0 ? t('no_data') : t('needs_attention')} 
                                  size="small"
                                  color={doctor.efficiency >= 80 ? 'success' : 
                                        doctor.efficiency >= 60 ? 'warning' : 
                                        doctor.appointments === 0 ? 'default' : 'error'}
                                  variant="outlined"
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
  );
};

export default DashboardPage; 