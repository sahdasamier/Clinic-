import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Badge,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Person,
  CheckCircle,
  TrendingUp
} from '@mui/icons-material';
import { useAppointments, usePatients } from '../hooks/useGlobalData';

// Real-time Appointment Statistics
export const AppointmentStats: React.FC = () => {
  const { appointments } = useAppointments();
  const [todayStats, setTodayStats] = useState({
    total: 0,
    reserved: 0,
    available: 0,
    completed: 0,
    pending: 0,
    currentTime: '',
    nextAppointment: null as any
  });

  useEffect(() => {
    const updateStats = () => {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
      const todayAppointments = appointments.filter(apt => apt.date === today);

      // Filter for real appointments (not just available slots)
      const realAppointments = todayAppointments.filter(apt => !apt.isAvailableSlot && apt.patient);
      const availableSlots = todayAppointments.filter(apt => apt.isAvailableSlot);
      
      // Calculate completed/pending based on current time
      const completed = realAppointments.filter(apt => 
        apt.timeSlot < currentTime && (apt.status === 'completed' || apt.status === 'finished')
      ).length;
      
      const pending = realAppointments.filter(apt => 
        apt.timeSlot >= currentTime && (apt.status === 'scheduled' || apt.status === 'checked-in')
      ).length;

      // Find next appointment
      const nextAppointment = realAppointments
        .filter(apt => apt.timeSlot > currentTime)
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))[0];

      setTodayStats({
        total: realAppointments.length + availableSlots.length,
        reserved: realAppointments.length,
        available: availableSlots.length,
        completed,
        pending,
        currentTime,
        nextAppointment
      });
    };

    updateStats();
    // Update every minute to keep current time accurate
    const interval = setInterval(updateStats, 60000);
    return () => clearInterval(interval);
  }, [appointments]);

  const completionRate = todayStats.reserved > 0 ? (todayStats.completed / todayStats.reserved) * 100 : 0;

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            Today's Appointment Statistics
          </Typography>
          <Box textAlign="right">
            <Typography variant="h6" fontWeight="bold">{todayStats.currentTime}</Typography>
            <Typography variant="caption">Current Time</Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold">{todayStats.total}</Typography>
              <Typography variant="caption">Total Slots</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold" color="#ff6b6b">{todayStats.reserved}</Typography>
              <Typography variant="caption">🔒 Reserved</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold" color="#4ecdc4">{todayStats.available}</Typography>
              <Typography variant="caption">⏰ Available</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold" color="#45b7d1">{completionRate.toFixed(0)}%</Typography>
              <Typography variant="caption">Completed</Typography>
            </Box>
          </Grid>
        </Grid>

        {todayStats.nextAppointment && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📅 Next Appointment: <strong>{todayStats.nextAppointment.timeSlot}</strong> - {todayStats.nextAppointment.patient}
            </Typography>
            <Typography variant="caption">
              Dr. {todayStats.nextAppointment.doctor}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Today's Progress ({todayStats.completed}/{todayStats.reserved} appointments completed)
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={completionRate}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4ecdc4'
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Real-time Conflict Detector
export const ConflictDetector: React.FC = () => {
  const { appointments } = useAppointments();
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    const detectConflicts = () => {
      const conflictList: any[] = [];
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(apt => 
        apt.date === today && !apt.isAvailableSlot && apt.status !== 'cancelled'
      );

      // Check for overlapping appointments
      for (let i = 0; i < todayAppointments.length; i++) {
        for (let j = i + 1; j < todayAppointments.length; j++) {
          const apt1 = todayAppointments[i];
          const apt2 = todayAppointments[j];

          if (apt1.doctorId === apt2.doctorId && apt1.timeSlot === apt2.timeSlot) {
            conflictList.push({
              id: `${apt1.id}-${apt2.id}`,
              doctor: apt1.doctor,
              time: apt1.timeSlot,
              patients: [apt1.patient, apt2.patient],
              severity: 'high'
            });
          }
        }
      }

      setConflicts(conflictList);
    };

    detectConflicts();
  }, [appointments]);

  if (conflicts.length === 0) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          ✅ No scheduling conflicts detected
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
        ⚠️ {conflicts.length} Scheduling Conflict(s) Detected
      </Typography>
      {conflicts.map((conflict, index) => (
        <Typography key={conflict.id} variant="caption" display="block">
          • Dr. {conflict.doctor} at {conflict.time}: {conflict.patients.join(' & ')}
        </Typography>
      ))}
    </Alert>
  );
};

// Doctor Availability Indicator
export const DoctorAvailabilityIndicator: React.FC<{ doctorId: string; doctorName: string }> = ({ 
  doctorId, 
  doctorName 
}) => {
  const { appointments } = useAppointments();
  const [availability, setAvailability] = useState({
    status: 'available',
    nextAppointment: null as any,
    totalToday: 0
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
    
    const doctorAppointments = appointments.filter(apt => 
      apt.doctorId === doctorId && 
      apt.date === today && 
      !apt.isAvailableSlot &&
      apt.status !== 'cancelled'
    ).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

    const currentAppointment = doctorAppointments.find(apt => 
      apt.timeSlot <= currentTime && 
      apt.timeSlot > new Date(new Date().getTime() - 30 * 60000).toTimeString().slice(0, 5)
    );

    const nextAppointment = doctorAppointments.find(apt => apt.timeSlot > currentTime);

    let status = 'available';
    if (currentAppointment) {
      status = 'busy';
    } else if (nextAppointment && nextAppointment.timeSlot <= new Date(new Date().getTime() + 15 * 60000).toTimeString().slice(0, 5)) {
      status = 'upcoming';
    }

    setAvailability({
      status,
      nextAppointment,
      totalToday: doctorAppointments.length
    });
  }, [appointments, doctorId]);

  const getStatusColor = () => {
    switch (availability.status) {
      case 'busy': return 'error';
      case 'upcoming': return 'warning';
      default: return 'success';
    }
  };

  const getStatusText = () => {
    switch (availability.status) {
      case 'busy': return 'In Session';
      case 'upcoming': return 'Next: ' + availability.nextAppointment?.timeSlot;
      default: return 'Available';
    }
  };

  return (
    <Badge
      badgeContent={availability.totalToday}
      color="primary"
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Tooltip title={`Dr. ${doctorName} - ${getStatusText()}`}>
        <Chip
          icon={<Person />}
          label={getStatusText()}
          color={getStatusColor()}
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Tooltip>
    </Badge>
  );
};



// Schedule Utilization Monitor
export const TimeSlotHealthMonitor: React.FC = () => {
  const { appointments } = useAppointments();
  const [utilization, setUtilization] = useState({
    utilizationRate: 0,
    reservedSlots: 0,
    totalSlots: 0,
    issues: [] as string[],
    currentTime: ''
  });

  useEffect(() => {
    const updateUtilization = () => {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().slice(0, 5);
      const todayAppointments = appointments.filter(apt => apt.date === today);
      
      // ✅ FIXED: Calculate reserved appointments (patient appointments only)
      const reservedSlots = todayAppointments.filter(apt => 
        !apt.isAvailableSlot && apt.patient && apt.status !== 'cancelled'
      ).length;
      
      // ✅ FIXED: Calculate available slots (manually added available slots)
      const availableSlots = todayAppointments.filter(apt => 
        apt.isAvailableSlot === true
      ).length;
      
      // ✅ FIXED: Total slots should be reserved + available slots that actually exist
      // This matches what doctor scheduling shows: actual scheduled/available appointments
      const totalSlots = reservedSlots + availableSlots;
      
      const utilizationRate = totalSlots > 0 ? (reservedSlots / totalSlots) * 100 : 0;
      
      const issues: string[] = [];

      // Check for scheduling issues
      if (utilizationRate > 90) {
        issues.push('High utilization - consider adding more available slots');
      } else if (utilizationRate < 30 && reservedSlots > 0) {
        issues.push('Low utilization - schedule could be optimized');
      }

      // Check for conflicts
      const doctorSlotCounts = todayAppointments.reduce((acc, apt) => {
        if (!apt.isAvailableSlot && apt.patient) {
          const key = `${apt.doctorId}-${apt.timeSlot}`;
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const hasConflicts = Object.values(doctorSlotCounts).some(count => count > 1);
      if (hasConflicts) {
        issues.push('⚠️ Time slot conflicts detected');
      }

      // Check if no emergency slots available
      if (availableSlots === 0 && reservedSlots > 0) {
        issues.push('No emergency slots available');
      }

      setUtilization({
        utilizationRate,
        reservedSlots,
        totalSlots,
        issues,
        currentTime
      });
    };

    updateUtilization();
    const interval = setInterval(updateUtilization, 60000);
    return () => clearInterval(interval);
  }, [appointments]);

  const getUtilizationColor = () => {
    if (utilization.utilizationRate > 85) return 'error';
    if (utilization.utilizationRate > 70) return 'warning';
    if (utilization.utilizationRate > 40) return 'success';
    return 'info';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color={getUtilizationColor()} />
          Schedule Utilization: {utilization.reservedSlots}/{utilization.totalSlots}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {utilization.utilizationRate.toFixed(1)}% Utilized
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {utilization.reservedSlots} reserved, {utilization.totalSlots - utilization.reservedSlots} available
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={utilization.utilizationRate}
            color={getUtilizationColor()}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        {utilization.issues.length > 0 && (
          <Alert severity={getUtilizationColor()} sx={{ mt: 1 }}>
            <Typography variant="body2" fontWeight="bold">Status:</Typography>
            {utilization.issues.map((issue, index) => (
              <Typography key={index} variant="caption" display="block">
                • {issue}
              </Typography>
            ))}
          </Alert>
        )}

        {utilization.issues.length === 0 && (
          <Alert severity="success" sx={{ mt: 1 }}>
            <Typography variant="body2">
              ✅ Schedule utilization is optimal
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default {
  AppointmentStats,
  ConflictDetector,
  DoctorAvailabilityIndicator,
  TimeSlotHealthMonitor
}; 