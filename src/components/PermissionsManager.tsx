import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
} from '@mui/material';
import { ExpandMore, Security, Lock, Edit, Visibility } from '@mui/icons-material';
import {
  UserPermissions,
  PermissionKey,
  PermissionLevel,
  DEFAULT_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  PERMISSION_LEVEL_DESCRIPTIONS,
  getUserPermissions,
} from '../types/permissions';
import { User } from '../types/models';

interface PermissionsManagerProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (permissions: UserPermissions) => void;
}

const PermissionsManager: React.FC<PermissionsManagerProps> = ({
  open,
  onClose,
  user,
  onSave,
}) => {
  const [permissions, setPermissions] = useState<UserPermissions>(() => {
    if (user) {
      return getUserPermissions(user);
    }
    return DEFAULT_PERMISSIONS.receptionist;
  });

  React.useEffect(() => {
    if (user) {
      setPermissions(getUserPermissions(user));
    }
  }, [user]);

  const handlePermissionChange = (feature: PermissionKey, level: PermissionLevel) => {
    setPermissions(prev => ({
      ...prev,
      [feature]: level,
    } as UserPermissions));
  };

  const handleSave = () => {
    onSave(permissions);
    onClose();
  };

  const resetToRoleDefaults = () => {
    if (user) {
      setPermissions(DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS.receptionist);
    }
  };

  const getPermissionIcon = (level: PermissionLevel) => {
    switch (level) {
      case 'none': return <Lock color="error" />;
      case 'read': return <Visibility color="info" />;
      case 'write': return <Edit color="warning" />;
      case 'full': return <Security color="success" />;
      default: return <Lock />;
    }
  };

  const getPermissionColor = (level: PermissionLevel): "error" | "info" | "warning" | "success" => {
    switch (level) {
      case 'none': return 'error';
      case 'read': return 'info';
      case 'write': return 'warning';
      case 'full': return 'success';
      default: return 'error';
    }
  };

  // Group permissions by category
  const permissionGroups = {
    'Core Features': ['dashboard', 'patients', 'appointments'] as PermissionKey[],
    'Business Operations': ['payments', 'inventory', 'reports'] as PermissionKey[],
    'Advanced Features': ['doctor_scheduling', 'notifications', 'settings'] as PermissionKey[],
    'Detailed Access': ['patient_details', 'appointment_calendar', 'payment_management', 'inventory_management'] as PermissionKey[],
    'Administrative': ['user_management', 'clinic_settings'] as PermissionKey[],
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="primary" />
          <Typography variant="h6">
            Manage Permissions - {user.firstName} {user.lastName}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Role: {user.role} | Clinic: {user.clinicId}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Custom permissions override role defaults. Leave as role default or customize specific features.
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={resetToRoleDefaults}
            size="small"
            sx={{ mr: 2 }}
          >
            Reset to Role Defaults
          </Button>
          <Chip 
            label={`Current Role: ${user.role}`} 
            color="primary" 
            size="small" 
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {Object.entries(permissionGroups).map(([groupName, groupFeatures]) => (
          <Accordion key={groupName} defaultExpanded={groupName === 'Core Features'}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">{groupName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {groupFeatures.map((feature) => (
                  <Grid item xs={12} sm={6} key={feature}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getPermissionIcon(permissions[feature as keyof UserPermissions])}
                        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                          {feature.replace('_', ' ')}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {PERMISSION_DESCRIPTIONS[feature]}
                      </Typography>

                      <FormControl fullWidth size="small">
                        <InputLabel>Access Level</InputLabel>
                        <Select
                          value={permissions[feature as keyof UserPermissions]}
                          label="Access Level"
                          onChange={(e) => handlePermissionChange(feature, e.target.value as PermissionLevel)}
                        >
                          {(['none', 'read', 'write', 'full'] as PermissionLevel[]).map((level) => (
                            <MenuItem key={level} value={level}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getPermissionIcon(level)}
                                <Typography sx={{ textTransform: 'capitalize' }}>
                                  {level}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {PERMISSION_LEVEL_DESCRIPTIONS[permissions[feature as keyof UserPermissions]]}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Permission Summary</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(permissions).map(([feature, level]) => (
              <Chip
                key={feature}
                label={`${feature}: ${level}`}
                color={getPermissionColor(level)}
                size="small"
                icon={getPermissionIcon(level)}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Permissions
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionsManager; 