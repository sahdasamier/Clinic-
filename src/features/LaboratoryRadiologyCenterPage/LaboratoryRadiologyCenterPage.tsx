import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Tooltip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Inventory,
  Search,
  FilterList,
  Assignment,
  AttachFile,
  CheckCircle,
  Schedule,
  Person,
  LocalHospital,
  Visibility,
  Edit,
  Download,
  CloudUpload,
  Send,
  Refresh,
  Warning,
  Science,
  Biotech,
  MedicalServices,
} from '@mui/icons-material';
import { useAuth } from '@store/auth';
import { useUser } from '@store/auth';
import { useGlobalData } from '../../hooks/useGlobalData';
import FileUploadComponent from '@components/common/forms/FileUploadComponent';
import MedicalRequirementsService, { MedicalRequirementOrder } from '@/services/MedicalRequirementsService';
import { completeRequirementWorkflow } from '@utils/medicalRequirementSync';

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
      id={`requirements-tabpanel-${index}`}
      aria-labelledby={`requirements-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Interface is now imported from the service

const LaboratoryRadiologyPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userProfile } = useUser();
  const { patients } = useGlobalData();

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<MedicalRequirementOrder | null>(null);
  const [processOrderOpen, setProcessOrderOpen] = useState(false);
  const [uploadDocuments, setUploadDocuments] = useState<File[]>([]);
  const [completionNotes, setCompletionNotes] = useState('');
  const [medicalOrders, setMedicalOrders] = useState<MedicalRequirementOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load medical requirement orders from Firebase
  useEffect(() => {
    const loadOrders = async () => {
      if (!userProfile?.clinicId) return;
      
      try {
        setLoading(true);
        
        // ✅ ADDED: Try to sync localStorage with Firebase first
        try {
          await MedicalRequirementsService.syncLocalStorageWithFirebase(userProfile.clinicId);
          console.log('✅ localStorage synced with Firebase');
        } catch (syncError) {
          console.warn('⚠️ localStorage sync failed, continuing with normal load:', syncError);
        }
        
        const orders = await MedicalRequirementsService.getOrdersByClinic(userProfile.clinicId);
        setMedicalOrders(orders);
        setError(null);
      } catch (err) {
        console.error('Error loading medical requirement orders:', err);
        setError('Failed to load laboratory & radiology orders');
        // Set empty array instead of mock data
        setMedicalOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [userProfile?.clinicId]);

  // ✅ ADDED: Handle adding new medical requirements with localStorage backup
  const handleAddNewRequirement = async (requirementData: any) => {
    if (!userProfile?.clinicId) return;
    
    try {
      console.log('🔄 Adding new medical requirement:', requirementData);
      
      const orderId = await MedicalRequirementsService.createOrder(
        userProfile.clinicId,
        requirementData
      );
      
      console.log('✅ New medical requirement created with ID:', orderId);
      
      // Reload orders to show the new one
      const updatedOrders = await MedicalRequirementsService.getOrdersByClinic(userProfile.clinicId);
      setMedicalOrders(updatedOrders);
      
      // Show success message
      setError(null);
      
      // ✅ NEW: Dispatch event for immediate table update in patient list
      window.dispatchEvent(new CustomEvent('medicalRequirementAdded', {
        detail: {
          patientId: requirementData.patientId,
          requirementId: orderId,
          status: 'pending'
        }
      }));
      
      console.log('🔄 Dispatched medicalRequirementAdded event for patient:', requirementData.patientId);
      
    } catch (error) {
      console.error('❌ Error adding new medical requirement:', error);
      setError('Failed to add new medical requirement. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'primary';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'normal': return '📋';
      case 'low': return '📝';
      default: return '📋';
    }
  };

  const filteredOrders = medicalOrders.filter(order => {
    if (searchQuery && !order.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !order.patientName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus && order.status !== filterStatus) return false;
    if (filterPriority && order.priority !== filterPriority) return false;
    return true;
  });

  const ordersByStatus = {
    pending: filteredOrders.filter(order => order.status === 'pending'),
    in_progress: filteredOrders.filter(order => order.status === 'in_progress'),
    completed: filteredOrders.filter(order => order.status === 'completed'),
  };

  const handleProcessOrder = (order: MedicalRequirementOrder) => {
    setSelectedOrder(order);
    setProcessOrderOpen(true);
    setUploadDocuments([]);
    setCompletionNotes('');
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder || !userProfile?.clinicId) return;

    try {
      const documentsToUpload = uploadDocuments.map(file => ({
        name: file.name,
        url: `/documents/${file.name}`, // In real app, upload to Firebase Storage first
        type: file.type,
        size: file.size,
        category: 'completed_result' as const,
        uploadedBy: userProfile?.firstName + ' ' + userProfile?.lastName || 'Lab Staff',
      }));

      await MedicalRequirementsService.completeOrder(
        userProfile.clinicId,
        selectedOrder.id,
        {
          processedBy: userProfile?.firstName + ' ' + userProfile?.lastName || 'Lab Staff',
          completionNotes,
          documents: documentsToUpload,
        }
      );

      // Reload orders to reflect changes
      const updatedOrders = await MedicalRequirementsService.getOrdersByClinic(userProfile.clinicId);
      setMedicalOrders(updatedOrders);

      // Get the completed order to run the full workflow
      const completedOrder = await MedicalRequirementsService.getOrderById(userProfile.clinicId, selectedOrder.id);
      if (completedOrder) {
        // Run the complete workflow: sync to patient and notify
        await completeRequirementWorkflow(userProfile.clinicId, completedOrder);
        
        // ✅ NEW: Dispatch event for immediate table update in patient list
        window.dispatchEvent(new CustomEvent('medicalRequirementUpdated', {
          detail: {
            patientId: completedOrder.patientId,
            requirementId: completedOrder.id,
            status: 'completed'
          }
        }));
        console.log('🔄 Dispatched medicalRequirementUpdated event for patient:', completedOrder.patientId);
      }

      setProcessOrderOpen(false);
      setSelectedOrder(null);
      setUploadDocuments([]);
      setCompletionNotes('');

      console.log('✅ Test results completed and delivered to patient successfully');
    } catch (error) {
      console.error('❌ Error completing order:', error);
      setError('Failed to complete order. Please try again.');
    }
  };

  const stats = {
    total: medicalOrders.length,
    pending: ordersByStatus.pending.length,
    inProgress: ordersByStatus.in_progress.length,
    completed: ordersByStatus.completed.length,
    urgent: medicalOrders.filter(order => order.priority === 'urgent').length,
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Loading laboratory & radiology orders...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!userProfile?.clinicId) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <LocalHospital sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
            Clinic not configured
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please ensure you are associated with a clinic to view laboratory & radiology orders.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (medicalOrders.length === 0 && !error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
            No laboratory & radiology orders found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            When doctors place orders for laboratory tests or imaging studies, they will appear here for processing.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Science sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Biotech sx={{ fontSize: 28, color: 'secondary.main' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Laboratory & Radiology Center
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Process laboratory tests, imaging studies, and medical analysis requests from patient orders
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2">Total Tests</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.inProgress}
              </Typography>
              <Typography variant="body2">Processing</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.completed}
              </Typography>
              <Typography variant="body2">Results Ready</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.urgent}
              </Typography>
              <Typography variant="body2">Urgent</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tests, patients, or procedures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  label="Priority"
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('');
                  setFilterPriority('');
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={ordersByStatus.pending.length} color="warning">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule />
                  <span>Pending Tests</span>
                </Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={ordersByStatus.in_progress.length} color="info">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Science />
                  <span>Processing</span>
                </Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={ordersByStatus.completed.length} color="success">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  <span>Results Ready</span>
                </Box>
              </Badge>
            } 
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <OrdersTable 
            orders={ordersByStatus.pending} 
            onProcessOrder={handleProcessOrder}
            showActions={true}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <OrdersTable 
            orders={ordersByStatus.in_progress} 
            onProcessOrder={handleProcessOrder}
            showActions={true}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <OrdersTable 
            orders={ordersByStatus.completed} 
            onProcessOrder={handleProcessOrder}
            showActions={false}
          />
        </TabPanel>
      </Card>

      {/* Process Order Dialog */}
      <Dialog 
        open={processOrderOpen} 
        onClose={() => setProcessOrderOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Science />
          Process Laboratory/Radiology Order
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              {/* Order Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">Patient Information</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedOrder.patientName}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {selectedOrder.patientAge && `${selectedOrder.patientAge} years`}
                            {selectedOrder.patientAge && selectedOrder.patientGender && ' • '}
                            {selectedOrder.patientGender}
                          </Typography>
                        </Box>
                      </Box>
                      {selectedOrder.patientPhone && (
                        <Typography variant="body2" color="textSecondary">📞 {selectedOrder.patientPhone}</Typography>
                      )}
                      {selectedOrder.patientBloodType && (
                        <Typography variant="body2" color="textSecondary">🩸 {selectedOrder.patientBloodType}</Typography>
                      )}
                      {selectedOrder.patientAllergies && selectedOrder.patientAllergies.length > 0 && (
                        <Typography variant="body2" color="error.main">⚠️ Allergies: {selectedOrder.patientAllergies.join(', ')}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">Test/Procedure</Typography>
                      <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>{selectedOrder.title}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {selectedOrder.requirementType === 'lab' ? '🧪 Laboratory Test' :
                         selectedOrder.requirementType === 'imaging' ? '📡 Radiology/Imaging' :
                         selectedOrder.requirementType === 'consultation' ? '👩‍⚕️ Consultation' :
                         '🩺 Medical Procedure'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{selectedOrder.description}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">Ordered By</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        👩‍⚕️ {selectedOrder.doctorName || selectedOrder.orderedBy}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">Priority & Due Date</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          size="small" 
                          label={selectedOrder.priority} 
                          color={getPriorityColor(selectedOrder.priority) as any}
                        />
                        {selectedOrder.dueDate && (
                          <Typography variant="body2" color="textSecondary">
                            Due: {selectedOrder.dueDate}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    {selectedOrder.preparations && selectedOrder.preparations.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Preparations</Typography>
                        <List dense sx={{ mt: 1 }}>
                          {selectedOrder.preparations.map((prep, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemText primary={`• ${prep}`} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudUpload />
                    Attach Lab Results / Imaging Reports
                  </Typography>
                  <FileUploadComponent
                    uploadType="patient_document"
                    context={{
                      patientId: selectedOrder.patientId,
                      clinicId: userProfile?.clinicId,
                      category: 'lab_results'
                    }}
                    maxFiles={5}
                    onUploadComplete={(results) => {
                      const files = results.map(result => ({
                        name: result.fileName,
                        size: result.size || 0,
                        type: result.contentType || 'application/octet-stream'
                      } as File));
                      setUploadDocuments(files);
                    }}
                  />
                </CardContent>
              </Card>

              {/* Completion Notes */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Lab/Radiology Notes"
                placeholder="Add findings, observations, or notes about the test results..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessOrderOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCompleteOrder}
            disabled={uploadDocuments.length === 0}
            startIcon={<Send />}
          >
            Complete & Send Results to Patient
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Orders Table Component
const OrdersTable: React.FC<{
  orders: MedicalRequirementOrder[];
  onProcessOrder: (order: MedicalRequirementOrder) => void;
  showActions: boolean;
}> = ({ orders, onProcessOrder, showActions }) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'primary';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'normal': return '📋';
      case 'low': return '📝';
      default: return '📋';
    }
  };

  if (orders.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          No tests in this category
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Test/Procedure</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date Ordered</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Ordered By</TableCell>
            {showActions && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <Person />
                  </Avatar>
                  <Typography variant="body2">{order.patientName}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {order.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {order.requirementType === 'lab' ? '🧪 Lab Test' :
                     order.requirementType === 'imaging' ? '📡 Imaging' :
                     order.requirementType === 'consultation' ? '👩‍⚕️ Consultation' :
                     '🩺 Procedure'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={`${getPriorityIcon(order.priority)} ${order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}`}
                  color={getPriorityColor(order.priority) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                  color={getStatusColor(order.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{order.dateOrdered}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color={order.dueDate && new Date(order.dueDate) < new Date() ? 'error' : 'textPrimary'}>
                  {order.dueDate || 'No due date'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{order.orderedBy}</Typography>
              </TableCell>
              {showActions && (
                <TableCell align="center">
                  <Tooltip title="Process Test">
                    <IconButton
                      size="small"
                      onClick={() => onProcessOrder(order)}
                      color="primary"
                    >
                      <Science />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LaboratoryRadiologyPage; 