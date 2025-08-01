import React, { useState, useEffect } from 'react';
import { Box, Chip, Typography, Tooltip, IconButton } from '@mui/material';
import { 
  CheckCircle, 
  Sync as SyncIcon, 
  Cloud as CloudIcon,
  CloudDone,
  Info
} from '@mui/icons-material';

interface AutoSyncIndicatorProps {
  variant?: 'chip' | 'button' | 'compact';
  showDetails?: boolean;
}

const AutoSyncIndicator: React.FC<AutoSyncIndicatorProps> = ({ 
  variant = 'chip',
  showDetails = false 
}) => {
  const [syncStatus, setSyncStatus] = useState<'active' | 'syncing' | 'connected'>('connected');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // ✅ FIXED: Always set up listeners consistently
  useEffect(() => {
    const handleSyncEvent = () => {
      setSyncStatus('syncing');
      setLastSyncTime(new Date());
      
      // Reset to active after a brief moment
      setTimeout(() => {
        setSyncStatus('active');
      }, 1000);
    };

    const handleConnectionChange = (event: CustomEvent) => {
      const status = event.detail;
      if (status === 'connected') {
        setSyncStatus('connected');
      } else if (status === 'reconnecting') {
        setSyncStatus('syncing');
      }
    };

    // Listen for various sync events
    window.addEventListener('globalDataUpdate', handleSyncEvent);
    window.addEventListener('refreshPatientData', handleSyncEvent);
    window.addEventListener('refreshAppointmentData', handleSyncEvent);
    window.addEventListener('connectionChange', handleConnectionChange as EventListener);

    return () => {
      window.removeEventListener('globalDataUpdate', handleSyncEvent);
      window.removeEventListener('refreshPatientData', handleSyncEvent);
      window.removeEventListener('refreshAppointmentData', handleSyncEvent);
      window.removeEventListener('connectionChange', handleConnectionChange as EventListener);
    };
  }, []); // ✅ FIXED: Empty dependencies to prevent re-running

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} />;
      case 'active':
        return <CheckCircle />;
      case 'connected':
      default:
        return <CloudDone />;
    }
  };

  const getSyncText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'active':
        return 'Auto-Sync Active';
      case 'connected':
      default:
        return 'Real-time Sync';
    }
  };

  const getSyncColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'info';
      case 'active':
        return 'success';
      case 'connected':
      default:
        return 'success';
    }
  };

  // ✅ FIXED: Always render, just change content based on variant
  const iconElement = getSyncIcon();
  const textElement = getSyncText();
  const colorElement = getSyncColor();

  if (variant === 'compact') {
    return (
      <Tooltip 
        title={`Automatic synchronization is active. Last sync: ${lastSyncTime.toLocaleTimeString()}`}
        placement="bottom"
      >
        <IconButton 
          size="small" 
          sx={{ 
            color: syncStatus === 'syncing' ? 'info.main' : 'success.main',
            '& .spin': {
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }
          }}
        >
          {iconElement}
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'button') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: `${colorElement}.100`,
          border: 1,
          borderColor: `${colorElement}.300`,
        }}
      >
        {iconElement}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {textElement}
        </Typography>
        {showDetails && (
          <Tooltip title="Data automatically synchronizes across all pages in real-time without any manual action required">
            <Info sx={{ fontSize: 16, opacity: 0.7, cursor: 'help' }} />
          </Tooltip>
        )}
      </Box>
    );
  }

  // Default chip variant
  return (
    <Chip
      icon={iconElement}
      label={textElement}
      color={colorElement as any}
      variant="filled"
      size="small"
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          fontSize: 16
        },
        '& .MuiSvgIcon-root': {
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          },
          animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none'
        }
      }}
    />
  );
};

export default AutoSyncIndicator; 