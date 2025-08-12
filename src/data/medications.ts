export interface Medication {
  id: string;
  name: string;
  category: string;
  commonDosages: string[];
  commonFrequencies: string[];
  description?: string;
}

export const MEDICATION_CATEGORIES = [
  'Cardiovascular',
  'Pain Relief',
  'Antibiotics',
  'Diabetes',
  'Mental Health',
  'Respiratory',
  'Gastrointestinal',
  'Vitamins & Supplements',
  'Hormones',
  'Neurological',
  'Other'
];

export const COMMON_MEDICATIONS: Medication[] = [
  // Cardiovascular
  {
    id: 'lisinopril',
    name: 'Lisinopril',
    category: 'Cardiovascular',
    commonDosages: ['5mg', '10mg', '20mg', '40mg'],
    commonFrequencies: ['Once daily', 'Twice daily']
  },
  {
    id: 'metoprolol',
    name: 'Metoprolol',
    category: 'Cardiovascular',
    commonDosages: ['25mg', '50mg', '100mg', '200mg'],
    commonFrequencies: ['Once daily', 'Twice daily']
  },
  {
    id: 'amlodipine',
    name: 'Amlodipine',
    category: 'Cardiovascular',
    commonDosages: ['2.5mg', '5mg', '10mg'],
    commonFrequencies: ['Once daily']
  },
  {
    id: 'atorvastatin',
    name: 'Atorvastatin',
    category: 'Cardiovascular',
    commonDosages: ['10mg', '20mg', '40mg', '80mg'],
    commonFrequencies: ['Once daily (evening)']
  },

  // Pain Relief
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    category: 'Pain Relief',
    commonDosages: ['200mg', '400mg', '600mg', '800mg'],
    commonFrequencies: ['Every 6-8 hours', 'As needed', 'Twice daily', 'Three times daily']
  },
  {
    id: 'acetaminophen',
    name: 'Acetaminophen (Tylenol)',
    category: 'Pain Relief',
    commonDosages: ['325mg', '500mg', '650mg', '1000mg'],
    commonFrequencies: ['Every 4-6 hours', 'As needed', 'Four times daily']
  },
  {
    id: 'tramadol',
    name: 'Tramadol',
    category: 'Pain Relief',
    commonDosages: ['50mg', '100mg'],
    commonFrequencies: ['Every 4-6 hours', 'As needed', 'Twice daily']
  },
  {
    id: 'gabapentin',
    name: 'Gabapentin',
    category: 'Pain Relief',
    commonDosages: ['100mg', '300mg', '400mg', '600mg', '800mg'],
    commonFrequencies: ['Three times daily', 'Twice daily', 'Once daily']
  },

  // Antibiotics
  {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    category: 'Antibiotics',
    commonDosages: ['250mg', '500mg', '875mg'],
    commonFrequencies: ['Three times daily', 'Twice daily']
  },
  {
    id: 'azithromycin',
    name: 'Azithromycin (Z-pack)',
    category: 'Antibiotics',
    commonDosages: ['250mg', '500mg'],
    commonFrequencies: ['Once daily', 'Day 1: 2 tablets, then 1 daily']
  },
  {
    id: 'cephalexin',
    name: 'Cephalexin',
    category: 'Antibiotics',
    commonDosages: ['250mg', '500mg', '750mg'],
    commonFrequencies: ['Four times daily', 'Three times daily', 'Twice daily']
  },
  {
    id: 'doxycycline',
    name: 'Doxycycline',
    category: 'Antibiotics',
    commonDosages: ['50mg', '100mg', '200mg'],
    commonFrequencies: ['Twice daily', 'Once daily']
  },

  // Diabetes
  {
    id: 'metformin',
    name: 'Metformin',
    category: 'Diabetes',
    commonDosages: ['500mg', '850mg', '1000mg'],
    commonFrequencies: ['Twice daily', 'Once daily', 'Three times daily']
  },
  {
    id: 'insulin-humalog',
    name: 'Insulin (Humalog)',
    category: 'Diabetes',
    commonDosages: ['Units as directed', 'Sliding scale'],
    commonFrequencies: ['Before meals', 'As directed by doctor']
  },
  {
    id: 'glipizide',
    name: 'Glipizide',
    category: 'Diabetes',
    commonDosages: ['5mg', '10mg'],
    commonFrequencies: ['Once daily', 'Twice daily']
  },

  // Mental Health
  {
    id: 'sertraline',
    name: 'Sertraline (Zoloft)',
    category: 'Mental Health',
    commonDosages: ['25mg', '50mg', '100mg', '150mg', '200mg'],
    commonFrequencies: ['Once daily']
  },
  {
    id: 'escitalopram',
    name: 'Escitalopram (Lexapro)',
    category: 'Mental Health',
    commonDosages: ['5mg', '10mg', '20mg'],
    commonFrequencies: ['Once daily']
  },
  {
    id: 'alprazolam',
    name: 'Alprazolam (Xanax)',
    category: 'Mental Health',
    commonDosages: ['0.25mg', '0.5mg', '1mg', '2mg'],
    commonFrequencies: ['As needed', 'Twice daily', 'Three times daily']
  },
  {
    id: 'lorazepam',
    name: 'Lorazepam (Ativan)',
    category: 'Mental Health',
    commonDosages: ['0.5mg', '1mg', '2mg'],
    commonFrequencies: ['As needed', 'Twice daily', 'Three times daily']
  },

  // Respiratory
  {
    id: 'albuterol',
    name: 'Albuterol Inhaler',
    category: 'Respiratory',
    commonDosages: ['90mcg per puff', '2 puffs'],
    commonFrequencies: ['Every 4-6 hours as needed', 'Before exercise']
  },
  {
    id: 'montelukast',
    name: 'Montelukast (Singulair)',
    category: 'Respiratory',
    commonDosages: ['4mg', '5mg', '10mg'],
    commonFrequencies: ['Once daily (evening)']
  },
  {
    id: 'prednisone',
    name: 'Prednisone',
    category: 'Respiratory',
    commonDosages: ['5mg', '10mg', '20mg', '40mg', '60mg'],
    commonFrequencies: ['Once daily', 'Twice daily', 'As directed']
  },

  // Gastrointestinal
  {
    id: 'omeprazole',
    name: 'Omeprazole (Prilosec)',
    category: 'Gastrointestinal',
    commonDosages: ['20mg', '40mg'],
    commonFrequencies: ['Once daily', 'Twice daily']
  },
  {
    id: 'famotidine',
    name: 'Famotidine (Pepcid)',
    category: 'Gastrointestinal',
    commonDosages: ['20mg', '40mg'],
    commonFrequencies: ['Twice daily', 'Once daily']
  },
  {
    id: 'loperamide',
    name: 'Loperamide (Imodium)',
    category: 'Gastrointestinal',
    commonDosages: ['2mg'],
    commonFrequencies: ['As needed', 'After each loose stool']
  },

  // Vitamins & Supplements
  {
    id: 'vitamin-d3',
    name: 'Vitamin D3',
    category: 'Vitamins & Supplements',
    commonDosages: ['1000 IU', '2000 IU', '5000 IU', '10000 IU'],
    commonFrequencies: ['Once daily']
  },
  {
    id: 'multivitamin',
    name: 'Multivitamin',
    category: 'Vitamins & Supplements',
    commonDosages: ['1 tablet', '1 capsule'],
    commonFrequencies: ['Once daily']
  },
  {
    id: 'vitamin-b12',
    name: 'Vitamin B12',
    category: 'Vitamins & Supplements',
    commonDosages: ['500mcg', '1000mcg', '2500mcg'],
    commonFrequencies: ['Once daily']
  },
  {
    id: 'calcium',
    name: 'Calcium',
    category: 'Vitamins & Supplements',
    commonDosages: ['500mg', '600mg', '1000mg'],
    commonFrequencies: ['Twice daily', 'Once daily']
  },

  // Hormones
  {
    id: 'levothyroxine',
    name: 'Levothyroxine (Synthroid)',
    category: 'Hormones',
    commonDosages: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg', '150mcg'],
    commonFrequencies: ['Once daily (morning, empty stomach)']
  },

  // Neurological
  {
    id: 'levetiracetam',
    name: 'Levetiracetam (Keppra)',
    category: 'Neurological',
    commonDosages: ['250mg', '500mg', '750mg', '1000mg'],
    commonFrequencies: ['Twice daily']
  },
  {
    id: 'phenytoin',
    name: 'Phenytoin (Dilantin)',
    category: 'Neurological',
    commonDosages: ['100mg', '200mg', '300mg'],
    commonFrequencies: ['Once daily', 'Twice daily', 'Three times daily']
  }
];

export const getMedicationsByCategory = (category: string): Medication[] => {
  return COMMON_MEDICATIONS.filter(medication => medication.category === category);
};

export const searchMedications = (query: string): Medication[] => {
  const lowercaseQuery = query.toLowerCase();
  return COMMON_MEDICATIONS.filter(medication =>
    medication.name.toLowerCase().includes(lowercaseQuery) ||
    medication.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const getMedicationById = (id: string): Medication | undefined => {
  return COMMON_MEDICATIONS.find(medication => medication.id === id);
}; 