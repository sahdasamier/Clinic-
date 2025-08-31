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
import { useAvailableTimeSlots } from '@hooks/useAvailableTimeSlots';

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
    allSlots,
    totalSlots,
    bookedSlots,
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

      if (totalSlots > 0 && availableSlots.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <Warning sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Available Time Slots
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            All {totalSlots} time slots for this doctor on {new Date(date).toLocaleDateString()} are reserved.
            Please select a different date or doctor.
          </Typography>
          {bookedSlots > 0 && (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ⏰ {bookedSlots} appointments already reserved today
            </Typography>
          )}
        </Paper>
      );
    }

  return (
    <Box>
      {/* ✅ ENHANCED: Header with both available and total slot counts */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
        <Typography variant="h6">
          Available Time Slots ({availableSlots.length}/{totalSlots})
        </Typography>
        <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
          {bookedSlots > 0 && (
            <Chip 
              label={`${bookedSlots} Reserved`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          <Chip 
            label="Refresh" 
            onClick={refreshSlots}
            size="small"
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        </Box>
      </Box>

      {/* ✅ ENHANCED: Show all slots with visual distinction between available and booked */}
      <Grid container spacing={1}>
        {allSlots.map((slotInfo) => {
          const isSelected = selectedTimeSlot === slotInfo.timeSlot;
          const isAvailable = slotInfo.isAvailable;
          const displayTime = formatTimeSlot(slotInfo.timeSlot);
          
          // Handle all unavailable slots consistently
          if (!isAvailable) {
            // Check if we have appointment details for better tooltip
            const hasAppointmentDetails = slotInfo.isReserved && slotInfo.appointmentDetails;
            
            return (
              <Grid item xs={6} sm={4} md={3} key={slotInfo.timeSlot}>
                <Tooltip 
                  title={
                    hasAppointmentDetails ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ⏰ Slot Reserved
                        </Typography>
                        <Typography variant="caption">
                          Patient: {slotInfo.appointmentDetails!.patientName}
                        </Typography>
                        <br />
                        <Typography variant="caption">
                          Type: {slotInfo.appointmentDetails!.appointmentType}
                        </Typography>
                        <br />
                        <Typography variant="caption">
                          Status: {slotInfo.appointmentDetails!.status}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ⏰ Slot Unavailable
                        </Typography>
                        <Typography variant="caption">
                          This time slot is not available for booking
                        </Typography>
                      </Box>
                    )
                  }
                >
                  <Chip
                    label={`${displayTime} (${hasAppointmentDetails ? 'Reserved' : 'Unavailable'})`}
                    disabled
                    variant="outlined"
                    icon={<Lock />}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      backgroundColor: hasAppointmentDetails 
                        ? 'rgba(255, 193, 7, 0.08)' 
                        : 'rgba(244, 67, 54, 0.08)',
                      borderColor: hasAppointmentDetails 
                        ? 'rgba(255, 193, 7, 0.5)' 
                        : 'rgba(244, 67, 54, 0.5)',
                      color: 'text.disabled',
                      '& .MuiChip-icon': {
                        color: hasAppointmentDetails ? 'warning.main' : 'error.main'
                      },
                      cursor: 'not-allowed'
                    }}
                  />
                </Tooltip>
              </Grid>
            );
          } else {
            // Available slot - clickable
            return (
              <Grid item xs={6} sm={4} md={3} key={slotInfo.timeSlot}>
                <Tooltip title={`Book appointment at ${displayTime}`}>
                  <Chip
                    label={displayTime}
                    onClick={() => onTimeSlotSelect(slotInfo.timeSlot)}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    icon={isSelected ? <CheckCircle /> : <Schedule />}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? undefined : 'rgba(76, 175, 80, 0.08)',
                      borderColor: isSelected ? undefined : 'rgba(76, 175, 80, 0.5)',
                      '&:hover': {
                        backgroundColor: isSelected ? 'primary.dark' : 'rgba(76, 175, 80, 0.15)',
                        transform: 'scale(1.02)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                </Tooltip>
              </Grid>
            );
          }
        })}
      </Grid>

      {/* ✅ ENHANCED: Summary information */}
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>📊 Schedule Summary:</strong> {availableSlots.length} available, {bookedSlots} reserved out of {totalSlots} total slots
          </Typography>
        </Alert>
        
        {bookedSlots > 0 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>⏰ Reserved slots</strong> are marked with a warning icon. Hover over them to see appointment details.
            </Typography>
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default AvailableTimeSlotsSelector; 