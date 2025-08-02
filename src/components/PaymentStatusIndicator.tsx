import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
  CheckCircle as PaidIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  Cancel as CancelledIcon,
  Error as FailedIcon,
  PartiallyFilled as PartialIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'failed';

interface PaymentStatusIndicatorProps {
  status: PaymentStatus;
  size?: 'small' | 'medium';
  showIcon?: boolean;
  showTooltip?: boolean;
  paidAmount?: number;
  totalAmount?: number;
  dueDate?: string;
}

const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({
  status,
  size = 'medium',
  showIcon = true,
  showTooltip = true,
  paidAmount,
  totalAmount,
  dueDate
}) => {
  const { t } = useTranslation();

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return {
          label: t('payment_status.paid', 'Paid'),
          color: '#10b981' as const,
          backgroundColor: '#ecfdf5',
          icon: <PaidIcon fontSize="small" />,
          tooltip: t('payment_status.paid_tooltip', 'Payment completed successfully')
        };
      case 'pending':
        return {
          label: t('payment_status.pending', 'Pending'),
          color: '#f59e0b' as const,
          backgroundColor: '#fffbeb',
          icon: <PendingIcon fontSize="small" />,
          tooltip: t('payment_status.pending_tooltip', 'Payment is pending')
        };
      case 'partial':
        return {
          label: t('payment_status.partial', 'Partial'),
          color: '#3b82f6' as const,
          backgroundColor: '#eff6ff',
          icon: <PartialIcon fontSize="small" />,
          tooltip: paidAmount && totalAmount 
            ? t('payment_status.partial_tooltip_with_amounts', `Partially paid: ${paidAmount}/${totalAmount}`)
            : t('payment_status.partial_tooltip', 'Partially paid')
        };
      case 'overdue':
        return {
          label: t('payment_status.overdue', 'Overdue'),
          color: '#dc2626' as const,
          backgroundColor: '#fef2f2',
          icon: <OverdueIcon fontSize="small" />,
          tooltip: dueDate 
            ? t('payment_status.overdue_tooltip_with_date', `Payment overdue since ${dueDate}`)
            : t('payment_status.overdue_tooltip', 'Payment is overdue')
        };
      case 'cancelled':
        return {
          label: t('payment_status.cancelled', 'Cancelled'),
          color: '#6b7280' as const,
          backgroundColor: '#f9fafb',
          icon: <CancelledIcon fontSize="small" />,
          tooltip: t('payment_status.cancelled_tooltip', 'Payment was cancelled')
        };
      case 'failed':
        return {
          label: t('payment_status.failed', 'Failed'),
          color: '#dc2626' as const,
          backgroundColor: '#fef2f2',
          icon: <FailedIcon fontSize="small" />,
          tooltip: t('payment_status.failed_tooltip', 'Payment failed to process')
        };
      default:
        return {
          label: t('payment_status.unknown', 'Unknown'),
          color: '#6b7280' as const,
          backgroundColor: '#f9fafb',
          icon: <PendingIcon fontSize="small" />,
          tooltip: t('payment_status.unknown_tooltip', 'Unknown payment status')
        };
    }
  };

  const config = getStatusConfig(status);

  const chipElement = (
    <Chip
      label={config.label}
      icon={showIcon ? config.icon : undefined}
      size={size}
      sx={{
        color: config.color,
        backgroundColor: config.backgroundColor,
        borderColor: config.color,
        border: '1px solid',
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: config.color
        },
        '& .MuiChip-label': {
          paddingLeft: showIcon ? '4px' : '12px',
          paddingRight: '12px'
        }
      }}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip title={config.tooltip} arrow placement="top">
        {chipElement}
      </Tooltip>
    );
  }

  return chipElement;
};

export default PaymentStatusIndicator; 