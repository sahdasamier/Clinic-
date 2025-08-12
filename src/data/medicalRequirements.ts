export interface MedicalRequirement {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedTime?: string;
  preparations?: string[];
}

export const REQUIREMENT_CATEGORIES = [
  'Laboratory Tests',
  'Imaging Studies',
  'Cardiac Tests',
  'Pulmonary Tests',
  'Endoscopy',
  'Biopsy',
  'Consultations',
  'Other'
];

export const COMMON_MEDICAL_REQUIREMENTS: MedicalRequirement[] = [
  // Laboratory Tests
  {
    id: 'cbc',
    type: 'lab',
    title: 'Complete Blood Count (CBC)',
    description: 'Comprehensive blood test to check for various disorders',
    category: 'Laboratory Tests',
    priority: 'normal',
    estimatedTime: '15 minutes',
    preparations: ['Fasting not required']
  },
  {
    id: 'lipid-panel',
    type: 'lab',
    title: 'Lipid Panel',
    description: 'Cholesterol and triglyceride levels',
    category: 'Laboratory Tests',
    priority: 'normal',
    estimatedTime: '15 minutes',
    preparations: ['12-hour fasting required']
  },
  {
    id: 'blood-glucose',
    type: 'lab',
    title: 'Blood Glucose Test',
    description: 'Check blood sugar levels',
    category: 'Laboratory Tests',
    priority: 'normal',
    estimatedTime: '10 minutes',
    preparations: ['8-hour fasting required']
  },
  {
    id: 'hba1c',
    type: 'lab',
    title: 'HbA1c Test',
    description: 'Average blood sugar over 2-3 months',
    category: 'Laboratory Tests',
    priority: 'normal',
    estimatedTime: '15 minutes',
    preparations: ['No fasting required']
  },
  {
    id: 'liver-function',
    type: 'lab',
    title: 'Liver Function Tests',
    description: 'Check liver health and function',
    category: 'Laboratory Tests',
    priority: 'normal',
    estimatedTime: '15 minutes',
    preparations: ['Fasting recommended']
  },
  {
    id: 'kidney-function',
    type: 'lab',
    title: 'Kidney Function Tests',
    description: 'Creatinine and BUN levels',
    category: 'Laboratory Tests',
    priority: 'normal',
    estimatedTime: '15 minutes',
    preparations: ['No special preparation']
  },
  {
    id: 'thyroid-function',
    type: 'lab',
    title: 'Thyroid Function Tests',
    description: 'TSH, T3, T4 levels',
    category: 'Laboratory Tests',
    priority: 'normal',
    estimatedTime: '15 minutes',
    preparations: ['No special preparation']
  },
  {
    id: 'urine-analysis',
    type: 'lab',
    title: 'Urinalysis',
    description: 'Complete urine examination',
    category: 'Laboratory Tests',
    priority: 'normal',
    estimatedTime: '10 minutes',
    preparations: ['Clean catch sample']
  },

  // Imaging Studies
  {
    id: 'chest-xray',
    type: 'imaging',
    title: 'Chest X-Ray',
    description: 'X-ray examination of chest and lungs',
    category: 'Imaging Studies',
    priority: 'normal',
    estimatedTime: '15 minutes',
    preparations: ['Remove jewelry and metal objects']
  },
  {
    id: 'abdominal-xray',
    type: 'imaging',
    title: 'Abdominal X-Ray',
    description: 'X-ray examination of abdomen',
    category: 'Imaging Studies',
    priority: 'normal',
    estimatedTime: '20 minutes',
    preparations: ['Empty bladder before exam']
  },
  {
    id: 'ct-scan',
    type: 'imaging',
    title: 'CT Scan',
    description: 'Computed tomography scan',
    category: 'Imaging Studies',
    priority: 'normal',
    estimatedTime: '30-60 minutes',
    preparations: ['May require contrast agent', 'Inform about allergies']
  },
  {
    id: 'mri-scan',
    type: 'imaging',
    title: 'MRI Scan',
    description: 'Magnetic resonance imaging',
    category: 'Imaging Studies',
    priority: 'normal',
    estimatedTime: '45-90 minutes',
    preparations: ['Remove all metal objects', 'Inform about implants']
  },
  {
    id: 'ultrasound',
    type: 'imaging',
    title: 'Ultrasound',
    description: 'Ultrasound examination',
    category: 'Imaging Studies',
    priority: 'normal',
    estimatedTime: '30 minutes',
    preparations: ['May require full bladder (depends on type)']
  },
  {
    id: 'mammography',
    type: 'imaging',
    title: 'Mammography',
    description: 'Breast X-ray examination',
    category: 'Imaging Studies',
    priority: 'normal',
    estimatedTime: '20 minutes',
    preparations: ['Schedule for week after menstruation', 'No deodorant']
  },

  // Cardiac Tests
  {
    id: 'ecg',
    type: 'cardiac',
    title: 'ECG/EKG',
    description: 'Electrocardiogram - heart rhythm test',
    category: 'Cardiac Tests',
    priority: 'normal',
    estimatedTime: '15 minutes',
    preparations: ['No special preparation required']
  },
  {
    id: 'echocardiogram',
    type: 'cardiac',
    title: 'Echocardiogram',
    description: 'Ultrasound of the heart',
    category: 'Cardiac Tests',
    priority: 'normal',
    estimatedTime: '45 minutes',
    preparations: ['Wear loose-fitting clothes']
  },
  {
    id: 'stress-test',
    type: 'cardiac',
    title: 'Cardiac Stress Test',
    description: 'Heart function under physical stress',
    category: 'Cardiac Tests',
    priority: 'normal',
    estimatedTime: '1-2 hours',
    preparations: ['Wear comfortable clothes and shoes', 'Avoid caffeine']
  },
  {
    id: 'holter-monitor',
    type: 'cardiac',
    title: 'Holter Monitor',
    description: '24-hour heart rhythm monitoring',
    category: 'Cardiac Tests',
    priority: 'normal',
    estimatedTime: '24-48 hours',
    preparations: ['Shower before application', 'Keep activity diary']
  },

  // Pulmonary Tests
  {
    id: 'pulmonary-function',
    type: 'pulmonary',
    title: 'Pulmonary Function Tests',
    description: 'Lung capacity and function assessment',
    category: 'Pulmonary Tests',
    priority: 'normal',
    estimatedTime: '30-45 minutes',
    preparations: ['Avoid bronchodilators as directed', 'No smoking 6 hours before']
  },
  {
    id: 'arterial-blood-gas',
    type: 'pulmonary',
    title: 'Arterial Blood Gas (ABG)',
    description: 'Blood oxygen and carbon dioxide levels',
    category: 'Pulmonary Tests',
    priority: 'high',
    estimatedTime: '15 minutes',
    preparations: ['Inform about blood thinners']
  },

  // Endoscopy
  {
    id: 'colonoscopy',
    type: 'endoscopy',
    title: 'Colonoscopy',
    description: 'Examination of large intestine',
    category: 'Endoscopy',
    priority: 'normal',
    estimatedTime: '1-2 hours',
    preparations: ['Bowel preparation required', 'Clear liquid diet 24 hours before']
  },
  {
    id: 'upper-endoscopy',
    type: 'endoscopy',
    title: 'Upper Endoscopy (EGD)',
    description: 'Examination of upper digestive tract',
    category: 'Endoscopy',
    priority: 'normal',
    estimatedTime: '30-60 minutes',
    preparations: ['12-hour fasting required', 'Arrange transportation']
  },

  // Biopsy
  {
    id: 'skin-biopsy',
    type: 'biopsy',
    title: 'Skin Biopsy',
    description: 'Tissue sample from skin lesion',
    category: 'Biopsy',
    priority: 'normal',
    estimatedTime: '30 minutes',
    preparations: ['Inform about blood thinners', 'Local anesthesia used']
  },
  {
    id: 'bone-marrow-biopsy',
    type: 'biopsy',
    title: 'Bone Marrow Biopsy',
    description: 'Sample from bone marrow',
    category: 'Biopsy',
    priority: 'high',
    estimatedTime: '1 hour',
    preparations: ['Arrange transportation', 'Inform about medications']
  },

  // Consultations
  {
    id: 'cardiology-consult',
    type: 'consultation',
    title: 'Cardiology Consultation',
    description: 'Specialist consultation for heart conditions',
    category: 'Consultations',
    priority: 'normal',
    estimatedTime: '45 minutes',
    preparations: ['Bring list of medications', 'Previous test results']
  },
  {
    id: 'endocrinology-consult',
    type: 'consultation',
    title: 'Endocrinology Consultation',
    description: 'Specialist consultation for hormone disorders',
    category: 'Consultations',
    priority: 'normal',
    estimatedTime: '45 minutes',
    preparations: ['Bring glucose logs if diabetic', 'List of medications']
  },
  {
    id: 'oncology-consult',
    type: 'consultation',
    title: 'Oncology Consultation',
    description: 'Cancer specialist consultation',
    category: 'Consultations',
    priority: 'high',
    estimatedTime: '60 minutes',
    preparations: ['Bring all previous reports', 'Prepare questions']
  }
];

export const getRequirementsByCategory = (category: string): MedicalRequirement[] => {
  return COMMON_MEDICAL_REQUIREMENTS.filter(req => req.category === category);
};

export const searchRequirements = (query: string): MedicalRequirement[] => {
  const lowercaseQuery = query.toLowerCase();
  return COMMON_MEDICAL_REQUIREMENTS.filter(req =>
    req.title.toLowerCase().includes(lowercaseQuery) ||
    req.description.toLowerCase().includes(lowercaseQuery) ||
    req.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const getRequirementById = (id: string): MedicalRequirement | undefined => {
  return COMMON_MEDICAL_REQUIREMENTS.find(req => req.id === id);
}; 