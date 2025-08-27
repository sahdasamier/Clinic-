# Medical Requirements Counting System

This guide explains how to use the new medical requirements counting system that automatically tracks pending medical requirements for patients in Firestore.

## Overview

The system automatically maintains two fields on patient documents:
- `pendingRequirementsCount`: A numeric field showing the total number of pending medical requirements
- `hasPendingRequirements`: A boolean field indicating whether the patient has any pending requirements

## How It Works

### Automatic Updates

The system automatically updates these counts whenever:

1. **New requirement added**: Increments `pendingRequirementsCount` by 1 and sets `hasPendingRequirements` to `true`
2. **Requirement status changes**: 
   - From "pending" to any other status: Decrements count
   - To "pending" from any other status: Increments count
3. **Requirement deleted**: Decrements count if the requirement was pending
4. **Bulk operations**: Handles multiple requirement changes efficiently

### Firestore Integration

The system uses Firebase v9 Firestore with atomic operations:

```typescript
import { doc, updateDoc, increment } from "firebase/firestore";

// Increment count atomically
await updateDoc(patientDocRef, {
  pendingRequirementsCount: increment(1),
  hasPendingRequirements: true
});

// Decrement count atomically
await updateDoc(patientDocRef, {
  pendingRequirementsCount: increment(-1)
});
```

## Implementation Details

### Patient Interface Updates

The `Patient` interface now includes:

```typescript
export interface Patient {
  // ... existing fields ...
  
  // Medical requirements tracking
  pendingRequirementsCount?: number;
  hasPendingRequirements?: boolean;
  medicalRequirements?: Array<{
    id: string | number;
    title: string;
    type: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
    dateOrdered: string;
    dueDate?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    description?: string;
    orderedBy?: string;
  }>;
}
```

### PatientService Methods

New methods added to `PatientService`:

```typescript
// Update requirement counts (increment/decrement)
async updateRequirementCounts(patientId: string, increment: boolean = true): Promise<void>

// Set specific requirement count
async setRequirementCount(patientId: string, count: number): Promise<void>

// Recalculate counts from scratch
async recalculateRequirementCounts(patientId: string): Promise<void>
```

### MedicalRequirementsService Integration

The service automatically updates patient counts when:

- Creating new orders
- Updating order status
- Deleting orders

## Usage Examples

### Basic Count Updates

```typescript
import PatientService from '../services/PatientService';

// Increment count for new requirement
await PatientService.updateRequirementCounts(patientId, true);

// Decrement count for completed requirement
await PatientService.updateRequirementCounts(patientId, false);

// Set specific count
await PatientService.setRequirementCount(patientId, 5);
```

### Using the RequirementCountManager

```typescript
import RequirementCountManager from '../utils/requirementCountManager';

// Handle requirement addition
await RequirementCountManager.handleRequirementAdded(patientId);

// Handle status change
await RequirementCountManager.handleRequirementStatusChange(
  patientId, 
  'pending', 
  'completed'
);

// Batch updates
const updates = [
  { patientId: 'patient1', oldStatus: 'pending', newStatus: 'completed', increment: false },
  { patientId: 'patient2', oldStatus: 'in_progress', newStatus: 'pending', increment: true }
];
await RequirementCountManager.batchUpdateRequirementCounts(updates);
```

### Utility Functions

```typescript
import { requirementCountUtils } from '../utils/requirementCountManager';

// Check if status change affects counts
const isSignificant = requirementCountUtils.isStatusChangeSignificant('pending', 'completed');

// Get count change for transition
const change = requirementCountUtils.getCountChangeForStatusTransition('pending', 'completed');

// Format count for display
const displayText = requirementCountUtils.formatRequirementCount(3);
// Returns: "3 pending requirements"
```

## Data Migration

### For Existing Data

Use the provided migration script to update existing patient documents:

```bash
# Navigate to scripts directory
cd scripts

# Update requirement counts for a specific clinic
node update-patient-requirement-counts.js <clinic-id>
```

### Manual Migration

```typescript
import PatientService from '../services/PatientService';

// Recalculate counts for a specific patient
await PatientService.recalculateRequirementCounts(patientId);

// Or use the MedicalRequirementsService for bulk operations
import MedicalRequirementsService from '../services/MedicalRequirementsService';

// Recalculate all patients in a clinic
await MedicalRequirementsService.recalculateAllPatientRequirementCounts(clinicId);
```

## Error Handling

The system includes comprehensive error handling:

- Failed updates are logged with detailed error messages
- Patient count updates don't block requirement operations
- Fallback mechanisms for data consistency
- Validation tools to check count accuracy

## Best Practices

1. **Always use the provided methods** instead of manually updating counts
2. **Handle errors gracefully** - count update failures shouldn't break core functionality
3. **Use batch operations** when updating multiple requirements
4. **Validate counts periodically** using the validation tools
5. **Monitor logs** for any count update failures

## Monitoring and Debugging

### Log Messages

The system provides detailed logging:

```
✅ Incremented pending requirements count for patient: patient123
✅ Decremented patient requirement count for status change: patient456
⚠️ Failed to update patient requirement counts: Error message
```

### Validation

Use the validation tools to check count consistency:

```typescript
import RequirementCountManager from '../utils/requirementCountManager';

const validation = await RequirementCountManager.validateRequirementCounts(clinicId);
if (!validation.valid) {
  console.log('Count inconsistencies found:', validation.inconsistencies);
}
```

## Performance Considerations

- Count updates use atomic Firestore operations for consistency
- Batch operations minimize database calls
- Incremental updates avoid full recalculations
- Local storage backup provides offline resilience

## Troubleshooting

### Common Issues

1. **Counts not updating**: Check if PatientService is properly imported
2. **Permission errors**: Ensure Firestore rules allow patient document updates
3. **Inconsistent counts**: Use the recalculation methods to fix data
4. **Performance issues**: Use batch operations for multiple updates

### Debug Mode

Enable detailed logging by setting the log level in your environment:

```typescript
// Enable debug logging
console.log('🔍 Debug: Requirement count update details');
```

## Future Enhancements

Planned improvements include:

- Real-time count synchronization across multiple clients
- Advanced analytics and reporting
- Integration with notification systems
- Performance optimizations for large datasets
- Audit trail for count changes

## Support

For issues or questions about the medical requirements counting system:

1. Check the logs for error messages
2. Use the validation tools to identify inconsistencies
3. Review this documentation
4. Contact the development team

---

*Last updated: [Current Date]*
*Version: 1.0.0* 