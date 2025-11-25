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
  useTheme,
  alpha,
} from '@mui/material';
import {
  BarChart,
  Bar,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  EventAvailable,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Refresh,
  People,
  Analytics,
} from '@mui/icons-material';

// Time period options
const TIME_PERIODS = [
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last3months', label: 'Last 3 Months' },
  { value: 'last6months', label: 'Last 6 Months' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'thisYear', label: 'This Year' },
];

// Chart type options
const CHART_TYPES = [
  { value: 'bar', label: '📊 Bar Chart' },
  { value: 'line', label: '📈 Line Chart' },
  { value: 'area', label: '📉 Area Chart' },
];

interface AppointmentData {
  id: string;
  patientName?: string;
  patient?: string;
  patientId?: string;
  date: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'rescheduled' | 'no-show';
  doctor?: string;
  type?: string;
}

interface PatientConfirmationWidgetProps {
  appointments: AppointmentData[];
  patients?: any[];
}

interface ConfirmationDataPoint {
  period: string;
  confirmed: number;
  pending: number;
  cancelled: number;
  total: number;
  confirmationRate: number;
}

const PatientConfirmationWidget: React.FC<PatientConfirmationWidgetProps> = ({
  appointments,
  patients = []
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Component state
  const [timePeriod, setTimePeriod] = useState('last30days');
  const [chartType, setChartType] = useState('bar');
  const [metricView, setMetricView] = useState<'count' | 'rate'>('count');

  // Filter appointments based on time period
  const filteredAppointments = useMemo(() => {
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
        case 'thisMonth':
          return new Date(now.getFullYear(), now.getMonth(), 1);
        case 'thisYear':
          return new Date(now.getFullYear(), 0, 1);
        default:
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    };

    const startDate = getDateRange();
    return appointments.filter(apt => new Date(apt.date) >= startDate);
  }, [appointments, timePeriod]);

  // Generate confirmation trend data
  const confirmationData = useMemo((): ConfirmationDataPoint[] => {
    const dataMap = new Map<string, {
      confirmed: number;
      pending: number;
      cancelled: number;
      total: number;
    }>();

    const getPeriodLabel = (period: string): string => {
      if (period.includes('W')) {
        const [year, month, week] = period.split('-');
        return `${month}/${year.slice(2)} W${week.slice(1)}`;
      } else if (period.length === 10) {
        const date = new Date(period);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        const [year, month] = period.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en', { month: 'short' });
        return `${monthName} ${year.slice(2)}`;
      }
    };

    const getAggregationKey = (date: Date): string => {
      if (['last7days', 'last30days'].includes(timePeriod)) {
        return date.toISOString().split('T')[0];
      } else if (['last3months', 'last6months'].includes(timePeriod)) {
        const week = Math.ceil(date.getDate() / 7);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-W${week}`;
      } else {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
    };

    filteredAppointments.forEach(appointment => {
      const date = new Date(appointment.date);
      const key = getAggregationKey(date);

      if (!dataMap.has(key)) {
        dataMap.set(key, {
          confirmed: 0,
          pending: 0,
          cancelled: 0,
          total: 0,
        });
      }

      const data = dataMap.get(key)!;
      data.total += 1;

      // ✅ CORRECT: Count confirmed as confirmed OR completed
      if (appointment.status === 'confirmed' || appointment.status === 'completed') {
        data.confirmed += 1;
      } 
      // ✅ CORRECT: Count cancelled, rescheduled, and no-show as cancelled
      else if (appointment.status === 'cancelled' || appointment.status === 'rescheduled' || appointment.status === 'no-show') {
        data.cancelled += 1;
      } 
      // ✅ CORRECT: Count pending and scheduled as pending
      else if (appointment.status === 'pending' || appointment.status === 'scheduled') {
        data.pending += 1;
      }
      // ✅ CORRECT: Default to pending for unknown statuses
      else {
        data.pending += 1;
      }
    });

    return Array.from(dataMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, data]) => ({
        period: getPeriodLabel(period),
        confirmed: data.confirmed,
        pending: data.pending,
        cancelled: data.cancelled,
        total: data.total,
        confirmationRate: data.total > 0 ? Math.round((data.confirmed / data.total) * 100) : 0,
      }));
  }, [filteredAppointments, timePeriod]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalAppointments = filteredAppointments.length;
    
    // ✅ CORRECT: Confirmed = confirmed OR completed
    const confirmedCount = filteredAppointments.filter(
      apt => apt.status === 'confirmed' || apt.status === 'completed'
    ).length;
    
    // ✅ CORRECT: Pending = pending OR scheduled
    const pendingCount = filteredAppointments.filter(
      apt => apt.status === 'pending' || apt.status === 'scheduled'
    ).length;
    
    // ✅ CORRECT: Cancelled = cancelled OR rescheduled OR no-show
    const cancelledCount = filteredAppointments.filter(
      apt => apt.status === 'cancelled' || apt.status === 'rescheduled' || apt.status === 'no-show'
    ).length;

    const confirmationRate = totalAppointments > 0
      ? Math.round((confirmedCount / totalAppointments) * 100)
      : 0;

    // Calculate trend from last two data points
    const trend = confirmationData.length >= 2
      ? confirmationData[confirmationData.length - 1].confirmed -
        confirmationData[confirmationData.length - 2].confirmed
      : 0;

    const trendPercent = confirmationData.length >= 2 && confirmationData[confirmationData.length - 2].confirmed > 0
      ? Math.round(((confirmationData[confirmationData.length - 1].confirmed -
          confirmationData[confirmationData.length - 2].confirmed) /
          confirmationData[confirmationData.length - 2].confirmed) * 100)
      : 0;

    return {
      totalAppointments,
      confirmedCount,
      pendingCount,
      cancelledCount,
      confirmationRate,
      trend,
      trendPercent,
    };
  }, [filteredAppointments, confirmationData]);

  // Pie chart data
  const pieChartData = [
    { name: 'Confirmed', value: summaryStats.confirmedCount, color: '#4CAF50' },
    { name: 'Pending', value: summaryStats.pendingCount, color: '#FF9800' },
    { name: 'Cancelled', value: summaryStats.cancelledCount, color: '#F44336' },
  ];

  // Custom tooltip
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
            📅 {label}
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
                  {entry.value} {entry.name === 'Confirmation Rate' ? '%' : 'patients'}
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
      data: confirmationData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    const dataKeys = metricView === 'rate'
      ? [{ key: 'confirmationRate', name: 'Confirmation Rate', color: '#4CAF50' }]
      : [
          { key: 'confirmed', name: 'Confirmed', color: '#4CAF50' },
          { key: 'pending', name: 'Pending', color: '#FF9800' },
          { key: 'cancelled', name: 'Cancelled', color: '#F44336' },
        ];

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
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
            {dataKeys.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                fill={item.color}
                radius={[8, 8, 0, 0]}
                name={item.name}
              />
            ))}
          </BarChart>
        );

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
            {dataKeys.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={4}
                dot={{
                  fill: item.color,
                  strokeWidth: 3,
                  r: 6,
                  stroke: 'white'
                }}
                activeDot={{
                  r: 8,
                  stroke: item.color,
                  strokeWidth: 3,
                  fill: 'white'
                }}
                name={item.name}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {dataKeys.map((item) => (
                <linearGradient key={item.key} id={`gradient-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
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
            {dataKeys.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#gradient-${item.key})`}
                name={item.name}
              />
            ))}
          </AreaChart>
        );

      default:
        return null;
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
      {/* Header */}
      <Box sx={{
        p: 3,
        pb: 2,
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(129, 199, 132, 0.02) 100%)',
        borderRadius: '16px 16px 0 0',
        borderBottom: '1px solid rgba(76, 175, 80, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)'
            }}>
              <EventAvailable sx={{
                fontSize: 28,
                background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(129, 199, 132, 1) 100%)',
                color: 'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }} />
            </Box>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(129, 199, 132, 1) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Patient Confirmation Analytics 📊
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton
              size="small"
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                color: 'rgba(76, 175, 80, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(129, 199, 132, 0.2) 100%)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Controls */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontWeight: 600 }}>📅 Time Period</InputLabel>
              <Select
                value={timePeriod}
                label="📅 Time Period"
                onChange={(e) => setTimePeriod(e.target.value)}
                sx={{
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  }
                }}
              >
                {TIME_PERIODS.map((period) => (
                  <MenuItem key={period.value} value={period.value}>
                    {period.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontWeight: 600 }}>📊 Chart Type</InputLabel>
              <Select
                value={chartType}
                label="📊 Chart Type"
                onChange={(e) => setChartType(e.target.value)}
                sx={{
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  }
                }}
              >
                {CHART_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
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
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  color: 'rgba(76, 175, 80, 1)',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(129, 199, 132, 1) 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.9) 0%, rgba(129, 199, 132, 0.9) 100%)',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="count">📊 Count</ToggleButton>
              <ToggleButton value="rate">📈 Rate</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Summary Stats */}
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)',
              }
            }}>
              <Typography variant="h4" sx={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(129, 199, 132, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                ✅ {summaryStats.confirmedCount}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(76, 175, 80, 1)', fontWeight: 600 }}>
                Confirmed
              </Typography>
              {summaryStats.trend !== 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                  {summaryStats.trend > 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: 'rgba(76, 175, 80, 1)' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: 'rgba(244, 67, 54, 1)' }} />
                  )}
                  <Typography variant="caption" sx={{
                    fontWeight: 700,
                    color: summaryStats.trend > 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'
                  }}>
                    {summaryStats.trendPercent > 0 ? '+' : ''}{summaryStats.trendPercent}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Box sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 152, 0, 0.2)',
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
                ⏳ {summaryStats.pendingCount}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 152, 0, 1)', fontWeight: 600 }}>
                Pending
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Box sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(244, 67, 54, 0.2)',
              }
            }}>
              <Typography variant="h4" sx={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, rgba(244, 67, 54, 1) 0%, rgba(229, 115, 115, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                ❌ {summaryStats.cancelledCount}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(244, 67, 54, 1)', fontWeight: 600 }}>
                Cancelled
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Box sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.2)',
              }
            }}>
              <Typography variant="h4" sx={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, rgba(33, 150, 243, 1) 0%, rgba(100, 181, 246, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                📊 {summaryStats.confirmationRate}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(33, 150, 243, 1)', fontWeight: 600 }}>
                Confirmation Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Chart Area */}
      <Box sx={{ p: 3, pt: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{
              height: 350,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.01) 0%, rgba(129, 199, 132, 0.02) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.05)',
              p: 1
            }}>
              {confirmationData.length > 0 ? (
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
                  gap: 2
                }}>
                  <EventAvailable sx={{ fontSize: 80, color: 'rgba(76, 175, 80, 0.3)' }} />
                  <Typography variant="h6" sx={{ color: 'rgba(76, 175, 80, 0.8)', fontWeight: 700 }}>
                    No appointment data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{
              height: 350,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.01) 0%, rgba(129, 199, 132, 0.02) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.05)',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="h6" sx={{
                mb: 2,
                fontWeight: 700,
                background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(129, 199, 132, 1) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

export default PatientConfirmationWidget;

