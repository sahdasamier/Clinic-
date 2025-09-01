import { PatientService } from '@/services/PatientService';
import MedicalRequirementsService, { MedicalRequirementOrder } from '@/services/MedicalRequirementsService';

/**
 * Synchronizes completed medical requirements from the laboratoryRadiology system back to patient records
 */
export const syncCompletedRequirementToPatient = async (
  clinicId: string,
  orderId: string,
  completedOrder: MedicalRequirementOrder
): Promise<void> => {
  try {
    // Get the current patient data
    const patient = await PatientService.getPatientById(clinicId, completedOrder.patientId);
    if (!patient) {
      console.error('❌ Patient not found:', completedOrder.patientId);
      return;
    }

    // Find the corresponding requirement in the patient's medicalRequirements array
    // First try to match by originalPatientRequirementId, then by order ID if that fails
    const updatedMedicalRequirements = (patient.medicalRequirements || []).map((req: any) => {
      // Try matching by originalPatientRequirementId first (for lab/radiology completed orders)
      if (completedOrder.originalPatientRequirementId && 
          req.id?.toString() === completedOrder.originalPatientRequirementId) {
        return {
          ...req,
          status: 'completed',
          completedDate: completedOrder.completedDate,
          processedBy: completedOrder.processedBy,
          completionNotes: completedOrder.completionNotes,
          documents: completedOrder.documents || [],
        };
      }
      
      // Fallback to matching by order ID (for requirements completed directly in patient interface)
      if (req.id?.toString() === completedOrder.id) {
        return {
          ...req,
          status: 'completed',
          completedDate: completedOrder.completedDate,
          processedBy: completedOrder.processedBy,
          completionNotes: completedOrder.completionNotes,
          documents: completedOrder.documents || [],
        };
      }
      
      return req;
    });

    // Add completed documents to patient's documents array
    const newDocuments = (completedOrder.documents || []).map(doc => ({
      name: doc.name,
      url: doc.url,
      uploadDate: doc.uploadDate,
      type: doc.type,
      category: 'medical_requirement_result',
      size: doc.size,
      relatedRequirement: completedOrder.title,
    }));

    const updatedDocuments = [
      ...(patient.documents || []),
      ...newDocuments,
    ];

    // Update the patient with completed requirement and new documents
    await PatientService.updatePatient(completedOrder.patientId, {
      medicalRequirements: updatedMedicalRequirements,
      documents: updatedDocuments,
    });

    console.log('✅ Patient record updated with completed medical requirement');
  } catch (error) {
    console.error('❌ Error syncing completed requirement to patient:', error);
    throw error;
  }
};

/**
 * Creates a patient notification for completed medical requirement
 */
export const notifyPatientOfCompletedRequirement = async (
  clinicId: string,
  completedOrder: MedicalRequirementOrder
): Promise<void> => {
  try {
    // In a real implementation, this would:
    // 1. Send email notification to patient
    // 2. Create in-app notification
    // 3. Send SMS if configured
    // 4. Update patient portal with new documents

    console.log('📧 Notifying patient of completed requirement:', {
      patientName: completedOrder.patientName,
      requirementTitle: completedOrder.title,
      completedDate: completedOrder.completedDate,
      documentsCount: completedOrder.documents?.length || 0,
    });

    // Mark the order as delivered to patient
    await MedicalRequirementsService.deliverResultsToPatient(
      clinicId,
      completedOrder.id,
      'patient_portal'
    );

    console.log('✅ Patient notified of completed medical requirement');
  } catch (error) {
    console.error('❌ Error notifying patient of completed requirement:', error);
    throw error;
  }
};

/**
 * Complete workflow: sync to patient and notify
 */
export const completeRequirementWorkflow = async (
  clinicId: string,
  completedOrder: MedicalRequirementOrder
): Promise<void> => {
  try {
    // 1. Sync completed requirement back to patient record
    await syncCompletedRequirementToPatient(clinicId, completedOrder.id, completedOrder);
    
    // 2. Notify patient of completion
    await notifyPatientOfCompletedRequirement(clinicId, completedOrder);
    
    console.log('✅ Complete medical requirement workflow finished');
  } catch (error) {
    console.error('❌ Error in complete requirement workflow:', error);
    throw error;
  }
};

export default {
  syncCompletedRequirementToPatient,
  notifyPatientOfCompletedRequirement,
  completeRequirementWorkflow,
}; 