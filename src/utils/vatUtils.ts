import { VATSettings, defaultVATSettings } from '../data/mockData';

// Get VAT settings - FIXED: Re-enabled localStorage persistence
export const getVATSettings = (): VATSettings => {
  try {
    const stored = localStorage.getItem('clinic_vat_settings');
    if (stored) {
      const settings = JSON.parse(stored);
      console.log('✅ getVATSettings: Loaded from localStorage');
      return settings;
    }
  } catch (error) {
    console.error('❌ getVATSettings: localStorage error:', error);
  }
  
  console.log('📝 getVATSettings: Using default VAT settings');
  return defaultVATSettings;
};

// Save VAT settings - FIXED: Re-enabled localStorage persistence
export const saveVATSettings = (settings: VATSettings): void => {
  try {
    localStorage.setItem('clinic_vat_settings', JSON.stringify(settings));
    console.log('✅ saveVATSettings: Saved to localStorage');
    
    // Trigger event for cross-page communication
    window.dispatchEvent(new CustomEvent('vatSettingsUpdated', { detail: { settings } }));
    console.log('📢 VAT settings update event dispatched');
  } catch (error) {
    console.error('❌ saveVATSettings: localStorage error:', error);
    
    // Even if localStorage fails, still dispatch the event
    window.dispatchEvent(new CustomEvent('vatSettingsUpdated', { detail: { settings } }));
    console.log('📢 VAT settings update event dispatched (localStorage failed)');
  }
};

export interface VATCalculation {
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmountWithVAT: number;
  includeVAT: boolean;
}

// Calculate VAT amounts
export const calculateVAT = (
  baseAmount: number,
  vatRate: number,
  includeVAT: boolean = false
): VATCalculation => {
  const vatAmount = includeVAT ? (baseAmount * vatRate) / 100 : 0;
  const totalAmountWithVAT = baseAmount + vatAmount;

  return {
    baseAmount,
    vatRate,
    vatAmount,
    totalAmountWithVAT,
    includeVAT,
  };
};

// Calculate profit with enhanced VAT consideration
export const calculateProfitWithVAT = (
  totalRevenue: number,
  totalInsurance: number,
  totalVATDeducted: number,
  includeVATInRevenue: boolean = false
): {
  grossRevenue: number;
  netRevenue: number;
  insuranceDeductions: number;
  vatDeductions: number;
  finalProfit: number;
} => {
  const grossRevenue = totalRevenue;
  
  // Enhanced VAT logic: Only deduct VAT if it's actually included in revenue AND there's VAT to deduct
  const vatDeductions = (includeVATInRevenue && totalVATDeducted > 0) ? totalVATDeducted : 0;
  
  // Net revenue after VAT (only if VAT was actually included in payments)
  const netRevenue = grossRevenue - vatDeductions;
  
  // Final profit calculation (revenue minus insurance minus VAT if applicable)
  const finalProfit = netRevenue - totalInsurance;

  return {
    grossRevenue,
    netRevenue,
    insuranceDeductions: totalInsurance,
    vatDeductions,
    finalProfit,
  };
};

// Format currency with proper locale
export const formatCurrencyWithVAT = (
  amount: number,
  currency: string = 'EGP',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ` ${currency}`;
};

// Validate VAT rate
export const validateVATRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 100;
};

// Get VAT display text
export const getVATDisplayText = (
  calculation: VATCalculation,
  t: (key: string) => string
): {
  baseText: string;
  vatText: string;
  totalText: string;
} => {
  return {
    baseText: `${t('base_amount')}: ${formatCurrencyWithVAT(calculation.baseAmount)}`,
    vatText: calculation.includeVAT 
      ? `${t('vat_amount')} (${calculation.vatRate}%): ${formatCurrencyWithVAT(calculation.vatAmount)}`
      : `${t('vat_not_included')}`,
    totalText: calculation.includeVAT
      ? `${t('total_with_vat')}: ${formatCurrencyWithVAT(calculation.totalAmountWithVAT)}`
      : `${t('total_amount')}: ${formatCurrencyWithVAT(calculation.baseAmount)}`,
  };
};

// Calculate reverse VAT (when total amount includes VAT)
export const calculateReverseVAT = (
  totalAmountIncludingVAT: number,
  vatRate: number
): VATCalculation => {
  const baseAmount = totalAmountIncludingVAT / (1 + vatRate / 100);
  const vatAmount = totalAmountIncludingVAT - baseAmount;

  return {
    baseAmount,
    vatRate,
    vatAmount,
    totalAmountWithVAT: totalAmountIncludingVAT,
    includeVAT: true,
  };
};

// VATCalculation type is already exported as interface above 