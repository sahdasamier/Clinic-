import MedicalRequirementsService, { MedicalRequirementOrder } from '@/services/MedicalRequirementsService';
import { Patient } from '@/types/models';

/**
 * Add a medical requirement to a patient
 * @param clinicId - The clinic ID
 * @param patient - The patient object
 * @param requirementData - The requirement data to add
 * @returns Promise<string> - The ID of the created order
 */
export const addMedicalRequirementToPatient = async (
  clinicId: string,
  patient: Patient,
  requirementData: {
    title: string;
    type: string;
    description: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    dueDate?: string;
    category?: string;
  }
): Promise<string> => {
  try {
    // Prepare the order data for MedicalRequirementsService
    const orderData: Omit<MedicalRequirementOrder, 'id' | 'createdAt' | 'updatedAt' | 'clinicId' | 'isActive'> = {
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientPhone: patient.phone,
      patientGender: patient.gender,
      patientEmail: patient.email,
      patientBloodType: patient.bloodType,
      patientAllergies: patient.allergies,
      patientCondition: patient.condition,
      patientInsurance: patient.insuranceProvider,
      requirementType: requirementData.type as any,
      title: requirementData.title,
      description: requirementData.description,
      category: requirementData.category || (requirementData.type === 'lab' ? 'Laboratory Tests' : 
               requirementData.type === 'imaging' ? 'Radiology' : 
               'Other Tests'),
      priority: requirementData.priority,
      status: 'pending',
      workflow_stage: 'ordered',
      dateOrdered: new Date().toISOString().split('T')[0],
      dueDate: requirementData.dueDate,
      orderedBy: 'Clinic Staff', // This would typically be the current user
      orderedByRole: 'staff', // This would typically be the current user's role
    };

    // Create the order using MedicalRequirementsService
    const orderId = await MedicalRequirementsService.createOrder(clinicId, orderData);
    
    console.log('✅ Medical requirement added to patient:', {
      patientId: patient.id,
      orderId,
      requirementTitle: requirementData.title
    });
    
    return orderId;
  } catch (error) {
    console.error('❌ Error adding medical requirement to patient:', error);
    throw error;
  }
};

/**
 * Get all medical requirements for a patient
 * @param clinicId - The clinic ID
 * @param patientId - The patient ID
 * @returns Promise<MedicalRequirementOrder[]> - Array of medical requirements
 */
export const getPatientMedicalRequirements = async (
  clinicId: string,
  patientId: string
): Promise<MedicalRequirementOrder[]> => {
  try {
    const requirements = await MedicalRequirementsService.getOrdersByPatient(clinicId, patientId);
    return requirements;
  } catch (error) {
    console.error('❌ Error fetching patient medical requirements:', error);
    throw error;
  }
};

/**
 * Update a medical requirement
 * @param clinicId - The clinic ID
 * @param orderId - The order ID
 * @param updates - The updates to apply
 * @returns Promise<void>
 */
export const updateMedicalRequirement = async (
  clinicId: string,
  orderId: string,
  updates: Partial<MedicalRequirementOrder>
): Promise<void> => {
  try {
    await MedicalRequirementsService.updateOrder(clinicId, orderId, updates);
    console.log('✅ Medical requirement updated:', orderId);
  } catch (error) {
    console.error('❌ Error updating medical requirement:', error);
    throw error;
  }
};

/**
 * Delete a medical requirement
 * @param clinicId - The clinic ID
 * @param orderId - The order ID
 * @returns Promise<void>
 */
export const deleteMedicalRequirement = async (
  clinicId: string,
  orderId: string
): Promise<void> => {
  try {
    await MedicalRequirementsService.deleteOrder(clinicId, orderId);
    console.log('✅ Medical requirement deleted:', orderId);
  } catch (error) {
    console.error('❌ Error deleting medical requirement:', error);
    throw error;
  }
};