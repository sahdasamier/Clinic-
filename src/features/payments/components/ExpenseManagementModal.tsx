import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Business,
  Person,
  MonetizationOn,
  Edit,
  Save,
  Cancel,
  Delete,
  Add,
  AccountBalance,
  TrendingUp,
  BarChart,
  AttachFile,
  CloudUpload,
  Description,
} from '@mui/icons-material';

import {
  Employee,
  BusinessExpense,
  ExpenseCategory,
  defaultExpenseCategories,
} from '../../../data/mockData';
import {
  loadEmployeesFromStorage,
  saveEmployeesToStorage,
  loadBusinessExpensesFromStorage,
  saveBusinessExpensesToStorage,
  loadExpenseCategoriesFromStorage,
  addEmployee,
  addBusinessExpense,
  deleteEmployee,
  deleteBusinessExpense,
  calculateFinancialSummary,
  type FinancialSummary,
} from '../../../utils/expenseUtils';

interface ExpenseManagementModalProps {
  open: boolean;
  onClose: () => void;
  totalRevenue: number;
  automaticVATFromPayments: number;
}

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
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const ExpenseManagementModal: React.FC<ExpenseManagementModalProps> = ({
  open,
  onClose,
  totalRevenue,
  automaticVATFromPayments,
}) => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  
  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    salary: 0,
    currency: 'EGP',
    paymentFrequency: 'monthly' as 'monthly' | 'weekly' | 'daily',
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
    benefits: {
      healthInsurance: 0,
      transportation: 0,
      bonus: 0,
    },
  });

  // State for business expenses
  const [businessExpenses, setBusinesExpenses] = useState<BusinessExpense[]>([]);
  const [expenseCategories] = useState<ExpenseCategory[]>(defaultExpenseCategories);
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: 0,
    currency: 'EGP',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    vatIncluded: false,
    vatAmount: 0,
    supplier: '',
    notes: '',
    attachments: [] as File[],
  });

  // State for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<{[expenseId: string]: File[]}>({});

  // Financial summary
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);

  // Load data on component mount
  useEffect(() => {
    if (open) {
      const loadedEmployees = loadEmployeesFromStorage();
      const loadedExpenses = loadBusinessExpensesFromStorage();
      setEmployees(loadedEmployees);
      setBusinesExpenses(loadedExpenses);
      
      // Calculate financial summary
      const summary = calculateFinancialSummary(totalRevenue, automaticVATFromPayments);
      setFinancialSummary(summary);
    }
  }, [open, totalRevenue, automaticVATFromPayments]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.position || newEmployee.salary <= 0) {
      return;
    }

    const addedEmployee = addEmployee(newEmployee);
    setEmployees(prev => [...prev, addedEmployee]);
    
    // Reset form
    setNewEmployee({
      name: '',
      position: '',
      salary: 0,
      currency: 'EGP',
      paymentFrequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      isActive: true,
      benefits: {
        healthInsurance: 0,
        transportation: 0,
        bonus: 0,
      },
    });

    // Recalculate financial summary
    const summary = calculateFinancialSummary(totalRevenue, automaticVATFromPayments);
    setFinancialSummary(summary);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      
      // Recalculate financial summary
      const summary = calculateFinancialSummary(totalRevenue, automaticVATFromPayments);
      setFinancialSummary(summary);
    }
  };

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.description || newExpense.amount <= 0) {
      return;
    }

    // Calculate VAT amount if VAT is included
    const vatAmount = newExpense.vatIncluded ? (newExpense.amount * 0.14) : 0; // Assuming 14% VAT
    
    const addedExpense = addBusinessExpense({
      ...newExpense,
      vatAmount,
    });
    setBusinesExpenses(prev => [...prev, addedExpense]);
    
    // Reset form
    setNewExpense({
      category: '',
      description: '',
      amount: 0,
      currency: 'EGP',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      frequency: 'monthly',
      vatIncluded: false,
      vatAmount: 0,
      supplier: '',
      notes: '',
      attachments: [],
    });

    // Recalculate financial summary
    const summary = calculateFinancialSummary(totalRevenue, automaticVATFromPayments);
    setFinancialSummary(summary);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteBusinessExpense(id);
      setBusinesExpenses(prev => prev.filter(exp => exp.id !== id));
      
      // Recalculate financial summary
      const summary = calculateFinancialSummary(totalRevenue, automaticVATFromPayments);
      setFinancialSummary(summary);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = expenseCategories.find(cat => cat.name === categoryName);
    return category?.icon || '📋';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = expenseCategories.find(cat => cat.name === categoryName);
    return category?.color || '#9CA3AF';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setNewExpense(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...fileArray]
      }));
    }
  };

  const removeFile = (fileIndex: number) => {
    setNewExpense(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== fileIndex)
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Business sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            💼 Expense Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employees, business expenses, and financial overview
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Financial Summary Cards */}
        {financialSummary && (
          <Box sx={{ p: 3, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              📊 Financial Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: 'primary.light', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="body2" color="primary.main">Total Revenue</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      EGP {formatCurrency(financialSummary.adjustedRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: 'warning.light', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="body2" color="warning.main">Salary Expenses</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      EGP {formatCurrency(financialSummary.totalSalaryExpenses)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: 'info.light', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="body2" color="info.main">Business Expenses</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      EGP {formatCurrency(financialSummary.totalBusinessExpenses)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: 'error.light', textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="body2" color="error.main">VAT Collected</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      EGP {formatCurrency(financialSummary.finalVATCollected)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ 
                  bgcolor: financialSummary.netProfit >= 0 ? 'success.light' : 'error.light', 
                  textAlign: 'center' 
                }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="body2" color={financialSummary.netProfit >= 0 ? 'success.main' : 'error.main'}>
                      Net Profit
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      EGP {formatCurrency(financialSummary.netProfit)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`👥 Employees (${employees.filter(emp => emp.isActive).length})`} />
            <Tab label={`📋 Business Expenses (${businessExpenses.length})`} />
            <Tab label="📈 Summary" />
          </Tabs>
        </Box>

        {/* Employee Management Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {/* Add New Employee Form */}
            <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Add sx={{ color: 'primary.main' }} />
                  Add New Employee
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Employee Name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Dr. Ahmed Mohamed"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="e.g., Doctor, Nurse, Receptionist"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Salary Amount"
                      type="number"
                      value={newEmployee.salary || ''}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 100 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Frequency</InputLabel>
                      <Select
                        value={newEmployee.paymentFrequency}
                        label="Payment Frequency"
                        onChange={(e) => setNewEmployee(prev => ({ 
                          ...prev, 
                          paymentFrequency: e.target.value as 'monthly' | 'weekly' | 'daily' 
                        }))}
                      >
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={newEmployee.startDate}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, startDate: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Benefits Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }}>
                      <Chip label="Benefits & Allowances (Optional)" size="small" />
                    </Divider>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Health Insurance"
                      type="number"
                      value={newEmployee.benefits.healthInsurance || ''}
                      onChange={(e) => setNewEmployee(prev => ({ 
                        ...prev, 
                        benefits: { 
                          ...prev.benefits, 
                          healthInsurance: parseFloat(e.target.value) || 0 
                        }
                      }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 10 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Transportation"
                      type="number"
                      value={newEmployee.benefits.transportation || ''}
                      onChange={(e) => setNewEmployee(prev => ({ 
                        ...prev, 
                        benefits: { 
                          ...prev.benefits, 
                          transportation: parseFloat(e.target.value) || 0 
                        }
                      }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 10 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Monthly Bonus"
                      type="number"
                      value={newEmployee.benefits.bonus || ''}
                      onChange={(e) => setNewEmployee(prev => ({ 
                        ...prev, 
                        benefits: { 
                          ...prev.benefits, 
                          bonus: parseFloat(e.target.value) || 0 
                        }
                      }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 10 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleAddEmployee}
                      startIcon={<Add />}
                      disabled={!newEmployee.name || !newEmployee.position || newEmployee.salary <= 0}
                      sx={{ borderRadius: 2 }}
                    >
                      Add Employee
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Employees List */}
            {employees.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    👥 Current Employees ({employees.filter(emp => emp.isActive).length} active)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Position</TableCell>
                          <TableCell>Salary</TableCell>
                          <TableCell>Frequency</TableCell>
                          <TableCell>Benefits</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {employees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {employee.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell>
                              EGP {formatCurrency(employee.salary)} 
                              <Typography variant="caption" color="text.secondary" display="block">
                                per {employee.paymentFrequency}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={employee.paymentFrequency} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {employee.benefits && (
                                <Typography variant="caption" color="text.secondary">
                                  Total: EGP {formatCurrency(
                                    (employee.benefits.healthInsurance || 0) +
                                    (employee.benefits.transportation || 0) +
                                    (employee.benefits.bonus || 0)
                                  )}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={employee.isActive ? 'Active' : 'Inactive'} 
                                color={employee.isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Delete Employee">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>

        {/* Business Expenses Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            {/* Add New Expense Form */}
            <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Add sx={{ color: 'primary.main' }} />
                  Add New Business Expense
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Expense Category</InputLabel>
                      <Select
                        value={newExpense.category}
                        label="Expense Category"
                        onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                      >
                        {expenseCategories.map((category) => (
                          <MenuItem key={category.id} value={category.name}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{category.icon}</span>
                              {category.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Office rent for December"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Amount"
                      type="number"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">EGP</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Supplier (Optional)"
                      value={newExpense.supplier}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, supplier: e.target.value }))}
                      placeholder="e.g., ABC Medical Supplies"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newExpense.isRecurring}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, isRecurring: e.target.checked }))}
                        />
                      }
                      label="Recurring Expense"
                    />
                    {newExpense.isRecurring && (
                      <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Frequency</InputLabel>
                        <Select
                          value={newExpense.frequency}
                          label="Frequency"
                          onChange={(e) => setNewExpense(prev => ({ 
                            ...prev, 
                            frequency: e.target.value as 'monthly' | 'quarterly' | 'yearly' 
                          }))}
                        >
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="quarterly">Quarterly</MenuItem>
                          <MenuItem value="yearly">Yearly</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newExpense.vatIncluded}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, vatIncluded: e.target.checked }))}
                        />
                      }
                      label="VAT Included (14%)"
                    />
                    {newExpense.vatIncluded && newExpense.amount > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        VAT Amount: EGP {formatCurrency(newExpense.amount * 0.14)}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes (Optional)"
                      multiline
                      rows={2}
                      value={newExpense.notes}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this expense..."
                    />
                  </Grid>

                  {/* File Upload Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }}>
                      <Chip label="📎 File Attachments (Optional)" size="small" />
                    </Divider>
                    <Box sx={{ mt: 2 }}>
                      <input
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        style={{ display: 'none' }}
                        id="file-upload"
                        multiple
                        type="file"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUpload />}
                          sx={{ mb: 2 }}
                        >
                          Upload Files (Images, PDF, Documents)
                        </Button>
                      </label>
                      
                      {/* Display uploaded files */}
                      {newExpense.attachments.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            📎 Attached Files ({newExpense.attachments.length})
                          </Typography>
                          <List dense>
                            {newExpense.attachments.map((file, index) => (
                              <ListItem
                                key={index}
                                sx={{
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  mb: 1,
                                  bgcolor: 'background.paper'
                                }}
                                secondaryAction={
                                  <IconButton
                                    edge="end"
                                    onClick={() => removeFile(index)}
                                    color="error"
                                    size="small"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                }
                              >
                                <ListItemIcon>
                                  <Description color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={file.name}
                                  secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleAddExpense}
                      startIcon={<Add />}
                      disabled={!newExpense.category || !newExpense.description || newExpense.amount <= 0}
                      sx={{ borderRadius: 2 }}
                    >
                      Add Expense
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Expenses List */}
            {businessExpenses.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    📋 Business Expenses ({businessExpenses.length} total)
                  </Typography>
                  <TableContainer>
                    <Table>
                                              <TableHead>
                          <TableRow>
                            <TableCell>Category</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>VAT</TableCell>
                            <TableCell>Files</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                      <TableBody>
                        {businessExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{getCategoryIcon(expense.category)}</span>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {expense.category}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{expense.description}</Typography>
                              {expense.supplier && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Supplier: {expense.supplier}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                EGP {formatCurrency(expense.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(expense.date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={expense.isRecurring ? `Recurring (${expense.frequency})` : 'One-time'} 
                                size="small" 
                                variant="outlined"
                                color={expense.isRecurring ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              {expense.vatIncluded ? (
                                <Typography variant="caption" color="primary.main">
                                  EGP {formatCurrency(expense.vatAmount || 0)}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No VAT
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachFile sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  0 files
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Delete Expense">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>

        {/* Summary Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            {financialSummary && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'primary.light' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                        📊 Complete Financial Breakdown
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Revenue & Income</Typography>
                          <Typography variant="body2">Total Revenue: EGP {formatCurrency(financialSummary.totalRevenue)}</Typography>
                          <Typography variant="body2">VAT Adjustments: EGP {formatCurrency(financialSummary.netVATAdjustments)}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Adjusted Revenue: EGP {formatCurrency(financialSummary.adjustedRevenue)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Expenses & Deductions</Typography>
                          <Typography variant="body2">Employee Salaries: EGP {formatCurrency(financialSummary.totalSalaryExpenses)}</Typography>
                          <Typography variant="body2">Business Expenses: EGP {formatCurrency(financialSummary.totalBusinessExpenses)}</Typography>
                          <Typography variant="body2">VAT Collected: EGP {formatCurrency(financialSummary.finalVATCollected)}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Expenses: EGP {formatCurrency(financialSummary.totalExpenses)}</Typography>
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Final Net Profit:</Typography>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 800,
                            color: financialSummary.netProfit >= 0 ? 'success.main' : 'error.main'
                          }}
                        >
                          EGP {formatCurrency(financialSummary.netProfit)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Expense Breakdown */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        👥 Employee Expenses Breakdown
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Monthly salary costs for {employees.filter(emp => emp.isActive).length} active employees
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        EGP {formatCurrency(financialSummary.totalSalaryExpenses)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        📋 Business Expenses Breakdown
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Monthly equivalent of all business expenses
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                        EGP {formatCurrency(financialSummary.totalBusinessExpenses)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} startIcon={<Cancel />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseManagementModal; 