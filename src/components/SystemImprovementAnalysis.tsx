import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Grid,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Speed,
  Security,
  Build,
  TrendingUp,
  Storage,
  Psychology,
  ExpandMore,
  BugReport,
  Update
} from '@mui/icons-material';

interface SystemIssue {
  id: string;
  category: 'performance' | 'security' | 'usability' | 'data' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  implemented: boolean;
}

export const SystemImprovementAnalysis: React.FC = () => {
  const [systemScore, setSystemScore] = useState(0);
  const [issues, setIssues] = useState<SystemIssue[]>([]);
  const [improvements, setImprovements] = useState<SystemIssue[]>([]);

  useEffect(() => {
    // Analyze current system state
    const currentIssues: SystemIssue[] = [
      // ✅ RESOLVED ISSUES
      {
        id: 'localStorage-sync',
        category: 'data',
        severity: 'high',
        title: 'Real-time Data Synchronization',
        description: 'Doctor scheduling was using localStorage instead of real-time Firebase sync',
        recommendation: 'Implement useAppointments() hook for real-time data flow',
        implemented: true
      },
      {
        id: 'available-slots-bug',
        category: 'data',
        severity: 'critical',
        title: 'Available Slots Marked as Reserved',
        description: 'Available time slots were incorrectly marked as reserved',
        recommendation: 'Add isAvailableSlot: true flag to available slot creation',
        implemented: true
      },
      {
        id: 'patient-initialization',
        category: 'performance',
        severity: 'high',
        title: 'Patient Page Initialization Error',
        description: 'useEffect accessing appointmentData before initialization',
        recommendation: 'Move useEffect after state declaration',
        implemented: true
      },
      {
        id: 'color-coding',
        category: 'usability',
        severity: 'medium',
        title: 'Time Slot Color Coding',
        description: 'Reserved time slots need clear red color indication',
        recommendation: 'Implement gradient red backgrounds for reserved slots',
        implemented: true
      },

      // 🔧 AREAS FOR IMPROVEMENT
      {
        id: 'conflict-prevention',
        category: 'data',
        severity: 'medium',
        title: 'Enhanced Conflict Detection',
        description: 'Need more sophisticated appointment conflict detection',
        recommendation: 'Implement AI-powered conflict prediction and resolution suggestions',
        implemented: false
      },
      {
        id: 'mobile-optimization',
        category: 'usability',
        severity: 'medium',
        title: 'Mobile UI Optimization',
        description: 'Some components need better mobile responsiveness',
        recommendation: 'Implement responsive design patterns for all scheduling components',
        implemented: false
      },
      {
        id: 'performance-metrics',
        category: 'performance',
        severity: 'low',
        title: 'Performance Monitoring',
        description: 'Need real-time performance metrics and monitoring',
        recommendation: 'Add performance monitoring dashboard and alerts',
        implemented: false
      },
      {
        id: 'backup-system',
        category: 'security',
        severity: 'high',
        title: 'Automated Backup System',
        description: 'Need automated backup and recovery system for appointment data',
        recommendation: 'Implement automated daily backups with restoration capabilities',
        implemented: false
      },
      {
        id: 'notification-system',
        category: 'usability',
        severity: 'medium',
        title: 'Advanced Notification System',
        description: 'Need SMS/email notifications for appointment changes',
        recommendation: 'Integrate with notification service providers',
        implemented: false
      }
    ];

    const recentImprovements: SystemIssue[] = [
      {
        id: 'real-time-sync',
        category: 'performance',
        severity: 'high',
        title: 'Real-Time Appointment Sync',
        description: 'Implemented automatic synchronization between patient and doctor scheduling',
        recommendation: 'Monitor performance and optimize Firebase listeners',
        implemented: true
      },
      {
        id: 'enhanced-ui',
        category: 'usability',
        severity: 'medium',
        title: 'Enhanced Scheduling UI',
        description: 'Added color-coded time slots with real-time statistics',
        recommendation: 'Continue gathering user feedback for further improvements',
        implemented: true
      },
      {
        id: 'conflict-detection',
        category: 'data',
        severity: 'medium',
        title: 'Basic Conflict Detection',
        description: 'Implemented real-time conflict detection and alerts',
        recommendation: 'Enhance with predictive analytics',
        implemented: true
      }
    ];

    setIssues(currentIssues);
    setImprovements(recentImprovements);

    // Calculate system health score
    const totalIssues = currentIssues.length;
    const resolvedIssues = currentIssues.filter(issue => issue.implemented).length;
    const score = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;
    setSystemScore(score);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Speed />;
      case 'security': return <Security />;
      case 'usability': return <Psychology />;
      case 'data': return <Storage />;
      default: return <Build />;
    }
  };

  const resolvedIssues = issues.filter(issue => issue.implemented);
  const pendingIssues = issues.filter(issue => !issue.implemented);

  return (
    <Box sx={{ p: 3 }}>
      {/* System Health Overview */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp />
            System Health Analysis
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {systemScore}%
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Overall System Health Score
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemScore}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: systemScore >= 80 ? '#4caf50' : systemScore >= 60 ? '#ff9800' : '#f44336'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold">{resolvedIssues.length}</Typography>
                <Typography variant="caption">Issues Resolved</Typography>
              </Box>
              <Box textAlign="center" sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight="bold">{pendingIssues.length}</Typography>
                <Typography variant="caption">Pending Improvements</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Improvements */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" />
            ✅ Recent Improvements Implemented
          </Typography>
          
          {improvements.map((improvement) => (
            <Alert key={improvement.id} severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                {improvement.title}
              </Typography>
              <Typography variant="caption" display="block">
                {improvement.description}
              </Typography>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Resolved Issues */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" />
            Resolved Issues ({resolvedIssues.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {resolvedIssues.map((issue) => (
              <ListItem key={issue.id}>
                <ListItemIcon>
                  {getCategoryIcon(issue.category)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {issue.title}
                      <Chip 
                        size="small" 
                        label={issue.severity} 
                        color={getSeverityColor(issue.severity)} 
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {issue.description}
                      </Typography>
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                        ✅ Resolution: {issue.recommendation}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Pending Issues */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Areas for Future Enhancement ({pendingIssues.length})
          </Typography>

          <List>
            {pendingIssues.map((issue) => (
              <ListItem key={issue.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 1 }}>
                  {getCategoryIcon(issue.category)}
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1 }}>
                    {issue.title}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={issue.severity} 
                    color={getSeverityColor(issue.severity)} 
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {issue.description}
                </Typography>
                
                <Alert severity="info" sx={{ width: '100%' }}>
                  <Typography variant="caption">
                    <strong>Recommendation:</strong> {issue.recommendation}
                  </Typography>
                </Alert>
                
                {issue !== pendingIssues[pendingIssues.length - 1] && (
                  <Divider sx={{ width: '100%', mt: 2 }} />
                )}
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Update />}
              sx={{ mr: 2 }}
            >
              Plan Next Sprint
            </Button>
            <Button
              variant="contained"
              startIcon={<BugReport />}
            >
              Report Issue
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemImprovementAnalysis; 