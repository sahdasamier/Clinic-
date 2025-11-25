import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  MonetizationOn,
  Receipt,
  Assessment,
} from '@mui/icons-material';

interface PaymentData {
  id: string | number;
  amount: number;
  paidAmount?: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'cancelled';
  date: string;
}

interface BudgetProfitSummaryCardProps {
  payments: PaymentData[];
}

const BudgetProfitSummaryCard: React.FC<BudgetProfitSummaryCardProps> = ({ payments }) => {
  const theme = useTheme();

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    // ✅ CORRECT: Filter payments by status
    const paidPayments = payments.filter(p => p.status === 'paid');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const overduePayments = payments.filter(p => p.status === 'overdue');

    // ✅ CORRECT: Use paidAmount if available, otherwise amount for revenue
    const totalRevenue = paidPayments.reduce((sum, p) => {
      const amount = p.paidAmount || p.amount || 0;
      return sum + amount;
    }, 0);
    
    const pendingRevenue = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const overdueRevenue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Calculate profit (assuming 70% profit margin)
    const profit = totalRevenue * 0.7;
    const expenses = totalRevenue * 0.3;

    // Calculate collection rate
    const collectionRate = totalExpected > 0 
      ? Math.round((totalRevenue / totalExpected) * 100) 
      : 0;

    // Calculate month-over-month growth (simplified)
    const currentMonth = new Date().getMonth();
    const currentMonthRevenue = paidPayments
      .filter(p => new Date(p.date).getMonth() === currentMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthRevenue = paidPayments
      .filter(p => new Date(p.date).getMonth() === lastMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const growthRate = lastMonthRevenue > 0
      ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    return {
      totalRevenue,
      profit,
      expenses,
      pendingRevenue,
      overdueRevenue,
      totalExpected,
      collectionRate,
      growthRate,
      currentMonthRevenue,
      lastMonthRevenue,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
    };
  }, [payments]);

  const MetricCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    trend, 
    gradient 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    value: string; 
    subtitle: string; 
    trend?: number; 
    gradient: string;
  }) => (
    <Box sx={{
      p: 2.5,
      borderRadius: 3,
      background: gradient,
      border: '1px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 0.5, display: 'block' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          p: 1.5,
          backdropFilter: 'blur(10px)'
        }}>
          {icon}
        </Box>
      </Box>
      {trend !== undefined && trend !== 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          {trend > 0 ? (
            <TrendingUp sx={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }} />
          ) : (
            <TrendingDown sx={{ fontSize: 18, color: 'rgba(255,255,255,0.9)' }} />
          )}
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
            {trend > 0 ? '+' : ''}{trend}% vs last month
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Card sx={{
      borderRadius: 4,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(9, 9, 121, 0.1)',
      boxShadow: '0 12px 40px rgba(9, 9, 121, 0.08)',
      overflow: 'visible',
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
            border: '1px solid rgba(76, 175, 80, 0.2)'
          }}>
            <Assessment sx={{
              fontSize: 28,
              background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(0, 212, 255, 1) 100%)',
              color: 'transparent',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(0, 212, 255, 1) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Budget & Profit Overview 💰
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.6)' }}>
              Real-time financial performance metrics
            </Typography>
          </Box>
        </Box>

        {/* Main Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              icon={<MonetizationOn sx={{ color: 'white', fontSize: 28 }} />}
              title="Total Revenue"
              value={`$${financialMetrics.totalRevenue.toLocaleString()}`}
              subtitle={`${financialMetrics.paidCount} paid transactions`}
              trend={financialMetrics.growthRate}
              gradient="linear-gradient(135deg, rgba(76, 175, 80, 1) 0%, rgba(129, 199, 132, 1) 100%)"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              icon={<TrendingUp sx={{ color: 'white', fontSize: 28 }} />}
              title="Net Profit"
              value={`$${Math.round(financialMetrics.profit).toLocaleString()}`}
              subtitle="70% profit margin"
              gradient="linear-gradient(135deg, rgba(0, 212, 255, 1) 0%, rgba(77, 182, 172, 1) 100%)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              icon={<Receipt sx={{ color: 'white', fontSize: 28 }} />}
              title="Pending"
              value={`$${financialMetrics.pendingRevenue.toLocaleString()}`}
              subtitle={`${financialMetrics.pendingCount} pending payments`}
              gradient="linear-gradient(135deg, rgba(255, 152, 0, 1) 0%, rgba(255, 183, 77, 1) 100%)"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              icon={<AccountBalance sx={{ color: 'white', fontSize: 28 }} />}
              title="Expenses"
              value={`$${Math.round(financialMetrics.expenses).toLocaleString()}`}
              subtitle="30% of revenue"
              gradient="linear-gradient(135deg, rgba(156, 39, 176, 1) 0%, rgba(186, 104, 200, 1) 100%)"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Collection Rate & Progress */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgba(9, 9, 121, 0.8)' }}>
              Collection Rate
            </Typography>
            <Chip
              label={`${financialMetrics.collectionRate}%`}
              size="small"
              sx={{
                background: financialMetrics.collectionRate >= 80
                  ? 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(129, 199, 132, 1) 100%)'
                  : financialMetrics.collectionRate >= 60
                  ? 'linear-gradient(90deg, rgba(255, 152, 0, 1) 0%, rgba(255, 183, 77, 1) 100%)'
                  : 'linear-gradient(90deg, rgba(244, 67, 54, 1) 0%, rgba(229, 115, 115, 1) 100%)',
                color: 'white',
                fontWeight: 700,
              }}
            />
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={financialMetrics.collectionRate}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(9, 9, 121, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: financialMetrics.collectionRate >= 80
                  ? 'linear-gradient(90deg, rgba(76, 175, 80, 1) 0%, rgba(129, 199, 132, 1) 100%)'
                  : financialMetrics.collectionRate >= 60
                  ? 'linear-gradient(90deg, rgba(255, 152, 0, 1) 0%, rgba(255, 183, 77, 1) 100%)'
                  : 'linear-gradient(90deg, rgba(244, 67, 54, 1) 0%, rgba(229, 115, 115, 1) 100%)',
              }
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.6)' }}>
              ${financialMetrics.totalRevenue.toLocaleString()} collected
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.6)' }}>
              ${financialMetrics.totalExpected.toLocaleString()} expected
            </Typography>
          </Box>
        </Box>

        {/* Financial Breakdown */}
        <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(9, 9, 121, 0.02) 0%, rgba(0, 212, 255, 0.02) 100%)' }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 800, 
                  color: '#4CAF50',
                  mb: 0.5 
                }}>
                  ${Math.round(financialMetrics.profit).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.7)', fontWeight: 600 }}>
                  Profit (70%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 800, 
                  color: '#9C27B0',
                  mb: 0.5 
                }}>
                  ${Math.round(financialMetrics.expenses).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.7)', fontWeight: 600 }}>
                  Expenses (30%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 800, 
                  color: '#FF9800',
                  mb: 0.5 
                }}>
                  ${financialMetrics.pendingRevenue.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(9, 9, 121, 0.7)', fontWeight: 600 }}>
                  Pending
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Overdue Alert */}
        {financialMetrics.overdueCount > 0 && (
          <Box sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(229, 115, 115, 0.05) 100%)',
            border: '1px solid rgba(244, 67, 54, 0.2)'
          }}>
            <Typography variant="body2" sx={{ color: '#F44336', fontWeight: 600 }}>
              ⚠️ {financialMetrics.overdueCount} overdue payment(s) totaling ${financialMetrics.overdueRevenue.toLocaleString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProfitSummaryCard;

