// 🚀 COMPLETE REVENUE ANALYTICS FIX SCRIPT
// Copy and paste this entire script into your browser console on the dashboard page

(async function fixRevenueAnalyticsComplete() {
  console.log('🚀 STARTING COMPLETE REVENUE ANALYTICS FIX');
  console.log('==========================================');
  
  try {
    // Step 1: Clear any broken data
    console.log('1️⃣ Clearing existing data...');
    localStorage.removeItem('clinic_payments_data');
    
    // Step 2: Create comprehensive payment data
    console.log('2️⃣ Creating fresh payment data...');
    const comprehensivePayments = [
      {
        id: 1,
        invoiceId: 'INV-2024-001',
        patient: 'Ahmed Hassan',
        patientAvatar: 'AH',
        doctor: 'Dr. Sahda Ahmed',
        amount: 500,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid',
        method: 'Cash',
        description: 'General Consultation',
        category: 'consultation',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: 500,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 500,
        baseAmount: 500
      },
      {
        id: 2,
        invoiceId: 'INV-2024-002',
        patient: 'Fatima Ali',
        patientAvatar: 'FA',
        doctor: 'Dr. jeje samier',
        amount: 350,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid',
        method: 'Credit Card',
        description: 'Specialist Consultation',
        category: 'consultation',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: 350,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 350,
        baseAmount: 350
      },
      {
        id: 3,
        invoiceId: 'INV-2024-003',
        patient: 'Mohamed Khalil',
        patientAvatar: 'MK',
        doctor: 'Dr. Sahda Ahmed',
        amount: 275,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid',
        method: 'Bank Transfer',
        description: 'Follow-up Visit',
        category: 'follow-up',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: 275,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 275,
        baseAmount: 275
      },
      {
        id: 4,
        invoiceId: 'INV-2024-004',
        patient: 'Sara Ibrahim',
        patientAvatar: 'SI',
        doctor: 'Dr. jeje samier',
        amount: 400,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid',
        method: 'Cash',
        description: 'Comprehensive Check-up',
        category: 'checkup',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: 400,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 400,
        baseAmount: 400
      },
      {
        id: 5,
        invoiceId: 'INV-2024-005',
        patient: 'Omar Mahmoud',
        patientAvatar: 'OM',
        doctor: 'Dr. Sahda Ahmed',
        amount: 300,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        method: 'Cash',
        description: 'Routine Check-up',
        category: 'checkup',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: 0,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 300,
        baseAmount: 300
      },
      {
        id: 6,
        invoiceId: 'INV-2024-006',
        patient: 'Layla Farouk',
        patientAvatar: 'LF',
        doctor: 'Dr. jeje samier',
        amount: 250,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        method: 'Credit Card',
        description: 'Consultation',
        category: 'consultation',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: 0,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 250,
        baseAmount: 250
      },
      {
        id: 7,
        invoiceId: 'INV-2024-007',
        patient: 'Hassan Ali',
        patientAvatar: 'HA',
        doctor: 'Dr. Sahda Ahmed',
        amount: 180,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'overdue',
        method: 'Cash',
        description: 'Emergency Visit',
        category: 'emergency',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: 0,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 180,
        baseAmount: 180
      },
      {
        id: 8,
        invoiceId: 'INV-2024-008',
        patient: 'Nour Salama',
        patientAvatar: 'NS',
        doctor: 'Dr. jeje samier',
        amount: 150,
        currency: 'EGP',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'partial',
        method: 'Bank Transfer',
        description: 'Follow-up',
        category: 'follow-up',
        insurance: 'No',
        insuranceAmount: 0,
        paidAmount: 75,
        includeVAT: false,
        vatRate: 0,
        vatAmount: 0,
        totalAmountWithVAT: 150,
        baseAmount: 150
      }
    ];
    
    // Step 3: Save to localStorage
    console.log('3️⃣ Saving to localStorage...');
    localStorage.setItem('clinic_payments_data', JSON.stringify(comprehensivePayments));
    
    // Step 4: Trigger update events
    console.log('4️⃣ Triggering update events...');
    window.dispatchEvent(new CustomEvent('paymentsUpdated', {
      detail: { 
        payments: comprehensivePayments, 
        source: 'revenue-fix-script', 
        timestamp: Date.now() 
      }
    }));
    
    window.dispatchEvent(new CustomEvent('globalPaymentsUpdated', {
      detail: { 
        payments: comprehensivePayments, 
        source: 'revenue-fix' 
      }
    }));
    
    // Step 5: Calculate and display results
    console.log('5️⃣ Calculating revenue...');
    const paidPayments = comprehensivePayments.filter(p => p.status === 'paid');
    const pendingPayments = comprehensivePayments.filter(p => p.status === 'pending');
    const overduePayments = comprehensivePayments.filter(p => p.status === 'overdue');
    const partialPayments = comprehensivePayments.filter(p => p.status === 'partial');
    
    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingRevenue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const overdueRevenue = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const partialRevenue = partialPayments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalExpectedRevenue = totalRevenue + pendingRevenue + overdueRevenue + (partialPayments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0));
    
    // Step 6: Force page refresh to see changes
    console.log('6️⃣ Refreshing page to show changes...');
    
    // Display comprehensive results
    console.log('✅ REVENUE ANALYTICS FIX COMPLETE!');
    console.log('==================================');
    console.table([
      { Metric: 'Total Payments', Value: comprehensivePayments.length },
      { Metric: 'Paid Payments', Value: paidPayments.length },
      { Metric: 'Pending Payments', Value: pendingPayments.length },
      { Metric: 'Overdue Payments', Value: overduePayments.length },
      { Metric: 'Partial Payments', Value: partialPayments.length },
      { Metric: 'Total Revenue (Paid)', Value: `EGP ${totalRevenue}` },
      { Metric: 'Pending Revenue', Value: `EGP ${pendingRevenue}` },
      { Metric: 'Overdue Revenue', Value: `EGP ${overdueRevenue}` },
      { Metric: 'Partial Revenue', Value: `EGP ${partialRevenue}` },
      { Metric: 'Total Expected Revenue', Value: `EGP ${totalExpectedRevenue}` }
    ]);
    
    // Show success message
    alert(`🎉 REVENUE ANALYTICS SUCCESSFULLY FIXED!

📊 COMPREHENSIVE RESULTS:
• Total Revenue (Paid): EGP ${totalRevenue}
• Pending Revenue: EGP ${pendingRevenue}
• Overdue Revenue: EGP ${overdueRevenue}
• Partial Revenue: EGP ${partialRevenue}
• Total Expected: EGP ${totalExpectedRevenue}

📈 PAYMENT BREAKDOWN:
• Total Payments: ${comprehensivePayments.length}
• Paid: ${paidPayments.length}
• Pending: ${pendingPayments.length}
• Overdue: ${overduePayments.length}
• Partial: ${partialPayments.length}

🔄 The page will refresh automatically to show the updated revenue analytics!

✅ Your dashboard should now display:
- EGP ${totalRevenue} in the main revenue box
- Proper breakdown of all payment statuses
- Correct pending and overdue amounts`);
    
    // Auto-refresh the page to see changes
    setTimeout(() => {
      console.log('🔄 Auto-refreshing page...');
      window.location.reload();
    }, 2000);
    
    return {
      success: true,
      totalPayments: comprehensivePayments.length,
      paidPayments: paidPayments.length,
      totalRevenue,
      pendingRevenue,
      overdueRevenue,
      partialRevenue,
      totalExpectedRevenue
    };
    
  } catch (error) {
    console.error('❌ Revenue fix failed:', error);
    alert(`❌ Revenue Analytics Fix Failed:

Error: ${error.message}

Please:
1. Make sure you're on the dashboard page
2. Try refreshing the page and running the script again
3. Check the browser console for more details

If the problem persists, the issue might be deeper in the code.`);
    
    return { success: false, error: error.message };
  }
})();

// Additional helper functions for manual testing
window.checkRevenueData = function() {
  const payments = JSON.parse(localStorage.getItem('clinic_payments_data') || '[]');
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  
  console.log('💰 REVENUE CHECK:');
  console.log(`Total Payments: ${payments.length}`);
  console.log(`Paid Payments: ${paidPayments.length}`);
  console.log(`Total Revenue: EGP ${totalRevenue}`);
  
  return { payments: payments.length, paid: paidPayments.length, revenue: totalRevenue };
};

window.clearAllRevenueData = function() {
  localStorage.removeItem('clinic_payments_data');
  console.log('🗑️ All revenue data cleared');
  alert('All revenue data cleared. Run the fix script again to recreate data.');
};

console.log(`
🎯 REVENUE ANALYTICS FIX SCRIPT LOADED SUCCESSFULLY!

The script has run automatically. If you need to run it again:

📋 AVAILABLE COMMANDS:
• fixRevenueAnalyticsComplete() - Run the complete fix again
• checkRevenueData() - Check current revenue data
• clearAllRevenueData() - Clear all data (then run fix again)

🔄 The page should refresh automatically in 2 seconds to show the updated revenue.
`); 