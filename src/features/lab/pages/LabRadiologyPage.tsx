import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  Container, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography 
} from '@mui/material';
import { ordersStore } from '../ordersStore';
import { Order } from '../types';

const LabRadiologyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'lab' | 'radiology'>('all');

  useEffect(() => {
    setOrders(ordersStore.listOrders());
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    
    // Check if order contains at least one item of the specified modality
    return order.items.some(item => item.modality === filter);
  });

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

  // Format items for display
  const formatItems = (items: Order['items']): string => {
    return items.map(item => `${item.description} (${item.modality})`).join(', ');
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" gutterBottom>
              {t('lab_and_radiology_orders')}
            </Typography>
            
            {/* Filter Control */}
            <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
              <InputLabel>{t('filter')}</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                label={t('filter')}
              >
                <MenuItem value="all">{t('all')}</MenuItem>
                <MenuItem value="lab">{t('lab_only')}</MenuItem>
                <MenuItem value="radiology">{t('radiology_only')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {filteredOrders.length === 0 ? (
            <Typography variant="body1" align="center" color="textSecondary">
              {t('no_orders_found')}
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('created_at')}</TableCell>
                    <TableCell>{t('order_id')}</TableCell>
                    <TableCell>{t('patient')}</TableCell>
                    <TableCell>{t('age')}</TableCell>
                    <TableCell>{t('phone')}</TableCell>
                    <TableCell>{t('items')}</TableCell>
                    <TableCell>{t('status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      hover 
                      onClick={() => navigate(`/lab/${order.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {order.id.substring(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.patient.name}</TableCell>
                      <TableCell>{order.patient.age}</TableCell>
                      <TableCell>{order.patient.phone}</TableCell>
                      <TableCell>{formatItems(order.items)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(order.status)} 
                          color={getStatusColor(order.status)} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default LabRadiologyPage;