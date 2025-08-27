const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
  admin.initializeApp();
const db = admin.firestore();

// ✅ APPOINTMENT TRIGGERS
exports.onAppointmentCreated = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { appointmentId, ...appointmentData } = data;
    
    console.log('🔔 Processing new appointment:', appointmentId);

    // Create notifications for doctor and patient
    const notifications = [];

    // Notification for doctor
    if (appointmentData.doctorId) {
      notifications.push({
        userId: appointmentData.doctorId,
        type: 'appointment_scheduled',
        title: 'New Appointment Scheduled',
        message: `New appointment with ${appointmentData.patientName} on ${new Date(appointmentData.date).toLocaleDateString()}`,
        data: { appointmentId, type: 'appointment' },
        priority: 'medium',
        read: false,
        clinicId: appointmentData.clinicId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });
    }

    // Notification for patient (if patient has user account)
    if (appointmentData.patientId) {
      notifications.push({
        userId: appointmentData.patientId,
        type: 'appointment_confirmation',
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. ${appointmentData.doctorName} is confirmed for ${new Date(appointmentData.date).toLocaleDateString()}`,
        data: { appointmentId, type: 'appointment' },
        priority: 'high',
        read: false,
        clinicId: appointmentData.clinicId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      });
    }

    // Batch write notifications
    if (notifications.length > 0) {
      const batch = db.batch();
      notifications.forEach(notification => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, notification);
      });
      await batch.commit();
    }

    // Update appointment statistics
    await updateClinicStats(appointmentData.clinicId, 'appointments', 1);

    // Schedule reminder notifications (24 hours before)
    const appointmentDate = new Date(appointmentData.date);
    const reminderDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    
    if (reminderDate > new Date()) {
      await scheduleAppointmentReminder(appointmentId, appointmentData, reminderDate);
    }

    console.log('✅ Appointment processing completed');
    return { success: true, notificationsCreated: notifications.length };

  } catch (error) {
    console.error('❌ Error processing appointment:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process appointment');
  }
});

exports.onAppointmentUpdated = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { appointmentId, updates } = data;
    
    console.log('🔄 Processing appointment update:', appointmentId);

    // Get original appointment data
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();
    
    if (!appointmentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Appointment not found');
    }

    const originalData = appointmentDoc.data();

    // Create notifications for significant changes
    const notifications = [];

    // Status change notifications
    if (updates.status && updates.status !== originalData.status) {
      if (updates.status === 'cancelled') {
        // Notify both doctor and patient about cancellation
        if (originalData.doctorId) {
          notifications.push({
            userId: originalData.doctorId,
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled',
            message: `Appointment with ${originalData.patientName} has been cancelled`,
            data: { appointmentId, type: 'appointment' },
            priority: 'high',
            read: false,
            clinicId: originalData.clinicId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          });
        }

        if (originalData.patientId) {
          notifications.push({
            userId: originalData.patientId,
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled',
            message: `Your appointment with Dr. ${originalData.doctorName} has been cancelled`,
            data: { appointmentId, type: 'appointment' },
            priority: 'high',
            read: false,
            clinicId: originalData.clinicId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          });
    }
      }

      if (updates.status === 'completed') {
        // Create payment reminder if needed
        if (!originalData.paymentId) {
          notifications.push({
            userId: originalData.patientId,
            type: 'payment_reminder',
            title: 'Payment Due',
            message: `Please complete payment for your appointment with Dr. ${originalData.doctorName}`,
            data: { appointmentId, type: 'payment' },
            priority: 'medium',
            read: false,
            clinicId: originalData.clinicId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          });
        }
      }
    }

    // Date/time change notifications
    if (updates.date && updates.date !== originalData.date) {
      if (originalData.doctorId) {
        notifications.push({
          userId: originalData.doctorId,
          type: 'appointment_rescheduled',
          title: 'Appointment Rescheduled',
          message: `Appointment with ${originalData.patientName} has been rescheduled to ${new Date(updates.date).toLocaleDateString()}`,
          data: { appointmentId, type: 'appointment' },
          priority: 'medium',
          read: false,
          clinicId: originalData.clinicId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true
        });
      }

      if (originalData.patientId) {
        notifications.push({
          userId: originalData.patientId,
          type: 'appointment_rescheduled',
          title: 'Appointment Rescheduled',
          message: `Your appointment with Dr. ${originalData.doctorName} has been rescheduled to ${new Date(updates.date).toLocaleDateString()}`,
          data: { appointmentId, type: 'appointment' },
          priority: 'high',
          read: false,
          clinicId: originalData.clinicId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true
        });
      }
    }

    // Batch write notifications
    if (notifications.length > 0) {
      const batch = db.batch();
      notifications.forEach(notification => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, notification);
      });
      await batch.commit();
    }

    console.log('✅ Appointment update processing completed');
    return { success: true, notificationsCreated: notifications.length };

  } catch (error) {
    console.error('❌ Error processing appointment update:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process appointment update');
  }
});

// ✅ PATIENT TRIGGERS
exports.onPatientDeleted = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { patientId } = data;
    
    console.log('🗑️ Processing patient deletion:', patientId);

    // Cancel all future appointments
    const futureAppointments = await db.collection('appointments')
      .where('patientId', '==', patientId)
      .where('date', '>', new Date())
      .where('isActive', '==', true)
      .get();

    if (!futureAppointments.empty) {
      const batch = db.batch();
      futureAppointments.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'cancelled',
          cancelledReason: 'Patient deleted',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }

    // Archive payment records (don't delete for audit purposes)
    const payments = await db.collection('payments')
      .where('patientId', '==', patientId)
      .where('isActive', '==', true)
      .get();

    if (!payments.empty) {
      const batch = db.batch();
      payments.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'archived',
          archivedReason: 'Patient deleted',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }

    console.log('✅ Patient deletion processing completed');
    return {
      success: true,
      appointmentsCancelled: futureAppointments.size,
      paymentsArchived: payments.size 
    };

  } catch (error) {
    console.error('❌ Error processing patient deletion:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process patient deletion');
  }
});

// ✅ INVENTORY MANAGEMENT
exports.checkLowStock = functions.pubsub.schedule('every 6 hours').onRun(async (context) => {
  try {
    console.log('🔍 Checking for low stock items...');

    const laboratoryRadiologySnapshot = await db.collection('laboratoryRadiology')
      .where('isActive', '==', true)
      .get();

    const lowStockItems = [];
    const outOfStockItems = [];

    laboratoryRadiologySnapshot.docs.forEach(doc => {
      const item = doc.data();
      const currentStock = item.currentStock || 0;
      const minStock = item.minStock || 0;

      if (currentStock === 0) {
        outOfStockItems.push({ id: doc.id, ...item });
      } else if (currentStock <= minStock) {
        lowStockItems.push({ id: doc.id, ...item });
      }
    });

    // Create notifications for low stock and out of stock items
    if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
      const batch = db.batch();

      // Get clinic administrators
      const adminUsers = await db.collection('users')
        .where('role', 'in', ['admin', 'manager'])
        .where('isActive', '==', true)
        .get();

      adminUsers.docs.forEach(adminDoc => {
        const admin = adminDoc.data();

        if (outOfStockItems.length > 0) {
          const notificationRef = db.collection('notifications').doc();
          batch.set(notificationRef, {
            userId: admin.id,
            type: 'laboratoryRadiology_out_of_stock',
            title: 'Items Out of Stock',
            message: `${outOfStockItems.length} items are out of stock and need restocking`,
            data: { items: outOfStockItems.map(item => ({ id: item.id, name: item.name })) },
            priority: 'high',
            read: false,
            clinicId: admin.clinicId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          });
  }

        if (lowStockItems.length > 0) {
          const notificationRef = db.collection('notifications').doc();
          batch.set(notificationRef, {
            userId: admin.id,
            type: 'laboratoryRadiology_low_stock',
            title: 'Low Stock Alert',
            message: `${lowStockItems.length} items are running low on stock`,
            data: { items: lowStockItems.map(item => ({ id: item.id, name: item.name, currentStock: item.currentStock, minStock: item.minStock })) },
            priority: 'medium',
            read: false,
            clinicId: admin.clinicId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          });
        }
      });

      await batch.commit();
    }

    console.log(`✅ Inventory check completed. Low stock: ${lowStockItems.length}, Out of stock: ${outOfStockItems.length}`);
    return { lowStockItems: lowStockItems.length, outOfStockItems: outOfStockItems.length };

  } catch (error) {
    console.error('❌ Error checking laboratoryRadiology:', error);
    throw error;
  }
});

// ✅ PAYMENT PROCESSING
exports.onPaymentProcessed = functions.firestore
  .document('payments/{paymentId}')
  .onWrite(async (change, context) => {
    try {
      const paymentId = context.params.paymentId;
      const beforeData = change.before.exists ? change.before.data() : null;
      const afterData = change.after.exists ? change.after.data() : null;

      // Skip if payment is being deleted
      if (!afterData) return null;

      // Check if payment status changed to completed
      if (beforeData?.status !== 'completed' && afterData.status === 'completed') {
        console.log('💰 Processing completed payment:', paymentId);

        // Update appointment status if linked
        if (afterData.appointmentId) {
          await db.collection('appointments').doc(afterData.appointmentId).update({
            paymentStatus: 'paid',
            paymentId: paymentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
  }

        // Create receipt notification
        if (afterData.patientId) {
          await db.collection('notifications').add({
            userId: afterData.patientId,
            type: 'payment_receipt',
            title: 'Payment Received',
            message: `Your payment of $${afterData.amount} has been successfully processed`,
            data: { paymentId, amount: afterData.amount, type: 'payment' },
            priority: 'low',
            read: false,
            clinicId: afterData.clinicId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
          });
        }

        // Update clinic revenue statistics
        await updateClinicStats(afterData.clinicId, 'revenue', afterData.amount);
      }

      return null;
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      return null;
    }
  });

// ✅ APPOINTMENT REMINDERS
async function scheduleAppointmentReminder(appointmentId, appointmentData, reminderDate) {
  // In a real implementation, you'd use Cloud Tasks or another scheduling service
  // For this example, we'll create a scheduled function
  
  console.log(`📅 Scheduling reminder for appointment ${appointmentId} at ${reminderDate}`);
  
  // Store reminder in a collection to be processed by a scheduled function
  await db.collection('appointment_reminders').add({
    appointmentId,
    patientId: appointmentData.patientId,
    doctorId: appointmentData.doctorId,
    appointmentDate: appointmentData.date,
    reminderDate,
    status: 'pending',
    clinicId: appointmentData.clinicId,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

// Process appointment reminders (runs every hour)
exports.processAppointmentReminders = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const reminders = await db.collection('appointment_reminders')
      .where('status', '==', 'pending')
      .where('reminderDate', '<=', oneHourFromNow)
      .get();

    if (reminders.empty) {
      console.log('No reminders to process');
      return null;
    }

    const batch = db.batch();
    const notifications = [];

    reminders.docs.forEach(reminderDoc => {
      const reminder = reminderDoc.data();
      
      // Create notification for patient
      if (reminder.patientId) {
        notifications.push({
          userId: reminder.patientId,
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          message: `You have an appointment tomorrow at ${new Date(reminder.appointmentDate).toLocaleTimeString()}`,
          data: { appointmentId: reminder.appointmentId, type: 'appointment' },
          priority: 'high',
          read: false,
          clinicId: reminder.clinicId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isActive: true
        });
      }

      // Mark reminder as sent
      batch.update(reminderDoc.ref, {
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Create notifications
    notifications.forEach(notification => {
      const notificationRef = db.collection('notifications').doc();
      batch.set(notificationRef, notification);
    });

    await batch.commit();

    console.log(`✅ Processed ${reminders.size} appointment reminders`);
    return { remindersProcessed: reminders.size };

  } catch (error) {
    console.error('❌ Error processing reminders:', error);
    throw error;
  }
});

// ✅ UTILITY FUNCTIONS
async function updateClinicStats(clinicId, statType, value) {
  try {
    const statsRef = db.collection('clinic_stats').doc(clinicId);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    await statsRef.set({
      [statType]: {
        [currentMonth]: admin.firestore.FieldValue.increment(value),
        total: admin.firestore.FieldValue.increment(value)
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

  } catch (error) {
    console.error('❌ Error updating clinic stats:', error);
  }
}

// ✅ DATA CLEANUP FUNCTIONS
exports.cleanupOldNotifications = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    console.log('🧹 Cleaning up old notifications...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldNotifications = await db.collection('notifications')
      .where('createdAt', '<', thirtyDaysAgo)
      .where('read', '==', true)
      .limit(500) // Process in batches
      .get();

    if (oldNotifications.empty) {
      console.log('No old notifications to clean up');
      return null;
    }

    const batch = db.batch();
    oldNotifications.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`✅ Deleted ${oldNotifications.size} old notifications`);
    return { deletedCount: oldNotifications.size };

  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
    throw error;
  }
});

// ✅ REAL-TIME SYNC HEALTH CHECK
exports.healthCheck = functions.https.onRequest(async (req, res) => {
  try {
    // Check Firestore connectivity
    const testDoc = await db.collection('health_check').doc('test').get();
    
    // Check if all required collections exist
    const collections = ['appointments', 'patients', 'payments', 'laboratoryRadiology', 'notifications'];
    const collectionChecks = await Promise.all(
      collections.map(async (collectionName) => {
        try {
          const snapshot = await db.collection(collectionName).limit(1).get();
          return { collection: collectionName, status: 'ok', count: snapshot.size };
        } catch (error) {
          return { collection: collectionName, status: 'error', error: error.message };
          }
      })
    );

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      firestore: 'connected',
      collections: collectionChecks
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
      });
    }
  }); 