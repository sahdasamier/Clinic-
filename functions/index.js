const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Secure Cloud Function to update user permissions
 * Only verified super admins can call this function
 * 
 * Usage:
 * curl -X POST https://your-region-project.cloudfunctions.net/updateUserPermissions \
 *   -H "Authorization: Bearer $USER_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"userId": "user123", "permissions": {...}}'
 */
exports.updateUserPermissions = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function'
    );
  }

  // Verify user is super admin via custom claims
  const isAdmin = context.auth.token.admin === true;
  const isSuperAdminEmail = [
    'admin@sahdasclinic.com',
    'sahdasamier013@gmail.com'
  ].includes(context.auth.token.email);

  if (!isAdmin && !isSuperAdminEmail) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can update user permissions'
    );
  }

  // Validate input data
  const { userId, permissions, role, clinicId } = data;
  
  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId is required'
    );
  }

  try {
    // Build update object with only allowed fields
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.token.email
    };

    // Add permissions if provided
    if (permissions) {
      updateData.permissions = permissions;
    }

    // Add role if provided
    if (role) {
      updateData.role = role;
    }

    // Add clinic ID if provided
    if (clinicId) {
      updateData.clinicId = clinicId;
    }

    // Update user document
    await db.collection('users').doc(userId).update(updateData);

    functions.logger.info(`Permission update successful`, {
      userId,
      updatedBy: context.auth.token.email,
      fields: Object.keys(updateData)
    });

    return {
      success: true,
      message: 'User permissions updated successfully',
      updatedFields: Object.keys(updateData)
    };

  } catch (error) {
    functions.logger.error('Permission update failed', {
      userId,
      error: error.message,
      updatedBy: context.auth.token.email
    });

    throw new functions.https.HttpsError(
      'internal',
      'Failed to update user permissions: ' + error.message
    );
  }
});

/**
 * Cloud Function to create users securely
 * Only verified super admins can call this function
 */
exports.createUser = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated and is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const isAdmin = context.auth.token.admin === true;
  const isSuperAdminEmail = [
    'admin@sahdasclinic.com',
    'sahdasamier013@gmail.com'
  ].includes(context.auth.token.email);

  if (!isAdmin && !isSuperAdminEmail) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { email, password, firstName, lastName, role, clinicId } = data;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !role || !clinicId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false
    });

    // Create Firestore user document
    const userData = {
      email,
      firstName,
      lastName,
      role,
      clinicId,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.token.email
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    functions.logger.info('User created successfully', {
      userId: userRecord.uid,
      email,
      role,
      clinicId,
      createdBy: context.auth.token.email
    });

    return {
      success: true,
      userId: userRecord.uid,
      message: 'User created successfully'
    };

  } catch (error) {
    functions.logger.error('User creation failed', {
      email,
      error: error.message,
      createdBy: context.auth.token.email
    });

    throw new functions.https.HttpsError(
      'internal',
      'Failed to create user: ' + error.message
    );
  }
});

/**
 * Cloud Function to set admin claims
 * Can be called by existing super admins to grant admin status
 */
exports.setAdminClaims = functions.https.onCall(async (data, context) => {
  // Verify caller is authenticated and is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const isAdmin = context.auth.token.admin === true;
  const isSuperAdminEmail = [
    'admin@sahdasclinic.com',
    'sahdasamier013@gmail.com'
  ].includes(context.auth.token.email);

  if (!isAdmin && !isSuperAdminEmail) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { email, isAdminUser } = data;

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Set or remove admin claims
    const customClaims = isAdminUser ? {
      admin: true,
      role: 'super_admin',
      grantedBy: context.auth.token.email,
      grantedAt: Date.now()
    } : null;

    await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);

    functions.logger.info('Admin claims updated', {
      targetEmail: email,
      isAdmin: isAdminUser,
      updatedBy: context.auth.token.email
    });

    return {
      success: true,
      message: `Admin claims ${isAdminUser ? 'granted to' : 'removed from'} ${email}`
    };

  } catch (error) {
    functions.logger.error('Failed to update admin claims', {
      email,
      error: error.message,
      updatedBy: context.auth.token.email
    });

    throw new functions.https.HttpsError(
      'internal',
      'Failed to update admin claims: ' + error.message
    );
  }
});

/**
 * Audit log function - logs all permission changes
 */
exports.logPermissionChange = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;

    // Check if permissions or role changed
    const permissionsChanged = JSON.stringify(before.permissions) !== JSON.stringify(after.permissions);
    const roleChanged = before.role !== after.role;
    const clinicChanged = before.clinicId !== after.clinicId;

    if (permissionsChanged || roleChanged || clinicChanged) {
      // Log the change
      await db.collection('permission_audit_log').add({
        userId,
        userEmail: after.email,
        changes: {
          permissions: {
            before: before.permissions,
            after: after.permissions
          },
          role: {
            before: before.role,
            after: after.role
          },
          clinicId: {
            before: before.clinicId,
            after: after.clinicId
          }
        },
        changedBy: after.updatedBy,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      functions.logger.info('Permission change logged', {
        userId,
        changedBy: after.updatedBy,
        permissionsChanged,
        roleChanged,
        clinicChanged
      });
    }
  }); 