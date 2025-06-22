import { 
  Employee, 
  BusinessExpense, 
  ExpenseCategory, 
  VATAdjustment,
  defaultEmployees,
  defaultBusinessExpenses,
  defaultExpenseCategories 
} from '../data/mockData';

// Storage keys
const EMPLOYEES_STORAGE_KEY = 'clinic_employees_data';
const BUSINESS_EXPENSES_STORAGE_KEY = 'clinic_business_expenses_data';
const VAT_ADJUSTMENTS_STORAGE_KEY = 'clinic_vat_adjustments';
const EXPENSE_CATEGORIES_STORAGE_KEY = 'clinic_expense_categories';

// Employee Management
export const loadEmployeesFromStorage = (): Employee[] => {
  try {
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (stored) {
      const employees = JSON.parse(stored);
      return Array.isArray(employees) ? employees : defaultEmployees;
    }
  } catch (error) {
    console.warn('Error loading employees from storage:', error);
  }
  return defaultEmployees;
};

export const saveEmployeesToStorage = (employees: Employee[]) => {
  try {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
    window.dispatchEvent(new CustomEvent('employeesUpdated', { detail: { employees } }));
  } catch (error) {
    console.warn('Error saving employees to storage:', error);
  }
};

// Business Expenses Management
export const loadBusinessExpensesFromStorage = (): BusinessExpense[] => {
  try {
    const stored = localStorage.getItem(BUSINESS_EXPENSES_STORAGE_KEY);
    if (stored) {
      const expenses = JSON.parse(stored);
      return Array.isArray(expenses) ? expenses : defaultBusinessExpenses;
    }
  } catch (error) {
    console.warn('Error loading business expenses from storage:', error);
  }
  return defaultBusinessExpenses;
};

export const saveBusinessExpensesToStorage = (expenses: BusinessExpense[]) => {
  try {
    localStorage.setItem(BUSINESS_EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    window.dispatchEvent(new CustomEvent('businessExpensesUpdated', { detail: { expenses } }));
  } catch (error) {
    console.warn('Error saving business expenses to storage:', error);
  }
};

// VAT Adjustments Management
export const loadVATAdjustmentsFromStorage = (): VATAdjustment[] => {
  try {
    const stored = localStorage.getItem(VAT_ADJUSTMENTS_STORAGE_KEY);
    console.log('📋 Loading VAT adjustments from localStorage:', { stored, key: VAT_ADJUSTMENTS_STORAGE_KEY });
    if (stored) {
      const adjustments = JSON.parse(stored);
      console.log('💾 Parsed VAT adjustments:', adjustments);
      return Array.isArray(adjustments) ? adjustments : [];
    }
  } catch (error) {
    console.warn('Error loading VAT adjustments from storage:', error);
  }
  console.log('⚠️ No VAT adjustments found in localStorage');
  return [];
};

export const saveVATAdjustmentsToStorage = (adjustments: VATAdjustment[]) => {
  try {
    console.log('💾 Saving VAT adjustments to localStorage:', { adjustments, key: VAT_ADJUSTMENTS_STORAGE_KEY });
    localStorage.setItem(VAT_ADJUSTMENTS_STORAGE_KEY, JSON.stringify(adjustments));
    
    // Verify save worked
    const verification = localStorage.getItem(VAT_ADJUSTMENTS_STORAGE_KEY);
    console.log('✅ VAT adjustments save verification:', { saved: verification });
    
    window.dispatchEvent(new CustomEvent('vatAdjustmentsUpdated', { detail: { adjustments } }));
    console.log('📡 Dispatched vatAdjustmentsUpdated event');
  } catch (error) {
    console.warn('Error saving VAT adjustments to storage:', error);
  }
};

// Expense Categories Management
export const loadExpenseCategoriesFromStorage = (): ExpenseCategory[] => {
  try {
    const stored = localStorage.getItem(EXPENSE_CATEGORIES_STORAGE_KEY);
    if (stored) {
      const categories = JSON.parse(stored);
      return Array.isArray(categories) ? categories : defaultExpenseCategories;
    }
  } catch (error) {
    console.warn('Error loading expense categories from storage:', error);
  }
  return defaultExpenseCategories;
};

export const saveExpenseCategoriesToStorage = (categories: ExpenseCategory[]) => {
  try {
    localStorage.setItem(EXPENSE_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('expenseCategoriesUpdated', { detail: { categories } }));
  } catch (error) {
    console.warn('Error saving expense categories to storage:', error);
  }
};

// Calculate monthly salary expenses
export const calculateMonthlySalaryExpenses = (): number => {
  const employees = loadEmployeesFromStorage();
  return employees
    .filter(emp => emp.isActive)
    .reduce((total, emp) => {
      let monthlySalary = emp.salary;
      
      // Convert to monthly based on payment frequency
      switch (emp.paymentFrequency) {
        case 'weekly':
          monthlySalary = emp.salary * 4.33; // Average weeks per month
          break;
        case 'daily':
          monthlySalary = emp.salary * 22; // Average working days per month
          break;
        case 'monthly':
        default:
          monthlySalary = emp.salary;
          break;
      }
      
      // Add benefits
      if (emp.benefits) {
        monthlySalary += (emp.benefits.healthInsurance || 0) +
                        (emp.benefits.transportation || 0) +
                        (emp.benefits.bonus || 0);
      }
      
      return total + monthlySalary;
    }, 0);
};

// Calculate monthly business expenses
export const calculateMonthlyBusinessExpenses = (): number => {
  const expenses = loadBusinessExpensesFromStorage();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  return expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    
    if (expense.isRecurring) {
      // For recurring expenses, calculate monthly equivalent
      switch (expense.frequency) {
        case 'monthly':
          return total + expense.amount;
        case 'quarterly':
          return total + (expense.amount / 3);
        case 'yearly':
          return total + (expense.amount / 12);
        default:
          return total + expense.amount;
      }
    } else {
      // For one-time expenses, only include if in current month
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        return total + expense.amount;
      }
    }
    
    return total;
  }, 0);
};

// Calculate total VAT from business expenses
export const calculateVATFromExpenses = (): number => {
  const expenses = loadBusinessExpensesFromStorage();
  return expenses
    .filter(expense => expense.vatIncluded && expense.vatAmount)
    .reduce((total, expense) => total + (expense.vatAmount || 0), 0);
};

// Calculate net VAT adjustments
export const calculateNetVATAdjustments = (): { total: number; details: VATAdjustment[] } => {
  const adjustments = loadVATAdjustmentsFromStorage();
  const total = adjustments.reduce((sum, adj) => {
    return adj.type === 'addition' ? sum + adj.amount : sum - adj.amount;
  }, 0);
  
  return { total, details: adjustments };
};

// Calculate comprehensive financial summary
export interface FinancialSummary {
  // Revenue
  totalRevenue: number;
  totalRevenueWithVAT: number;
  automaticVATFromPayments: number;
  
  // Expenses
  totalSalaryExpenses: number;
  totalBusinessExpenses: number;
  totalVATFromExpenses: number;
  totalExpenses: number;
  
  // VAT Adjustments
  netVATAdjustments: number;
  vatAdjustmentDetails: VATAdjustment[];
  
  // Final Calculations
  adjustedRevenue: number;
  finalVATCollected: number;
  grossProfit: number;
  netProfit: number;
  
  // Breakdowns
  expenseBreakdown: {
    salaries: number;
    business: number;
    vatFromExpenses: number;
  };
  
  vatBreakdown: {
    fromPayments: number;
    fromAdjustments: number;
    fromExpenses: number;
    total: number;
  };
}

export const calculateFinancialSummary = (
  totalRevenue: number = 0,
  automaticVATFromPayments: number = 0
): FinancialSummary => {
  // Load all data
  const salaryExpenses = calculateMonthlySalaryExpenses();
  const businessExpenses = calculateMonthlyBusinessExpenses();
  const vatFromExpenses = calculateVATFromExpenses();
  const { total: netVATAdjustments, details: vatAdjustmentDetails } = calculateNetVATAdjustments();
  
  // Calculate totals
  const totalExpenses = salaryExpenses + businessExpenses;
  const adjustedRevenue = totalRevenue + netVATAdjustments;
  
  // VAT Collected = ONLY manual adjustments (no automatic VAT deduction)
  const finalVATCollected = netVATAdjustments;
  
  // Calculate profits - deduct employee expenses from revenue directly
  const grossRevenue = adjustedRevenue; // Total revenue with manual VAT adjustments
  const netRevenue = grossRevenue - totalExpenses; // Revenue minus ALL expenses (salaries + business)
  const grossProfit = grossRevenue; // No VAT deduction from profit
  const netProfit = netRevenue; // Same as net revenue since no VAT deduction
  
  console.log('💰 Financial Summary Debug:', {
    netVATAdjustments,
    finalVATCollected,
    vatAdjustmentDetails: vatAdjustmentDetails.length,
    adjustments: vatAdjustmentDetails
  });
  
  return {
    // Revenue
    totalRevenue,
    totalRevenueWithVAT: totalRevenue,
    automaticVATFromPayments,
    
    // Expenses
    totalSalaryExpenses: salaryExpenses,
    totalBusinessExpenses: businessExpenses,
    totalVATFromExpenses: vatFromExpenses,
    totalExpenses,
    
    // VAT Adjustments
    netVATAdjustments,
    vatAdjustmentDetails,
    
    // Final Calculations
    adjustedRevenue,
    finalVATCollected: finalVATCollected, // Show actual VAT adjustments (positive or negative)
    grossProfit,
    netProfit,
    
    // Breakdowns
    expenseBreakdown: {
      salaries: salaryExpenses,
      business: businessExpenses,
      vatFromExpenses: vatFromExpenses,
    },
    
    vatBreakdown: {
      fromPayments: 0, // Don't include automatic VAT in breakdown
      fromAdjustments: netVATAdjustments,
      fromExpenses: vatFromExpenses,
      total: finalVATCollected,
    },
  };
};

// Helper functions for CRUD operations
export const addEmployee = (employee: Omit<Employee, 'id'>): Employee => {
  const employees = loadEmployeesFromStorage();
  const newEmployee: Employee = {
    ...employee,
    id: Date.now().toString(),
  };
  
  const updatedEmployees = [...employees, newEmployee];
  saveEmployeesToStorage(updatedEmployees);
  return newEmployee;
};

export const updateEmployee = (id: string, updates: Partial<Employee>): boolean => {
  const employees = loadEmployeesFromStorage();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) return false;
  
  employees[index] = { ...employees[index], ...updates };
  saveEmployeesToStorage(employees);
  return true;
};

export const deleteEmployee = (id: string): boolean => {
  const employees = loadEmployeesFromStorage();
  const updatedEmployees = employees.filter(emp => emp.id !== id);
  
  if (updatedEmployees.length === employees.length) return false;
  
  saveEmployeesToStorage(updatedEmployees);
  return true;
};

export const addBusinessExpense = (expense: Omit<BusinessExpense, 'id'>): BusinessExpense => {
  const expenses = loadBusinessExpensesFromStorage();
  const newExpense: BusinessExpense = {
    ...expense,
    id: Date.now().toString(),
  };
  
  const updatedExpenses = [...expenses, newExpense];
  saveBusinessExpensesToStorage(updatedExpenses);
  return newExpense;
};

export const updateBusinessExpense = (id: string, updates: Partial<BusinessExpense>): boolean => {
  const expenses = loadBusinessExpensesFromStorage();
  const index = expenses.findIndex(exp => exp.id === id);
  
  if (index === -1) return false;
  
  expenses[index] = { ...expenses[index], ...updates };
  saveBusinessExpensesToStorage(expenses);
  return true;
};

export const deleteBusinessExpense = (id: string): boolean => {
  const expenses = loadBusinessExpensesFromStorage();
  const updatedExpenses = expenses.filter(exp => exp.id !== id);
  
  if (updatedExpenses.length === expenses.length) return false;
  
  saveBusinessExpensesToStorage(updatedExpenses);
  return true;
};

// Generate unique ID
export const generateUniqueId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}; 