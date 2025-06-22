import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Person, 
  Assignment, 
  Close,
  MedicalServices,
  CheckCircle 
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { 
  getDoctorsByClinic,
  assignPatientToDoctor,
  unassignPatientFromDoctor,
  getPatientAssignmentHistory,
  type DoctorPatientAssignment
} from '../api/doctorPatients';
import { UserData } from '../api/auth';

interface DoctorPatientAssignmentProps {
  open: boolean;
  onClose: () => void;
  patient: any;
  onAssignmentChange?: () => void;
}

const DoctorPatientAssignment: React.FC<DoctorPatientAssignmentProps> = ({
  open,
  onClose,
  patient,
  onAssignmentChange
}) => {
  const { userProfile } = useUser();
  const [doctors, setDoctors] = useState<UserData[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [assignmentHistory, setAssignmentHistory] = useState<DoctorPatientAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load doctors and assignment history
  useEffect(() => {
    if (open && patient && userProfile?.clinicId) {
      loadData();
    }
  }, [open, patient, userProfile]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load doctors in clinic
      const doctorsData = await getDoctorsByClinic(userProfile!.clinicId);
      setDoctors(doctorsData);
      
      // Set current doctor if patient is assigned
      if (patient.doctorId) {
        setSelectedDoctorId(patient.doctorId);
      }
      
      // Load assignment history
      if (patient.id) {
        const history = await getPatientAssignmentHistory(patient.id);
        setAssignmentHistory(history);
      }
    } catch (err) {
      setError('Failed to load doctor data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDoctor = async () => {
    if (!selectedDoctorId || !patient || !userProfile) return;
    
    setAssigning(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await assignPatientToDoctor(
        patient.id,
        selectedDoctorId,
        userProfile.clinicId,
        userProfile.id
      );
      
      if (result.success) {
        setSuccess('Patient assigned to doctor successfully!');
        onAssignmentChange?.();
        
        // Refresh assignment history
        const history = await getPatientAssignmentHistory(patient.id);
        setAssignmentHistory(history);
        
        // Close dialog after a moment
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to assign patient');
      }
    } catch (err) {
      setError('Failed to assign patient to doctor');
      console.error('Error assigning patient:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignDoctor = async () => {
    if (!patient || !userProfile) return;
    
    setAssigning(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await unassignPatientFromDoctor(patient.id, userProfile.id);
      
      if (result.success) {
        setSuccess('Patient unassigned from doctor successfully!');
        setSelectedDoctorId('');
        onAssignmentChange?.();
        
        // Refresh assignment history
        const history = await getPatientAssignmentHistory(patient.id);
        setAssignmentHistory(history);
      } else {
        setError(result.error || 'Failed to unassign patient');
      }
    } catch (err) {
      setError('Failed to unassign patient from doctor');
      console.error('Error unassigning patient:', err);
    } finally {
      setAssigning(false);
    }
  };

  const getCurrentDoctor = () => {
    return doctors.find(doc => doc.id === selectedDoctorId);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assignment color="primary" />
          <Typography variant="h6">Doctor Assignment</Typography>
          <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ py: 1 }}>
            {/* Patient Info */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Person color="primary" />
                <Typography variant="h6">{patient?.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Phone: {patient?.phone || 'N/A'} • Email: {patient?.email || 'N/A'}
              </Typography>
            </Box>

            {/* Current Assignment */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Current Assignment
              </Typography>
              
              {getCurrentDoctor() ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    icon={<MedicalServices />}
                    label={`Dr. ${getCurrentDoctor()?.firstName} ${getCurrentDoctor()?.lastName}`}
                    color="primary"
                    variant="filled"
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={handleUnassignDoctor}
                    disabled={assigning}
                  >
                    Unassign
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No doctor assigned
                </Typography>
              )}
            </Box>

            {/* Assign New Doctor */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Assign to Doctor
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Doctor</InputLabel>
                <Select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  label="Select Doctor"
                >
                  <MenuItem value="">
                    <em>No doctor</em>
                  </MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MedicalServices fontSize="small" />
                        Dr. {doctor.firstName} {doctor.lastName}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({doctor.email})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                onClick={handleAssignDoctor}
                disabled={!selectedDoctorId || assigning || selectedDoctorId === patient?.doctorId}
                startIcon={assigning ? <CircularProgress size={20} /> : <CheckCircle />}
                sx={{ mr: 2 }}
              >
                {assigning ? 'Assigning...' : 'Assign Doctor'}
              </Button>
            </Box>

            {/* Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* Assignment History */}
            {assignmentHistory.length > 0 && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Assignment History
                </Typography>
                
                <List dense>
                  {assignmentHistory.map((assignment, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Assigned to Dr. ${assignment.doctorName || 'Unknown'}`}
                        secondary={`${new Date(assignment.assignedAt?.toDate?.() || assignment.assignedAt).toLocaleString()} by ${assignment.assignedBy}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          size="small"
                          label={assignment.isActive ? 'Active' : 'Inactive'}
                          color={assignment.isActive ? 'success' : 'default'}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorPatientAssignment; 