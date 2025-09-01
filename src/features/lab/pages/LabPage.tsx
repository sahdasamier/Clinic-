import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Checkbox, 
  Chip, 
  Container, 
  FormControlLabel, 
  Grid, 
  IconButton, 
  Link, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Tooltip, 
  Typography 
} from '@mui/material';
import { WhatsApp } from '@mui/icons-material';
import { ordersStore } from '../ordersStore';
import { buildWhatsAppUrl, isWhatsAppAvailable } from '../whatsappUtils';
import { Order } from '../types';

const LabPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [whatsAppAvailable, setWhatsAppAvailable] = useState(false);

  useEffect(() => {
    if (orderId) {
      const foundOrder = ordersStore.getOrder(orderId);
      if (foundOrder) {
        setOrder(foundOrder);
        setWhatsAppAvailable(isWhatsAppAvailable(foundOrder.patient.phone));
      }
    }
  }, [orderId]);

  const handleItemToggle = (itemId: string) => {
    if (!order) return;
    
    const updatedItems = order.items.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    
    // Calculate new status based on item completion
    let newStatus: Order['status'] = 'sentToLab';
    const doneItems = updatedItems.filter(item => item.done).length;
    
    if (doneItems > 0 && doneItems < updatedItems.length) {
      newStatus = 'inProgress';
    } else if (doneItems === updatedItems.length && doneItems > 0) {
      newStatus = 'completed';
    }
    
    const updatedOrder: Order = {
      ...order,
      items: updatedItems,
      status: newStatus
    };
    
    ordersStore.upsertOrder(updatedOrder);
    setOrder(updatedOrder);
  };

  const handleStatusChange = (newStatus: Order['status']) => {
    if (!order) return;
    
    const updatedOrder: Order = {
      ...order,
      status: newStatus
    };
    
    ordersStore.upsertOrder(updatedOrder);
    setOrder(updatedOrder);
  };

  const getStatusColor = (status: Order['status']): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'draft': return 'default';
      case 'sentToLab': return 'primary';
      case 'inProgress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: Order['status']): string => {
    switch (status) {
      case 'draft': return t('draft');
      case 'sentToLab': return t('sent_to_lab');
      case 'inProgress': return t('in_progress');
      case 'completed': return t('completed');
      default: return status;
    }
  };

  if (!order) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t('no_order_found')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {t('no_order_found_message')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/patients')}
            >
              {t('go_to_patients')}
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                {t('lab_order')}
              </Typography>
            </Grid>
            
            {/* Patient Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('patient_information')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">{t('name')}</Typography>
                  <Typography variant="body1">{order.patient.name}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">{t('age')}</Typography>
                  <Typography variant="body1">{order.patient.age}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">{t('phone')}</Typography>
                  <Typography variant="body1">{order.patient.phone}</Typography>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Order Status */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">{t('status')}</Typography>
                <Chip 
                  label={getStatusText(order.status)} 
                  color={getStatusColor(order.status)} 
                  size="small" 
                />
              </Box>
            </Grid>
            
            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button 
                  variant="outlined" 
                  onClick={() => handleStatusChange('inProgress')}
                  disabled={order.status === 'inProgress' || order.status === 'completed'}
                >
                  {t('mark_in_progress')}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => handleStatusChange('completed')}
                  disabled={order.status === 'completed'}
                >
                  {t('mark_completed')}
                </Button>
                
                {/* WhatsApp Button */}
                <Tooltip 
                  title={whatsAppAvailable ? t('send_via_whatsapp') : t('invalid_phone_number')}
                  placement="top"
                >
                  <span>
                    <IconButton
                      component="a"
                      href={whatsAppAvailable && order ? buildWhatsAppUrl(order.patient.phone, order.patient.name, order.id) : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={!whatsAppAvailable}
                      color="success"
                    >
                      <WhatsApp />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Grid>
            
            {/* Order Items */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('order_items')}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('done')}</TableCell>
                      <TableCell>{t('description')}</TableCell>
                      <TableCell>{t('modality')}</TableCell>
                      <TableCell>{t('priority')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={item.done || false}
                                onChange={() => handleItemToggle(item.id)}
                                color="primary"
                              />
                            }
                            label=""
                          />
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.modality} 
                            size="small" 
                            color={item.modality === 'lab' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          {item.priority ? (
                            <Chip 
                              label={item.priority} 
                              size="small" 
                              color={item.priority === 'urgent' ? 'error' : 'default'}
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              {t('not_specified')}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LabPage;