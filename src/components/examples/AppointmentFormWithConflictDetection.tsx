import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import AvailableTimeSlotsSelector from '../AvailableTimeSlotsSelector';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

interface AppointmentFormWithConflictDetectionProps {
  doctors: Doctor[];
  onSubmit: (appointmentData: any) => Promise<void>;
}

const AppointmentFormWithConflictDetection: React.FC<AppointmentFormWithConflictDetectionProps> = ({
  doctors,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    doctorId: '',
    date: null as Date | null,
    timeSlot: '',
    duration: 30,
    type: 'consultation',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.doctorId || !formData.date || !formData.timeSlot) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentData = {
        ...formData,
        date: formData.date?.toISOString().split('T')[0], // Convert to YYYY-MM-DD
        doctor: doctors.find(d => d.id === formData.doctorId)?.firstName + ' ' + 
                doctors.find(d => d.id === formData.doctorId)?.lastName
      };

      await onSubmit(appointmentData);
      
      // Reset form on success
      setFormData({
        patientName: '',
        doctorId: '',
        date: null,
        timeSlot: '',
        duration: 30,
        type: 'consultation',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          📅 Schedule New Appointment
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Patient Information */}
            <TextField
              label="Patient Name"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
              fullWidth
            />

            {/* Doctor Selection */}
            <TextField
              select
              label="Doctor"
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              required
              fullWidth
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </MenuItem>
              ))}
            </TextField>

            {/* Date Selection */}
            <DatePicker
              label="Appointment Date"
              value={formData.date}
              onChange={(newDate) => setFormData({ ...formData, date: newDate, timeSlot: '' })}
              minDate={new Date()}
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true
                }
              }}
            />

            {/* Appointment Type */}
            <TextField
              select
              label="Appointment Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
            >
              <MenuItem value="consultation">Consultation</MenuItem>
              <MenuItem value="follow-up">Follow-up</MenuItem>
              <MenuItem value="surgery">Surgery</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
            </TextField>

            {/* Duration */}
            <TextField
              select
              label="Duration (minutes)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              fullWidth
            >
              <MenuItem value={15}>15 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={45}>45 minutes</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
            </TextField>

            <Divider />

            {/* 🚀 NEW: Available Time Slots with Conflict Detection */}
            <AvailableTimeSlotsSelector
              doctorId={formData.doctorId}
              date={formData.date?.toISOString().split('T')[0]}
              duration={formData.duration}
              selectedTimeSlot={formData.timeSlot}
              onTimeSlotSelect={(timeSlot) => setFormData({ ...formData, timeSlot })}
            />

            {/* Notes */}
            <TextField
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            {/* Error Display */}
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !formData.timeSlot}
              sx={{ mt: 2 }}
            >
              {loading ? 'Scheduling...' : 'Schedule Appointment'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentFormWithConflictDetection; 