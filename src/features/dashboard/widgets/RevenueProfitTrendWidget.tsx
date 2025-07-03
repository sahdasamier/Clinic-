import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  CompareArrows,
  ShowChart,
  Refresh,
  Analytics,
} from '@mui/icons-material';

// Time period options
const TIME_PERIODS = [
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last3months', label: 'Last 3 Months' },
  { value: 'last6months', label: 'Last 6 Months' },
  { value: 'last12months', label: 'Last 12 Months' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'thisYear', label: 'This Year' },
];

// Chart type options
const CHART_TYPES = [
  { value: 'line', label: '📈 Line Chart' },
  { value: 'area', label: '📊 Area Chart' },
];

interface PaymentData {
  id: number;
  patient: string;
  doctor: string;
  amount: number;
  currency: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  method: string;
  description: string;
}

interface RevenueProfitTrendWidgetProps {
  payments: PaymentData[];
  colorPalette: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  refreshKey?: number;
}

interface TrendDataPoint {
  period: string;
  revenue: number;
  profit: number;
  revenueChange: number;
  profitChange: number;
  revenueChangePercent: number;
  profitChangePercent: number;
  paidCount: number;
}

const RevenueProfitTrendWidget: React.FC<RevenueProfitTrendWidgetProps> = ({
  payments,
  colorPalette,
  refreshKey = 0
}) => {
  const { t } = useTranslation();

  // Component state
  const [timePeriod, setTimePeriod] = useState('last30days');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [chartType, setChartType] = useState('line');
  const [metricView, setMetricView] = useState<'revenue' | 'profit' | 'both'>('both');
  const [debugMode, setDebugMode] = useState(false);

  // Auto-enable debug mode if no payments are available
  React.useEffect(() => {
    const paidPayments = payments.filter(p => p.status === 'paid');
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    
    console.log('🔧 RevenueProfitTrendWidget - Complete Payment Analysis:', {
      totalPayments: payments.length,
      paidPayments: paidPayments.length,
      totalAmount: totalAmount,
      paidAmount: paidAmount,
      paymentsByStatus: {
        paid: payments.filter(p => p.status === 'paid').length,
        pending: payments.filter(p => p.status === 'pending').length,
        overdue: payments.filter(p => p.status === 'overdue').length,
        partial: payments.filter(p => p.status === 'partial').length,
      },
      paymentSample: payments.slice(0, 3).map(p => ({
        id: p.id,
        patient: p.patient,
        doctor: p.doctor,
        amount: p.amount,
        status: p.status,
        date: p.date
      })),
      doctorNames: [...new Set(payments.map(p => p.doctor).filter(Boolean))]
    });
    
    if (paidPayments.length === 0 && payments.length > 0) {
      setDebugMode(true);
      console.log('🔧 RevenueProfitTrendWidget - Debug mode AUTO-ENABLED: No paid payments found, but total payments exist');
      console.log('💡 This will show ALL payment types so you can see your data');
    } else if (paidPayments.length > 0) {
      console.log('✅ RevenueProfitTrendWidget - Normal mode: Found paid payments');
    }
  }, [payments]);

  // Get available doctors from payments with enhanced name extraction
  const availableDoctors = useMemo((): string[] => {
    const doctorSet = new Set<string>();
    
    payments.forEach(payment => {
      if (payment.doctor) {
        // Add the original doctor name
        doctorSet.add(payment.doctor);
        
        // Also add cleaned version (without "Dr." prefix) for better matching
        const cleanName = payment.doctor.replace(/^Dr\.?\s*/i, '').trim();
        if (cleanName && cleanName !== payment.doctor) {
          doctorSet.add(cleanName);
        }
      }
    });
    
    const doctors = Array.from(doctorSet).filter(Boolean).sort() as string[];
    console.log('📊 RevenueProfitTrendWidget - Available doctors:', doctors);
    return doctors;
  }, [payments]);

  // Filter payments based on selected criteria
  const filteredPayments = useMemo(() => {
    let filtered = [...payments]; // ✅ CHANGED: Include all payments initially for testing

    // Debug: Log all payment data
    console.log('📊 RevenueProfitTrendWidget - All payments:', payments.map(p => ({
      id: p.id,
      patient: p.patient,
      doctor: p.doctor,
      amount: p.amount,
      status: p.status,
      date: p.date
    })));

    // Filter by doctor
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(p => {
        // Enhanced doctor matching - handle different doctor name formats
        const paymentDoctor = p.doctor?.toLowerCase().trim() || '';
        const selectedDoctorLower = selectedDoctor.toLowerCase().trim();
        
        // Exact match
        if (paymentDoctor === selectedDoctorLower) return true;
        
        // Clean name match (remove "Dr." prefix)
        const cleanPaymentDoctor = paymentDoctor.replace(/^dr\.?\s*/i, '');
        const cleanSelectedDoctor = selectedDoctorLower.replace(/^dr\.?\s*/i, '');
        if (cleanPaymentDoctor === cleanSelectedDoctor) return true;
        
        // Partial match
        if (paymentDoctor.includes(cleanSelectedDoctor) || cleanSelectedDoctor.includes(cleanPaymentDoctor)) return true;
        
        // Word-by-word match
        const paymentWords = cleanPaymentDoctor.split(/\s+/);
        const selectedWords = cleanSelectedDoctor.split(/\s+/);
        const wordMatch = paymentWords.some(word => 
          selectedWords.some(selectedWord => 
            word.includes(selectedWord) || selectedWord.includes(word)
          )
        );
        
        return wordMatch;
      });
      
      console.log(`🔍 RevenueProfitTrendWidget - Filtered by doctor "${selectedDoctor}":`, filtered.length);
    }

    // Filter by time period
    const now = new Date();
    const getDateRange = () => {
      switch (timePeriod) {
        case 'last7days':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'last30days':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'last3months':
          return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case 'last6months':
          return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        case 'last12months':
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        case 'thisMonth':
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return thisMonth;
        case 'thisYear':
          const thisYear = new Date(now.getFullYear(), 0, 1);
          return thisYear;
        default:
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    };

    const startDate = getDateRange();
    filtered = filtered.filter(p => new Date(p.date) >= startDate);

    console.log(`📊 RevenueProfitTrendWidget - Final filtered payments:`, {
      total: filtered.length,
      byStatus: {
        paid: filtered.filter(p => p.status === 'paid').length,
        pending: filtered.filter(p => p.status === 'pending').length,
        overdue: filtered.filter(p => p.status === 'overdue').length,
        partial: filtered.filter(p => p.status === 'partial').length,
      },
      timePeriod,
      selectedDoctor,
      dateRange: startDate.toISOString().split('T')[0]
    });

    return filtered;
  }, [payments, selectedDoctor, timePeriod]);

  // Generate trend data with proper aggregation
  const trendData = useMemo((): TrendDataPoint[] => {
    const dataMap = new Map<string, {
      revenue: number;
      paidCount: number;
    }>();

    // Helper function to format period labels
    const getPeriodLabel = (period: string): string => {
      if (period.includes('W')) {
        const [year, month, week] = period.split('-');
        return `${month}/${year.slice(2)} W${week.slice(1)}`;
      } else if (period.length === 10) {
        // Daily format: YYYY-MM-DD
        const date = new Date(period);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        // Monthly format: YYYY-MM
        const [year, month] = period.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en', { month: 'short' });
        return `${monthName} ${year.slice(2)}`;
      }
    };

    // Determine aggregation level based on time period
    const getAggregationKey = (date: Date): string => {
      if (['last7days', 'last30days'].includes(timePeriod)) {
        return date.toISOString().split('T')[0]; // Daily
      } else if (['last3months', 'last6months'].includes(timePeriod)) {
        const week = Math.ceil(date.getDate() / 7);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-W${week}`; // Weekly
      } else {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // Monthly
      }
    };

    // Process payments and aggregate by time period
    filteredPayments.forEach(payment => {
      const date = new Date(payment.date);
      const key = getAggregationKey(date);
      
      if (!dataMap.has(key)) {
        dataMap.set(key, {
          revenue: 0,
          paidCount: 0,
        });
      }

      const data = dataMap.get(key)!;
      
      // Revenue calculation: paid payments normally, but in debug mode include all payments
      if (payment.status === 'paid' || debugMode) {
        data.revenue += payment.amount;
        data.paidCount += 1;
        
        if (debugMode && payment.status !== 'paid') {
          console.log(`🔧 Debug mode: Including ${payment.status} payment of EGP ${payment.amount} from ${payment.doctor} for period ${key}`);
        } else if (payment.status === 'paid') {
          console.log(`💰 Normal mode: Including paid payment of EGP ${payment.amount} from ${payment.doctor} for period ${key}`);
        }
      } else {
        console.log(`❌ Excluding ${payment.status} payment of EGP ${payment.amount} from ${payment.doctor} (not in debug mode)`);
      }
    });

    // Convert to array and sort by period
    const sortedData = Array.from(dataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, data]) => {
        const revenue = Math.round(data.revenue);
        const profit = Math.round(revenue * 0.7); // 70% profit margin
        
        console.log(`📊 Period ${getPeriodLabel(period)}:`, {
          revenue: revenue,
          profit: profit,
          paidCount: data.paidCount,
          debugMode: debugMode
        });
        
        return {
          period: getPeriodLabel(period),
          revenue: revenue,
          profit: profit,
          revenueChange: 0,
          profitChange: 0,
          revenueChangePercent: 0,
          profitChangePercent: 0,
          paidCount: data.paidCount,
        };
      });

    // Calculate period-over-period changes
    sortedData.forEach((item, index) => {
      if (index > 0) {
        const previous = sortedData[index - 1];
        
        // Revenue changes
        item.revenueChange = item.revenue - previous.revenue;
        item.revenueChangePercent = previous.revenue > 0 
          ? Math.round(((item.revenue - previous.revenue) / previous.revenue) * 100)
          : 0;
          
        // Profit changes
        item.profitChange = item.profit - previous.profit;
        item.profitChangePercent = previous.profit > 0 
          ? Math.round(((item.profit - previous.profit) / previous.profit) * 100)
          : 0;
      }
    });

    return sortedData;
  }, [filteredPayments, timePeriod, debugMode]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    // Revenue calculation: paid payments normally, but in debug mode include all payments
    const revenuePayments = debugMode ? filteredPayments : filteredPayments.filter(p => p.status === 'paid');
    const paidPayments = filteredPayments.filter(p => p.status === 'paid');
    const totalRevenue = revenuePayments.reduce((sum, p) => sum + p.amount, 0);
    const totalProfit = totalRevenue * 0.7; // 70% profit margin
    
    console.log('📊 RevenueProfitTrendWidget - Summary Stats:', {
      filteredPayments: filteredPayments.length,
      paidPayments: paidPayments.length,
      revenuePayments: revenuePayments.length,
      totalRevenue,
      totalProfit,
      trendDataPoints: trendData.length,
      debugMode
    });
    
    // Calculate overall trend from latest data points
    const latestTrend = trendData.length >= 2 
      ? {
          revenueChange: trendData[trendData.length - 1].revenueChange,
          revenueChangePercent: trendData[trendData.length - 1].revenueChangePercent,
          profitChange: trendData[trendData.length - 1].profitChange,
          profitChangePercent: trendData[trendData.length - 1].profitChangePercent,
        }
      : {
          revenueChange: 0,
          revenueChangePercent: 0,
          profitChange: 0,
          profitChangePercent: 0,
        };

    return {
      totalRevenue,
      totalProfit,
      totalPayments: filteredPayments.length,
      paidPayments: paidPayments.length,
      ...latestTrend,
    };
  }, [filteredPayments, trendData, debugMode]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ 
          p: 2, 
          border: '1px solid rgba(9, 9, 121, 0.2)', 
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 1,
            fontWeight: 700,
            background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            📊 {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  background: `linear-gradient(45deg, ${entry.color} 0%, ${entry.color}CC 100%)`,
                  borderRadius: '50%',
                  boxShadow: `0 2px 8px ${entry.color}40`,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(9, 9, 121, 1)' }}>
                {entry.name}: 
                <span style={{ 
                  fontWeight: 800, 
                  marginLeft: '4px',
                  background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  EGP {entry.value.toLocaleString()}
                </span>
              </Typography>
            </Box>
          ))}
        </Card>
      );
    }
    return null;
  };

  // Render chart based on selected type
  const renderChart = () => {
    const commonProps = {
      data: trendData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(9, 9, 121, 0.2)" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: 'rgba(9, 9, 121, 0.7)' }}
              axisLine={{ stroke: 'rgba(9, 9, 121, 0.3)' }}
              tickLine={{ stroke: 'rgba(9, 9, 121, 0.3)' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'rgba(9, 9, 121, 0.7)' }}
              axisLine={{ stroke: 'rgba(9, 9, 121, 0.3)' }}
              tickLine={{ stroke: 'rgba(9, 9, 121, 0.3)' }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
            {(metricView === 'revenue' || metricView === 'both') && (
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="rgba(76, 175, 80, 1)"
                strokeWidth={4}
                dot={{ 
                  fill: 'rgba(76, 175, 80, 1)', 
                  strokeWidth: 3, 
                  r: 6,
                  stroke: 'white'
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: 'rgba(76, 175, 80, 1)', 
                  strokeWidth: 3, 
                  fill: 'white' 
                }}
                name={debugMode ? "💰 Revenue (All Payments - Debug)" : "💰 Revenue (Paid Only)"}
              />
            )}
            {(metricView === 'profit' || metricView === 'both') && (
              <Line
                type="monotone"
                dataKey="profit"
                stroke="rgba(0, 212, 255, 1)"
                strokeWidth={4}
                dot={{ 
                  fill: 'rgba(0, 212, 255, 1)', 
                  strokeWidth: 3, 
                  r: 6,
                  stroke: 'white'
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: 'rgba(0, 212, 255, 1)', 
                  strokeWidth: 3, 
                  fill: 'white' 
                }}
                name="📈 Profit (70% of Revenue)"
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(76, 175, 80, 1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="rgba(76, 175, 80, 1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(0, 212, 255, 1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="rgba(0, 212, 255, 1)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(9, 9, 121, 0.2)" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: 'rgba(9, 9, 121, 0.7)' }}
              axisLine={{ stroke: 'rgba(9, 9, 121, 0.3)' }}
              tickLine={{ stroke: 'rgba(9, 9, 121, 0.3)' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'rgba(9, 9, 121, 0.7)' }}
              axisLine={{ stroke: 'rgba(9, 9, 121, 0.3)' }}
              tickLine={{ stroke: 'rgba(9, 9, 121, 0.3)' }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
            {(metricView === 'revenue' || metricView === 'both') && (
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="rgba(76, 175, 80, 1)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                name={debugMode ? "💰 Revenue (All Payments - Debug)" : "💰 Revenue (Paid Only)"}
              />
            )}
            {(metricView === 'profit' || metricView === 'both') && (
              <Area
                type="monotone"
                dataKey="profit"
                stroke="rgba(0, 212, 255, 1)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#profitGradient)"
                name="📈 Profit (70% of Revenue)"
              />
            )}
          </AreaChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={colorPalette.primary + '20'} />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={colorPalette.success}
              strokeWidth={3}
              dot={{ fill: colorPalette.success, strokeWidth: 2, r: 4 }}
              name={debugMode ? "Revenue (All Payments - Debug)" : "Revenue (Paid Only)"}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 4,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(9, 9, 121, 0.1)',
      boxShadow: '0 12px 40px rgba(9, 9, 121, 0.08)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 16px 50px rgba(9, 9, 121, 0.12)',
        border: '1px solid rgba(9, 9, 121, 0.2)',
      }
    }}>
      {/* Enhanced Header */}
      <Box sx={{ 
        p: 3, 
        pb: 2,
        background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.03) 0%, rgba(0, 212, 255, 0.02) 100%)',
        borderRadius: '16px 16px 0 0',
        borderBottom: '1px solid rgba(9, 9, 121, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
              border: '1px solid rgba(9, 9, 121, 0.2)'
            }}>
              <Analytics sx={{ 
                fontSize: 28, 
                background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                color: 'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }} />
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Revenue & Profit Trends 📈
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={debugMode ? "Debug Mode: Including ALL payment statuses for testing" : "Normal Mode: Only PAID payments (accurate revenue)"}>
              <Chip 
                label={debugMode ? "🔧 All Payments" : "💰 Paid Only"} 
                sx={{
                  background: debugMode 
                    ? 'linear-gradient(90deg, rgba(255, 152, 0, 1) 0%, rgba(255, 183, 77, 1) 100%)'
                    : 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(102, 187, 106, 1) 100%)',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  '&:hover': {
                    background: debugMode 
                      ? 'linear-gradient(90deg, rgba(255, 152, 0, 0.9) 0%, rgba(255, 183, 77, 0.9) 100%)'
                      : 'linear-gradient(90deg, rgba(76, 175, 80, 0.9) 0%, rgba(102, 187, 106, 0.9) 100%)',
                    }
                }}
                size="small"
                clickable
                onClick={() => {
                  const newMode = !debugMode;
                  setDebugMode(newMode);
                  console.log(`🔧 RevenueProfitTrendWidget - Mode switched to: ${newMode ? 'DEBUG (All Payments)' : 'NORMAL (Paid Only)'}`);
                  console.log(`📊 This will ${newMode ? 'include ALL payment statuses' : 'only include PAID payments'} in revenue calculations`);
                }}
              />
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton 
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
                  border: '1px solid rgba(9, 9, 121, 0.2)',
                  color: 'rgba(9, 9, 121, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%)',
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Enhanced Controls */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(9, 9, 121, 0.2)',
                '&:hover': {
                  borderColor: 'rgba(9, 9, 121, 0.4)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                '&.Mui-focused': {
                  borderColor: 'rgba(9, 9, 121, 1)',
                  backgroundColor: 'rgba(255,255,255,1)',
                  boxShadow: '0 4px 16px rgba(9, 9, 121, 0.2)',
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'rgba(9, 9, 121, 1)',
                fontWeight: 600
              }
            }}>
              <InputLabel sx={{ fontWeight: 600 }}>📅 Time Period</InputLabel>
              <Select
                value={timePeriod}
                label="📅 Time Period"
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                {TIME_PERIODS.map((period) => (
                  <MenuItem 
                    key={period.value} 
                    value={period.value}
                    sx={{
                      '&:hover': {
                        background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.05) 0%, rgba(0, 212, 255, 0.05) 100%)'
                      },
                      '&.Mui-selected': {
                        background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
                        fontWeight: 700
                      }
                    }}
                  >
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(9, 9, 121, 0.2)',
                '&:hover': {
                  borderColor: 'rgba(9, 9, 121, 0.4)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                '&.Mui-focused': {
                  borderColor: 'rgba(9, 9, 121, 1)',
                  backgroundColor: 'rgba(255,255,255,1)',
                  boxShadow: '0 4px 16px rgba(9, 9, 121, 0.2)',
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'rgba(9, 9, 121, 1)',
                fontWeight: 600
              }
            }}>
              <InputLabel sx={{ fontWeight: 600 }}>👨‍⚕️ Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                label="👨‍⚕️ Doctor"
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <MenuItem 
                  value="all"
                  sx={{
                    '&:hover': {
                      background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.05) 0%, rgba(0, 212, 255, 0.05) 100%)'
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
                      fontWeight: 700
                    }
                  }}
                >
                  👥 All Doctors
                </MenuItem>
                {availableDoctors.map((doctor) => (
                  <MenuItem 
                    key={doctor} 
                    value={doctor}
                    sx={{
                      '&:hover': {
                        background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.05) 0%, rgba(0, 212, 255, 0.05) 100%)'
                      },
                      '&.Mui-selected': {
                        background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
                        fontWeight: 700
                      }
                    }}
                  >
                    🩺 {doctor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(9, 9, 121, 0.2)',
                '&:hover': {
                  borderColor: 'rgba(9, 9, 121, 0.4)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                '&.Mui-focused': {
                  borderColor: 'rgba(9, 9, 121, 1)',
                  backgroundColor: 'rgba(255,255,255,1)',
                  boxShadow: '0 4px 16px rgba(9, 9, 121, 0.2)',
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'rgba(9, 9, 121, 1)',
                fontWeight: 600
              }
            }}>
              <InputLabel sx={{ fontWeight: 600 }}>📊 Chart Type</InputLabel>
              <Select
                value={chartType}
                label="📊 Chart Type"
                onChange={(e) => setChartType(e.target.value)}
              >
                {CHART_TYPES.map((type) => (
                  <MenuItem 
                    key={type.value} 
                    value={type.value}
                    sx={{
                      '&:hover': {
                        background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.05) 0%, rgba(0, 212, 255, 0.05) 100%)'
                      },
                      '&.Mui-selected': {
                        background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
                        fontWeight: 700
                      }
                    }}
                  >
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <ToggleButtonGroup
              value={metricView}
              exclusive
              onChange={(e, newValue) => newValue && setMetricView(newValue)}
              size="small"
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: '1px solid rgba(9, 9, 121, 0.2)',
                  color: 'rgba(9, 9, 121, 1)',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(9, 9, 121, 0.1)',
                    borderColor: 'rgba(9, 9, 121, 0.4)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                    color: 'white',
                    borderColor: 'rgba(9, 9, 121, 1)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.9) 0%, rgba(0, 212, 255, 0.9) 100%)',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="revenue">💰 Revenue</ToggleButton>
              <ToggleButton value="profit">📈 Profit</ToggleButton>
              <ToggleButton value="both">📊 Both</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Enhanced Summary Stats with Trend Indicators */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} md={3}>
            <Box sx={{ 
              textAlign: 'center',
              p: 2.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)',
              }
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(102, 187, 106, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                💰 EGP {summaryStats.totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(76, 175, 80, 1)',
                fontWeight: 600,
                mb: 1
              }}>
                Total Revenue
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {summaryStats.revenueChange > 0 ? (
                  <TrendingUp sx={{ color: 'rgba(76, 175, 80, 1)', fontSize: 16 }} />
                ) : summaryStats.revenueChange < 0 ? (
                  <TrendingDown sx={{ color: 'rgba(244, 67, 54, 1)', fontSize: 16 }} />
                ) : (
                  <CompareArrows sx={{ color: 'rgba(255, 152, 0, 1)', fontSize: 16 }} />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 700,
                    color: summaryStats.revenueChange > 0 ? 'rgba(76, 175, 80, 1)' : 
                           summaryStats.revenueChange < 0 ? 'rgba(244, 67, 54, 1)' : 'rgba(255, 152, 0, 1)'
                  }}
                >
                  {summaryStats.revenueChangePercent > 0 ? '+' : ''}{summaryStats.revenueChangePercent}%
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ 
              textAlign: 'center',
              p: 2.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0, 212, 255, 0.2)',
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.08) 100%)',
              }
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(90deg, rgba(0, 212, 255, 1) 0%, rgba(77, 182, 172, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                📈 EGP {summaryStats.totalProfit.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(0, 212, 255, 1)',
                fontWeight: 600,
                mb: 1
              }}>
                Total Profit
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {summaryStats.profitChange > 0 ? (
                  <TrendingUp sx={{ color: 'rgba(76, 175, 80, 1)', fontSize: 16 }} />
                ) : summaryStats.profitChange < 0 ? (
                  <TrendingDown sx={{ color: 'rgba(244, 67, 54, 1)', fontSize: 16 }} />
                ) : (
                  <CompareArrows sx={{ color: 'rgba(255, 152, 0, 1)', fontSize: 16 }} />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 700,
                    color: summaryStats.profitChange > 0 ? 'rgba(76, 175, 80, 1)' : 
                           summaryStats.profitChange < 0 ? 'rgba(244, 67, 54, 1)' : 'rgba(255, 152, 0, 1)'
                  }}
                >
                  {summaryStats.profitChangePercent > 0 ? '+' : ''}{summaryStats.profitChangePercent}%
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ 
              textAlign: 'center',
              p: 2.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.1) 0%, rgba(9, 9, 121, 0.05) 100%)',
              border: '1px solid rgba(9, 9, 121, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(9, 9, 121, 0.2)',
                background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.15) 0%, rgba(9, 9, 121, 0.08) 100%)',
              }
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(63, 81, 181, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                💳 {summaryStats.totalPayments}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(9, 9, 121, 1)',
                fontWeight: 600
              }}>
                Paid Payments
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ 
              textAlign: 'center',
              p: 2.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 152, 0, 0.2)',
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.08) 100%)',
              }
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(90deg, rgba(255, 152, 0, 1) 0%, rgba(255, 183, 77, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                📊 {trendData.length}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 152, 0, 1)',
                fontWeight: 600
              }}>
                Data Points
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Enhanced Note */}
        <Alert 
          severity={debugMode ? "warning" : "info"} 
          sx={{ 
            mb: 2,
            borderRadius: 3,
            border: debugMode ? '1px solid rgba(255, 152, 0, 0.3)' : '1px solid rgba(9, 9, 121, 0.3)',
            background: debugMode 
              ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 183, 77, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(9, 9, 121, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': {
              color: debugMode ? 'rgba(255, 152, 0, 1)' : 'rgba(9, 9, 121, 1)'
            },
            '& .MuiAlert-message': {
              color: debugMode ? 'rgba(255, 152, 0, 1)' : 'rgba(9, 9, 121, 1)',
              fontWeight: 500
            }
          }}
        >
          📊 This chart shows revenue and profit trends based on {debugMode ? "ALL payment statuses (paid, pending, overdue, partial)" : "PAID payments only (accurate revenue)"}
          {!debugMode && " - consistent with Payment page calculations"}. 
          Profit is calculated as 70% of revenue. 
          <br />
          📈 Current data: {summaryStats.paidPayments} paid payments, {summaryStats.totalPayments} total payments.
          {debugMode && (
            <>
              <br />
              ⚠️ <strong>Debug Mode Active:</strong> Including all payment types for testing purposes. 
              Switch to "Paid Only" mode for accurate revenue reporting.
            </>
          )}
        </Alert>
      </Box>

      {/* Enhanced Chart Area */}
      <Box sx={{ 
        p: 3, 
        pt: 1,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.9) 100%)',
        borderRadius: '0 0 16px 16px'
      }}>
        <Box sx={{ 
          height: 350,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.01) 0%, rgba(0, 212, 255, 0.02) 100%)',
          border: '1px solid rgba(9, 9, 121, 0.05)',
          p: 1
        }}>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
              background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.03) 0%, rgba(0, 212, 255, 0.05) 100%)',
              borderRadius: 3,
              border: '1px solid rgba(9, 9, 121, 0.1)',
              backdropFilter: 'blur(10px)',
              p: 4
            }}>
              <ShowChart sx={{ 
                fontSize: 80, 
                background: 'linear-gradient(90deg, rgba(9, 9, 121, 0.4) 0%, rgba(0, 212, 255, 0.4) 100%)',
                borderRadius: '50%',
                p: 2
              }} />
              <Typography variant="h6" sx={{
                background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                textAlign: 'center'
              }}>
                📊 {debugMode ? "No payments found for selected filters" : "No paid payments found for selected filters"}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(9, 9, 121, 0.8)',
                textAlign: 'center',
                fontWeight: 500
              }}>
                Found {summaryStats.totalPayments} total payments, but only {summaryStats.paidPayments} are paid.
                {!debugMode ? (
                  <> Try switching to "Debug Mode" to see all payment types, or change some payment statuses to 'paid'.</>
                ) : (
                  <> Try adjusting the time period or doctor filter.</>
                )}
              </Typography>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.05) 0%, rgba(0, 212, 255, 0.03) 100%)',
                border: '1px solid rgba(9, 9, 121, 0.1)'
              }}>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(9, 9, 121, 0.7)',
                  display: 'block',
                  fontWeight: 600,
                  mb: 1
                }}>
                  🩺 Available doctors: {availableDoctors.length > 0 ? availableDoctors.join(', ') : 'None found'}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(9, 9, 121, 0.7)',
                  display: 'block',
                  fontWeight: 600
                }}>
                  📅 Selected period: {timePeriod} | 👨‍⚕️ Selected doctor: {selectedDoctor}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Enhanced Debug Panel (only visible when there are issues) */}
      {(summaryStats.totalPayments === 0 || summaryStats.paidPayments === 0 || availableDoctors.length === 0) && (
        <Box sx={{ 
          p: 3, 
          borderRadius: '0 0 12px 12px',
          background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.08) 0%, rgba(0, 212, 255, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(9, 9, 121, 0.2)',
          border: '1px solid rgba(9, 9, 121, 0.1)',
          mt: 2
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 2, 
            fontWeight: 700,
            background: 'linear-gradient(90deg, rgba(9, 9, 121, 1) 0%, rgba(0, 212, 255, 1) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            🔧 Debug Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(76, 175, 80, 1)',
                  fontWeight: 700,
                  display: 'block',
                  mb: 1
                }}>
                  💳 Payment Data:
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.8)', lineHeight: 1.6 }}>
                  • Total: <strong>{summaryStats.totalPayments}</strong>
                  <br />
                  • Paid: <strong>{summaryStats.paidPayments}</strong>
                  <br />
                  • Debug Mode: <strong>{debugMode ? 'ON' : 'OFF'}</strong>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 212, 255, 0.02) 100%)',
                border: '1px solid rgba(0, 212, 255, 0.2)'
              }}>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(0, 212, 255, 1)',
                  fontWeight: 700,
                  display: 'block',
                  mb: 1
                }}>
                  🩺 Doctor Data:
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.8)', lineHeight: 1.6 }}>
                  • Available: <strong>{availableDoctors.length}</strong>
                  <br />
                  • Selected: <strong>{selectedDoctor}</strong>
                  <br />
                  • Period: <strong>{timePeriod}</strong>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0.02) 100%)',
                border: '1px solid rgba(255, 152, 0, 0.2)'
              }}>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255, 152, 0, 1)',
                  fontWeight: 700,
                  display: 'block',
                  mb: 1
                }}>
                  📊 Chart Data:
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.8)', lineHeight: 1.6 }}>
                  • Data Points: <strong>{trendData.length}</strong>
                  <br />
                  • Total Revenue: <strong>EGP {summaryStats.totalRevenue.toLocaleString()}</strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Card>
  );
};

export default RevenueProfitTrendWidget;

// Add global debug commands for the widget
if (typeof window !== 'undefined') {
  (window as any).debugRevenueWidget = () => {
    console.log('🔧 REVENUE WIDGET DEBUG COMMANDS:');
    console.log('• debugRevenueWidget() - Show this help');
    console.log('• createTestPayments() - Create test payment data');
    console.log('• fixRevenueNow() - Create test data (from dashboard)');
    console.log('• toggleWidgetDebugMode() - Toggle debug mode');
  };

  (window as any).createTestPayments = () => {
    console.log('🔧 Creating test payment data for Revenue Widget...');
    
    const testPayments = [
      {
        id: 1,
        invoiceId: 'INV-TEST-001',
        patient: 'Ahmed Hassan',
        patientAvatar: 'AH',
        doctor: 'Dr. Sarah Ahmed',
        amount: 500,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid' as const,
        method: 'Cash',
        description: 'General Consultation',
        category: 'consultation',
        insurance: 'No' as const,
        insuranceAmount: 0,
        paidAmount: 500,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 500,
        baseAmount: 500
      },
      {
        id: 2,
        invoiceId: 'INV-TEST-002',
        patient: 'Fatima Ali',
        patientAvatar: 'FA',
        doctor: 'Dr. Mohamed Khalil',
        amount: 350,
        currency: 'EGP',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid' as const,
        method: 'Credit Card',
        description: 'Specialist Consultation',
        category: 'consultation',
        insurance: 'No' as const,
        insuranceAmount: 0,
        paidAmount: 350,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 350,
        baseAmount: 350
      },
      {
        id: 3,
        invoiceId: 'INV-TEST-003',
        patient: 'Omar Mahmoud',
        patientAvatar: 'OM',
        doctor: 'Dr. Sarah Ahmed',
        amount: 200,
        currency: 'EGP',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        method: 'Cash',
        description: 'Follow-up Visit',
        category: 'follow-up',
        insurance: 'No' as const,
        insuranceAmount: 0,
        paidAmount: 0,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 200,
        baseAmount: 200
      },
      {
        id: 4,
        invoiceId: 'INV-TEST-004',
        patient: 'Sara Ibrahim',
        patientAvatar: 'SI',
        doctor: 'Dr. Mohamed Khalil',
        amount: 150,
        currency: 'EGP',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'overdue' as const,
        method: 'Bank Transfer',
        description: 'Emergency Visit',
        category: 'emergency',
        insurance: 'No' as const,
        insuranceAmount: 0,
        paidAmount: 0,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 150,
        baseAmount: 150
      }
    ];

    try {
      // Save to localStorage (same format as payment utils)
      localStorage.setItem('clinic_payments_data', JSON.stringify(testPayments));
      console.log('✅ Test payment data created and saved to localStorage');
      console.log('📊 Data includes:', {
        total: testPayments.length,
        paid: testPayments.filter(p => p.status === 'paid').length,
        pending: testPayments.filter(p => p.status === 'pending').length,
        overdue: testPayments.filter(p => p.status === 'overdue').length,
        totalValue: testPayments.reduce((sum, p) => sum + p.amount, 0),
        paidValue: testPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
      });
      
      alert('✅ Test payment data created!\n\nRefresh the dashboard to see the changes.\n\nData includes:\n- 2 paid payments (EGP 850)\n- 1 pending payment (EGP 200)\n- 1 overdue payment (EGP 150)\n\nCheck console for details.');
      
    } catch (error) {
      console.error('❌ Failed to create test data:', error);
      alert('❌ Failed to create test data. Check console for details.');
    }
  };

  console.log('🔧 Revenue Widget Debug Commands Available:');
  console.log('• debugRevenueWidget() - Show help');
  console.log('• createTestPayments() - Create test data');
} 