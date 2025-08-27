import PatientService from '../services/PatientService';
import { MedicalRequirementOrder } from '../services/MedicalRequirementsService';

/**
 * Interface for requirement count updates
 */
export interface RequirementCountUpdate {
  patientId: string;
  oldStatus?: string;
  newStatus: string;
  increment: boolean;
}

/**
 * Manages medical requirement counts for patients
 */
export class RequirementCountManager {
  
  /**
   * Update patient requirement counts when a requirement is added
   */
  static async handleRequirementAdded(patientId: string): Promise<void> {
    try {
      await PatientService.updateRequirementCounts(patientId, true);
      console.log('✅ Incremented requirement count for new requirement:', patientId);
    } catch (error) {
      console.error('❌ Failed to increment requirement count:', error);
      throw error;
    }
  }

  /**
   * Update patient requirement counts when a requirement status changes
   */
  static async handleRequirementStatusChange(
    patientId: string, 
    oldStatus: string, 
    newStatus: string
  ): Promise<void> {
    try {
      // If status changed from pending to something else, decrement count
      if (oldStatus === 'pending' && newStatus !== 'pending') {
        await PatientService.updateRequirementCounts(patientId, false);
        console.log('✅ Decremented requirement count for status change:', patientId);
      }
      // If status changed to pending from something else, increment count
      else if (oldStatus !== 'pending' && newStatus === 'pending') {
        await PatientService.updateRequirementCounts(patientId, true);
        console.log('✅ Incremented requirement count for status change:', patientId);
      }
      // No count change needed for other status transitions
      else {
        console.log('ℹ️ No count change needed for status transition:', oldStatus, '->', newStatus);
      }
    } catch (error) {
      console.error('❌ Failed to update requirement count for status change:', error);
      throw error;
    }
  }

  /**
   * Update patient requirement counts when a requirement is deleted
   */
  static async handleRequirementDeleted(patientId: string, wasPending: boolean): Promise<void> {
    try {
      if (wasPending) {
        await PatientService.updateRequirementCounts(patientId, false);
        console.log('✅ Decremented requirement count for deleted requirement:', patientId);
      }
    } catch (error) {
      console.error('❌ Failed to update requirement count for deletion:', error);
      throw error;
    }
  }

  /**
   * Batch update requirement counts for multiple patients
   */
  static async batchUpdateRequirementCounts(updates: RequirementCountUpdate[]): Promise<void> {
    try {
      console.log(`🔄 Starting batch update for ${updates.length} requirement count changes`);
      
      const updatePromises = updates.map(update => {
        if (update.increment) {
          return PatientService.updateRequirementCounts(update.patientId, true);
        } else {
          return PatientService.updateRequirementCounts(update.patientId, false);
        }
      });
      
      await Promise.all(updatePromises);
      console.log('✅ Batch requirement count update completed successfully');
      
    } catch (error) {
      console.error('❌ Failed to batch update requirement counts:', error);
      throw error;
    }
  }

  /**
   * Recalculate requirement counts for a specific patient
   */
  static async recalculatePatientRequirementCounts(patientId: string): Promise<void> {
    try {
      await PatientService.recalculateRequirementCounts(patientId);
      console.log('✅ Recalculated requirement counts for patient:', patientId);
    } catch (error) {
      console.error('❌ Failed to recalculate requirement counts for patient:', error);
      throw error;
    }
  }

  /**
   * Get current requirement count for a patient
   */
  static async getPatientRequirementCount(patientId: string): Promise<{
    pendingCount: number;
    hasPending: boolean;
  }> {
    try {
      // This would need to be implemented in PatientService or fetched directly
      // For now, we'll return a placeholder
      console.log('ℹ️ Getting requirement count for patient:', patientId);
      return {
        pendingCount: 0,
        hasPending: false
      };
    } catch (error) {
      console.error('❌ Failed to get requirement count for patient:', error);
      throw error;
    }
  }

  /**
   * Validate requirement count consistency
   */
  static async validateRequirementCounts(clinicId: string): Promise<{
    valid: boolean;
    inconsistencies: Array<{
      patientId: string;
      expectedCount: number;
      actualCount: number;
      difference: number;
    }>;
  }> {
    try {
      console.log('🔍 Validating requirement count consistency for clinic:', clinicId);
      
      // This would need to be implemented to compare actual counts with expected counts
      // For now, return a placeholder
      return {
        valid: true,
        inconsistencies: []
      };
    } catch (error) {
      console.error('❌ Failed to validate requirement counts:', error);
      throw error;
    }
  }
}

/**
 * Utility functions for requirement count management
 */
export const requirementCountUtils = {
  /**
   * Check if a status change affects requirement counts
   */
  isStatusChangeSignificant(oldStatus: string, newStatus: string): boolean {
    return (oldStatus === 'pending') !== (newStatus === 'pending');
  },

  /**
   * Get the count change for a status transition
   */
  getCountChangeForStatusTransition(oldStatus: string, newStatus: string): number {
    if (oldStatus === 'pending' && newStatus !== 'pending') {
      return -1; // Decrement
    } else if (oldStatus !== 'pending' && newStatus === 'pending') {
      return 1; // Increment
    }
    return 0; // No change
  },

  /**
   * Format requirement count for display
   */
  formatRequirementCount(count: number): string {
    if (count === 0) return 'No pending requirements';
    if (count === 1) return '1 pending requirement';
    return `${count} pending requirements`;
  }
};

export default RequirementCountManager; 