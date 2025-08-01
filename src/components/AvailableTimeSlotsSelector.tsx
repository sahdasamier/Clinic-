import React from 'react';
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Schedule,
  Lock,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useAvailableTimeSlots } from '../hooks/useAvailableTimeSlots';

interface AvailableTimeSlotsSelectorProps {
  doctorId?: string;
  date?: string;
  duration?: number;
  selectedTimeSlot?: string;
  onTimeSlotSelect: (timeSlot: string) => void;
  workingHours?: { start: string; end: string };
}

const AvailableTimeSlotsSelector: React.FC<AvailableTimeSlotsSelectorProps> = ({
  doctorId,
  date,
  duration = 30,
  selectedTimeSlot,
  onTimeSlotSelect,
  workingHours = { start: '09:00', end: '17:00' }
}) => {
  const {
    availableSlots,
    loading,
    error,
    refreshSlots
  } = useAvailableTimeSlots({
    doctorId,
    date,
    duration,
    workingHours
  });

  // Format time slot for display (convert 24h to 12h format)
  const formatTimeSlot = (timeSlot: string): string => {
    try {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeSlot;
    }
  };

  if (!doctorId || !date) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Schedule sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          Select Doctor and Date
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a doctor and appointment date to see available time slots
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1">
          Loading available time slots...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Chip 
            label="Retry" 
            onClick={refreshSlots}
            size="small"
            variant="outlined"
          />
        }
      >
        {error}
      </Alert>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
        <Warning sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          No Available Time Slots
        </Typography>
        <Typography variant="body2">
          All time slots for this doctor on {new Date(date).toLocaleDateString()} are booked.
          Please select a different date or doctor.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
        <Typography variant="h6">
          Available Time Slots ({availableSlots.length})
        </Typography>
        <Chip 
          label="Refresh" 
          onClick={refreshSlots}
          size="small"
          variant="outlined"
          sx={{ ml: 'auto' }}
        />
      </Box>

      <Grid container spacing={1}>
        {availableSlots.map((timeSlot) => {
          const isSelected = selectedTimeSlot === timeSlot;
          const displayTime = formatTimeSlot(timeSlot);
          
          return (
            <Grid item xs={6} sm={4} md={3} key={timeSlot}>
              <Tooltip title={`Book appointment at ${displayTime}`}>
                <Chip
                  label={displayTime}
                  onClick={() => onTimeSlotSelect(timeSlot)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  icon={isSelected ? <CheckCircle /> : <Schedule />}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                />
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>💡 Tip:</strong> Time slots are automatically updated to prevent double-booking. 
          If a slot becomes unavailable, it will be removed from this list.
        </Typography>
      </Alert>
    </Box>
  );
};

export default AvailableTimeSlotsSelector; 