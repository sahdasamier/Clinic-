import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  CalendarToday,
  AccessTime,
  Lock,
  Star,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DoctorSchedulingGuide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Schedule color="primary" sx={{ fontSize: 40 }} />
            Enhanced Doctor Scheduling System
          </Typography>

          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              🎉 System Enhanced Successfully!
            </Typography>
            <Typography variant="body2">
              The doctor scheduling system has been completely redesigned with color-coded time slots, 
              conflict detection, and real-time synchronization.
            </Typography>
          </Alert>

          <Typography variant="h5" sx={{ mb: 2 }}>
            🎨 Time Slot Color Guide
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
            <Chip
              icon={<span style={{ fontSize: '16px' }}>✅</span>}
              label="Regular Working Hours"
              sx={{ 
                bgcolor: 'success.light', 
                color: 'success.contrastText',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            />
            <Chip
              icon={<span style={{ fontSize: '16px' }}>⏰</span>}
              label="Available Slot (Added Manually)"
              sx={{ 
                bgcolor: 'warning.light', 
                color: 'warning.contrastText',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            />
            <Chip
              icon={<span style={{ fontSize: '16px' }}>🔒</span>}
              label="Reserved (Patient Appointment)"
              sx={{ 
                bgcolor: 'error.light', 
                color: 'error.contrastText',
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            />
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" sx={{ mb: 2 }}>
            ✨ Key Improvements
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Fixed Available Slot Creation"
                secondary="Available time slots are now properly marked and display as ⏰ instead of being reserved"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Star color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Enhanced Visual Design"
                secondary="Color-coded time slots with intuitive icons make it easy to distinguish slot types at a glance"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <AccessTime color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Real-time Synchronization"
                secondary="All changes sync instantly across the system with appointment and patient data"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Lock color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Conflict Prevention"
                secondary="Automatic conflict detection prevents double-booking and overlapping appointments"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CalendarToday color="secondary" />
              </ListItemIcon>
              <ListItemText
                primary="Better Organization"
                secondary="Clean, responsive grid layout with clear time slot management and easy navigation"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" sx={{ mb: 2 }}>
            🚀 How to Use
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Access the Enhanced System:</strong><br />
              Navigate to "Enhanced Doctor Scheduling" in the sidebar, or click the button below.
            </Typography>
          </Alert>

          <Stack spacing={2}>
            <Typography variant="body1">
              <strong>1. Select Doctor & Date:</strong> Choose the doctor and date you want to schedule
            </Typography>
            <Typography variant="body1">
              <strong>2. View Color-Coded Slots:</strong> See all time slots with their status at a glance
            </Typography>
            <Typography variant="body1">
              <strong>3. Add Available Slots:</strong> Click "Add Available Slot" to create bookable time slots
            </Typography>
            <Typography variant="body1">
              <strong>4. Manage Slots:</strong> Delete manually added slots with the delete button
            </Typography>
          </Stack>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowForward />}
              onClick={() => navigate('/enhanced-doctor-scheduling')}
              sx={{ 
                px: 4, 
                py: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Try Enhanced Doctor Scheduling
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📝 Technical Notes
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText
                primary="Real-time Data Hooks"
                secondary="Uses useAppointments() and usePatients() hooks for instant synchronization"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Conflict Detection Service"
                secondary="AppointmentConflictService prevents overlapping appointments automatically"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Color-coded UI"
                secondary="Three distinct slot types with clear visual differentiation"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Enhanced Error Handling"
                secondary="User-friendly error messages for conflicts and validation issues"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorSchedulingGuide; 