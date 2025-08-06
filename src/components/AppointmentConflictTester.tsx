import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Schedule,
  Warning,
  CheckCircle,
  Error,
  PlayArrow,
  Refresh,
  Delete,
  AccessTime,
  Person,
  MedicalServices
} from '@mui/icons-material';
import { AppointmentValidationService, ValidationResult } from '../services/AppointmentValidationService';
import { AppointmentConflictService } from '../services/AppointmentConflictService';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  duration: number;
  patientName: string;
  appointmentType: string;
  expectedResult: 'valid' | 'conflict' | 'warning';
}

const AppointmentConflictTester: React.FC = () => {
  const [testResults, setTestResults] = useState<{[key: string]: ValidationResult}>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [customTest, setCustomTest] = useState({
    doctorId: 'doctor-1',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00',
    duration: 30,
    patientName: 'Test Patient',
    appointmentType: 'consultation'
  });
  const [activeReservations, setActiveReservations] = useState<any[]>([]);

  // Pre-defined test scenarios
  const testScenarios: TestScenario[] = [
    {
      id: 'valid-morning',
      name: 'Valid Morning Appointment',
      description: 'Should pass - 10:00 AM appointment',
      doctorId: 'doctor-1',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:00',
      duration: 30,
      patientName: 'John Doe',
      appointmentType: 'consultation',
      expectedResult: 'valid'
    },
    {
      id: 'valid-afternoon',
      name: 'Valid Afternoon Appointment',
      description: 'Should pass - 2:00 PM appointment',
      doctorId: 'doctor-1',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '14:00',
      duration: 30,
      patientName: 'Jane Smith',
      appointmentType: 'check_up',
      expectedResult: 'valid'
    },
    {
      id: 'early-morning',
      name: 'Early Morning (Warning)',
      description: 'Should warn - 7:00 AM (outside business hours)',
      doctorId: 'doctor-1',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '07:00',
      duration: 30,
      patientName: 'Early Bird',
      appointmentType: 'consultation',
      expectedResult: 'warning'
    },
    {
      id: 'late-evening',
      name: 'Late Evening (Warning)',
      description: 'Should warn - 7:00 PM (outside business hours)',
      doctorId: 'doctor-1',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '19:00',
      duration: 30,
      patientName: 'Night Owl',
      appointmentType: 'consultation',
      expectedResult: 'warning'
    },
    {
      id: 'weekend',
      name: 'Weekend Appointment',
      description: 'Should warn - Saturday appointment',
      doctorId: 'doctor-1',
      date: getNextSaturday(),
      timeSlot: '10:00',
      duration: 30,
      patientName: 'Weekend Patient',
      appointmentType: 'consultation',
      expectedResult: 'warning'
    },
    {
      id: 'past-date',
      name: 'Past Date (Error)',
      description: 'Should fail - appointment in the past',
      doctorId: 'doctor-1',
      date: getPastDate(),
      timeSlot: '10:00',
      duration: 30,
      patientName: 'Time Traveler',
      appointmentType: 'consultation',
      expectedResult: 'conflict'
    },
    {
      id: 'long-duration',
      name: 'Long Duration (Warning)',
      description: 'Should warn - 3 hour appointment',
      doctorId: 'doctor-1',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '11:00',
      duration: 180,
      patientName: 'Long Session Patient',
      appointmentType: 'surgery',
      expectedResult: 'warning'
    }
  ];

  function getNextSaturday(): string {
    const today = new Date();
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (6 - today.getDay()));
    return nextSaturday.toISOString().split('T')[0];
  }

  function getPastDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // Load active reservations
  const loadActiveReservations = () => {
    const reservations = AppointmentValidationService.getActiveReservations();
    setActiveReservations(reservations);
  };

  useEffect(() => {
    loadActiveReservations();
    const interval = setInterval(loadActiveReservations, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // Run individual test scenario
  const runTestScenario = async (scenario: TestScenario) => {
    console.log(`🧪 Running test scenario: ${scenario.name}`);
    
    try {
      const result = await AppointmentValidationService.validateAppointmentDetails({
        doctorId: scenario.doctorId,
        date: scenario.date,
        timeSlot: scenario.timeSlot,
        duration: scenario.duration,
        patientName: scenario.patientName,
        appointmentType: scenario.appointmentType
      });

      setTestResults(prev => ({
        ...prev,
        [scenario.id]: result
      }));

      console.log(`✅ Test ${scenario.name} completed:`, result);
    } catch (error) {
      console.error(`❌ Test ${scenario.name} failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [scenario.id]: {
          isValid: false,
          errors: [`Test failed: ${error.message}`],
          warnings: []
        }
      }));
    }
  };

  // Run all test scenarios
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults({});
    
    console.log('🚀 Starting comprehensive appointment conflict tests...');
    
    for (const scenario of testScenarios) {
      await runTestScenario(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunningTests(false);
    console.log('🏁 All tests completed');
  };

  // Run custom test
  const runCustomTest = async () => {
    const customScenario: TestScenario = {
      id: 'custom',
      name: 'Custom Test',
      description: 'User-defined test scenario',
      ...customTest,
      expectedResult: 'valid'
    };

    await runTestScenario(customScenario);
  };

  // Get result status color and icon
  const getResultStatus = (scenario: TestScenario, result?: ValidationResult) => {
    if (!result) return { color: 'default', icon: <Schedule />, text: 'Not tested' };

    const hasErrors = result.errors.length > 0;
    const hasWarnings = result.warnings.length > 0;

    if (hasErrors) {
      return { color: 'error', icon: <Error />, text: 'Failed' };
    } else if (hasWarnings) {
      return { color: 'warning', icon: <Warning />, text: 'Warnings' };
    } else {
      return { color: 'success', icon: <CheckCircle />, text: 'Passed' };
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        🧪 Appointment Conflict Detection Tester
      </Typography>

      <Grid container spacing={3}>
        {/* Test Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Controls
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={runAllTests}
                  disabled={isRunningTests}
                  startIcon={isRunningTests ? <Refresh className="animate-spin" /> : <PlayArrow />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => setTestResults({})}
                  startIcon={<Delete />}
                  fullWidth
                >
                  Clear Results
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Custom Test
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={customTest.doctorId}
                    label="Doctor"
                    onChange={(e) => setCustomTest(prev => ({ ...prev, doctorId: e.target.value }))}
                  >
                    <MenuItem value="doctor-1">Dr. Smith</MenuItem>
                    <MenuItem value="doctor-2">Dr. Johnson</MenuItem>
                    <MenuItem value="doctor-3">Dr. Brown</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Date"
                  type="date"
                  value={customTest.date}
                  onChange={(e) => setCustomTest(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                />

                <TextField
                  label="Time"
                  type="time"
                  value={customTest.timeSlot}
                  onChange={(e) => setCustomTest(prev => ({ ...prev, timeSlot: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                />

                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={customTest.duration}
                  onChange={(e) => setCustomTest(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  size="small"
                  fullWidth
                />

                <TextField
                  label="Patient Name"
                  value={customTest.patientName}
                  onChange={(e) => setCustomTest(prev => ({ ...prev, patientName: e.target.value }))}
                  size="small"
                  fullWidth
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={customTest.appointmentType}
                    label="Type"
                    onChange={(e) => setCustomTest(prev => ({ ...prev, appointmentType: e.target.value }))}
                  >
                    <MenuItem value="consultation">Consultation</MenuItem>
                    <MenuItem value="check_up">Check-up</MenuItem>
                    <MenuItem value="surgery">Surgery</MenuItem>
                    <MenuItem value="follow_up">Follow-up</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  onClick={runCustomTest}
                  startIcon={<PlayArrow />}
                >
                  Run Custom Test
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Active Reservations */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Reservations ({activeReservations.length})
              </Typography>
              
              {activeReservations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active time slot reservations
                </Typography>
              ) : (
                <List dense>
                  {activeReservations.map((reservation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <AccessTime fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${reservation.timeSlot} on ${reservation.date}`}
                        secondary={`Expires: ${reservation.expiresAt.toLocaleTimeString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Test Results */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Scenarios & Results
              </Typography>
              
              <Grid container spacing={2}>
                {testScenarios.map((scenario) => {
                  const result = testResults[scenario.id];
                  const status = getResultStatus(scenario, result);
                  
                  return (
                    <Grid item xs={12} key={scenario.id}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          border: result ? `1px solid ${
                            status.color === 'success' ? '#4caf50' : 
                            status.color === 'warning' ? '#ff9800' : 
                            status.color === 'error' ? '#f44336' : '#e0e0e0'
                          }` : '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ color: `${status.color}.main`, mr: 1 }}>
                            {status.icon}
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {scenario.name}
                          </Typography>
                          <Chip 
                            label={status.text}
                            color={status.color as any}
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {scenario.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip label={`📅 ${scenario.date}`} size="small" variant="outlined" />
                          <Chip label={`⏰ ${scenario.timeSlot}`} size="small" variant="outlined" />
                          <Chip label={`⏱️ ${scenario.duration}min`} size="small" variant="outlined" />
                          <Chip label={`👤 ${scenario.patientName}`} size="small" variant="outlined" />
                        </Box>

                        {result && (
                          <Box sx={{ mt: 2 }}>
                            {result.errors.length > 0 && (
                              <Alert severity="error" sx={{ mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Errors:
                                </Typography>
                                {result.errors.map((error, index) => (
                                  <Typography key={index} variant="body2">
                                    • {error}
                                  </Typography>
                                ))}
                              </Alert>
                            )}
                            
                            {result.warnings.length > 0 && (
                              <Alert severity="warning" sx={{ mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Warnings:
                                </Typography>
                                {result.warnings.map((warning, index) => (
                                  <Typography key={index} variant="body2">
                                    • {warning}
                                  </Typography>
                                ))}
                              </Alert>
                            )}
                            
                            {result.isValid && result.errors.length === 0 && (
                              <Alert severity="success">
                                <Typography variant="body2">
                                  ✅ Appointment slot is available and valid
                                </Typography>
                              </Alert>
                            )}
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            onClick={() => runTestScenario(scenario)}
                            startIcon={<PlayArrow />}
                          >
                            Run Test
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}

                {/* Custom Test Result */}
                {testResults.custom && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, border: '2px solid #2196f3' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        🔧 Custom Test Result
                      </Typography>
                      
                      {testResults.custom.errors.length > 0 && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Errors:
                          </Typography>
                          {testResults.custom.errors.map((error, index) => (
                            <Typography key={index} variant="body2">
                              • {error}
                            </Typography>
                          ))}
                        </Alert>
                      )}
                      
                      {testResults.custom.warnings.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Warnings:
                          </Typography>
                          {testResults.custom.warnings.map((warning, index) => (
                            <Typography key={index} variant="body2">
                              • {warning}
                            </Typography>
                          ))}
                        </Alert>
                      )}
                      
                      {testResults.custom.isValid && testResults.custom.errors.length === 0 && (
                        <Alert severity="success">
                          <Typography variant="body2">
                            ✅ Custom appointment configuration is valid
                          </Typography>
                        </Alert>
                      )}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppointmentConflictTester; 