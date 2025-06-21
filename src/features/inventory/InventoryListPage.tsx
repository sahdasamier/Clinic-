import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Inventory,
  Search,
  Add,
  FilterList,
  Warning,
  CheckCircle,
  LocalShipping,
  TrendingDown,
  Edit,
  Delete,
  Visibility,
  Refresh,
  Download,
} from '@mui/icons-material';
import Header from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const InventoryListPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const inventoryItems = [
    { 
      id: 1, 
      name: 'Surgical Masks', 
      quantity: 500, 
      minStock: 200,
      supplier: 'MedSupplies Inc.', 
      lastUpdated: '2024-07-15',
      category: 'PPE',
      unit: 'pieces',
      status: 'in-stock',
      cost: 0.5,
      expiryDate: '2025-12-31'
    },
    { 
      id: 2, 
      name: 'Nitrile Gloves', 
      quantity: 150, 
      minStock: 300,
      supplier: 'Healthcare Essentials', 
      lastUpdated: '2024-07-14',
      category: 'PPE',
      unit: 'boxes',
      status: 'low-stock',
      cost: 12.99,
      expiryDate: '2026-03-15'
    },
    { 
      id: 3, 
      name: 'Disposable Syringes', 
      quantity: 75, 
      minStock: 100,
      supplier: 'MedSupplies Inc.', 
      lastUpdated: '2024-07-15',
      category: 'Medical Devices',
      unit: 'boxes',
      status: 'low-stock',
      cost: 8.50,
      expiryDate: '2027-01-20'
    },
    { 
      id: 4, 
      name: 'Antiseptic Solution', 
      quantity: 25, 
      minStock: 50,
      supplier: 'PharmaCorp', 
      lastUpdated: '2024-07-10',
      category: 'Pharmaceuticals',
      unit: 'bottles',
      status: 'critical',
      cost: 15.75,
      expiryDate: '2024-11-30'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'success';
      case 'low-stock': return 'warning';
      case 'critical': return 'error';
      case 'out-of-stock': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock': return <CheckCircle />;
      case 'low-stock': return <Warning />;
      case 'critical': return <TrendingDown />;
      case 'out-of-stock': return <TrendingDown />;
      default: return <CheckCircle />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const lowStockItems = inventoryItems.filter(item => item.status === 'low-stock' || item.status === 'critical');
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
          {/* Header Section */}
          <Box sx={{ 
            mb: 4, 
            p: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: { xs: 'flex-start', md: 'center' }, 
              justifyContent: 'space-between', 
              position: 'relative', 
              zIndex: 1,
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 3, md: 0 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
                <Box
                  sx={{
                    width: { xs: 48, sm: 56, md: 64 },
                    height: { xs: 48, sm: 56, md: 64 },
                    borderRadius: { xs: '16px', md: '20px' },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: { xs: 2, sm: 2.5, md: 3 },
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    flexShrink: 0
                  }}
                >
                  <Inventory sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h3"
                    sx={{ 
                      fontWeight: 800, 
                      color: 'white',
                      mb: { xs: 0.5, md: 1 },
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {t('inventory_management')}
                  </Typography>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 400,
                      fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    📦 {t('track_medical_supplies_and_equipment')}
                  </Typography>
                </Box>
              </Box>
              
              {/* Action Buttons */}
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 2, md: 2 },
                width: { xs: '100%', md: 'auto' },
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'stretch'
              }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 700,
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 1.5 },
                    minHeight: 48,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    flex: { xs: 1, sm: 'none' },
                    minWidth: { xs: 'auto', sm: 140 },
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('add_item')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  sx={{ 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 600,
                    px: { xs: 3, md: 4 },
                    py: { xs: 1.5, md: 1.5 },
                    minHeight: 48,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    flex: { xs: 1, sm: 'none' },
                    minWidth: { xs: 'auto', sm: 120 },
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {t('export')}
                </Button>
              </Box>
            </Box>
            
            {/* Decorative Elements */}
            <Box sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 1,
            }} />
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2
                  }}>
                    <Inventory sx={{ color: '#667eea', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    {inventoryItems.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {t('total_items')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2
                  }}>
                    <Warning sx={{ color: '#ff9800', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    {lowStockItems.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {t('low_stock_alerts')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2
                  }}>
                    <LocalShipping sx={{ color: '#4caf50', fontSize: 24 }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    3
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {t('suppliers')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }
              }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2
                  }}>
                    <Typography sx={{ color: '#2196f3', fontSize: 18, fontWeight: 'bold' }}>
                      EGP
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                    {totalValue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {t('total_value')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {lowStockItems.length} {t('items_running_low_on_stock')}
              </Typography>
              <Typography variant="body2">
                {t('please_reorder_soon')}: {lowStockItems.map(item => item.name).join(', ')}
              </Typography>
            </Alert>
          )}

          {/* Main Content */}
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            {/* Search and Filters */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder={t('search_inventory_items')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    flexWrap: 'wrap'
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600
                      }}
                    >
                      {t('filter')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600
                      }}
                    >
                      {t('refresh')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label={`${t('all_items')} (${inventoryItems.length})`} />
                <Tab 
                  label={
                    <Badge badgeContent={lowStockItems.length} color="warning">
                      {t('low_stock')}
                    </Badge>
                  } 
                />
                <Tab label={t('categories')} />
              </Tabs>
            </Box>

            {/* Inventory Table */}
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, py: 2 }}>{t('item_name')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('category')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('quantity')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('status')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('supplier')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('last_updated')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryItems.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.unit}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.category} 
                            size="small" 
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {item.quantity}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min((item.quantity / item.minStock) * 100, 100)} 
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  backgroundColor: item.quantity <= item.minStock ? '#f44336' : '#4caf50'
                                }
                              }} 
                            />
                            <Typography variant="caption" color="text.secondary">
                              Min: {item.minStock}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(item.status)}
                            label={t(item.status)}
                            color={getStatusColor(item.status) as any}
                            size="small"
                            sx={{ borderRadius: 2, fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.supplier}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title={t('view_details')}>
                              <IconButton size="small" color="primary">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('edit_item')}>
                              <IconButton size="small" color="primary">
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('delete_item')}>
                              <IconButton size="small" color="error">
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Low Stock Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  {t('items_requiring_attention')}
                </Typography>
                <Grid container spacing={3}>
                  {lowStockItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card sx={{ 
                        borderLeft: '4px solid #ff9800',
                        '&:hover': { boxShadow: 4 }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.category}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="body2">
                              Current: {item.quantity}
                            </Typography>
                            <Typography variant="body2">
                              Min: {item.minStock}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(item.quantity / item.minStock) * 100} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: '#ffecb3',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: '#ff9800'
                              }
                            }} 
                          />
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="warning"
                            fullWidth
                            sx={{ mt: 2 }}
                          >
                            {t('reorder_now')}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabPanel>

            {/* Categories Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  {t('items_by_category')}
                </Typography>
                <Grid container spacing={3}>
                  {['PPE', 'Medical Devices', 'Pharmaceuticals'].map((category) => {
                    const categoryItems = inventoryItems.filter(item => item.category === category);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={category}>
                        <Card sx={{ '&:hover': { boxShadow: 4 } }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                              {category}
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                              {categoryItems.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {t('items_in_category')}
                            </Typography>
                            <Button size="small" variant="outlined" fullWidth>
                              {t('view_all')}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </TabPanel>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default InventoryListPage; 