import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Slide } from '@mui/material';
import { Cloud, CloudOff, Sync } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { firestoreUtils } from '../api/firebase';

const OfflineStatusIndicator: React.FC = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOffline(firestoreUtils.isOffline());

    // Monitor offline state changes
    const cleanup = firestoreUtils.onOfflineStateChange((offline) => {
      const wasOffline = isOffline;
      setIsOffline(offline);

      if (offline && !wasOffline) {
        // Just went offline
        setShowOfflineAlert(true);
        setShowOnlineAlert(false);
      } else if (!offline && wasOffline) {
        // Just came back online
        setShowOnlineAlert(true);
        setShowOfflineAlert(false);
        
        // Auto-hide online alert after 3 seconds
        setTimeout(() => {
          setShowOnlineAlert(false);
        }, 3000);
      }
    });

    return cleanup;
  }, [isOffline]);

  return (
    <>
      {/* Offline Alert - Persistent */}
      <Snackbar
        open={showOfflineAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert
          severity="warning"
          icon={<CloudOff />}
          onClose={() => setShowOfflineAlert(false)}
          sx={{
            backgroundColor: '#FFF3CD',
            color: '#856404',
            border: '1px solid #FFE69C',
            '& .MuiAlert-icon': {
              color: '#F59E0B'
            }
          }}
        >
          <strong>{t('offline_mode', 'Offline Mode')}</strong> - 
          {t('using_cached_data', 'Using cached data. Changes will sync when back online.')}
        </Alert>
      </Snackbar>

      {/* Online Alert - Auto-hide */}
      <Snackbar
        open={showOnlineAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert
          severity="success"
          icon={<Sync sx={{ animation: 'rotate 1s linear infinite' }} />}
          sx={{
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            border: '1px solid #A7F3D0',
            '& .MuiAlert-icon': {
              color: '#10B981'
            },
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        >
          <strong>{t('back_online', 'Back Online')}</strong> - 
          {t('syncing_changes', 'Syncing your changes with the server...')}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OfflineStatusIndicator; 