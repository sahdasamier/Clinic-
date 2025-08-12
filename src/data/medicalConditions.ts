export interface MedicalCondition {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export const MEDICAL_CONDITION_CATEGORIES = [
  'Cardiovascular',
  'Respiratory',
  'Endocrine',
  'Neurological',
  'Gastrointestinal',
  'Musculoskeletal',
  'Mental Health',
  'Infectious Diseases',
  'Skin Conditions',
  'Eye & Ear',
  'Kidney & Urinary',
  'Other'
];

export const COMMON_MEDICAL_CONDITIONS: MedicalCondition[] = [
  // Cardiovascular
  { id: 'hypertension', name: 'Hypertension (High Blood Pressure)', category: 'Cardiovascular' },
  { id: 'coronary-artery-disease', name: 'Coronary Artery Disease', category: 'Cardiovascular' },
  { id: 'heart-failure', name: 'Heart Failure', category: 'Cardiovascular' },
  { id: 'atrial-fibrillation', name: 'Atrial Fibrillation', category: 'Cardiovascular' },
  { id: 'myocardial-infarction', name: 'Myocardial Infarction (Heart Attack)', category: 'Cardiovascular' },
  
  // Respiratory
  { id: 'asthma', name: 'Asthma', category: 'Respiratory' },
  { id: 'copd', name: 'COPD (Chronic Obstructive Pulmonary Disease)', category: 'Respiratory' },
  { id: 'pneumonia', name: 'Pneumonia', category: 'Respiratory' },
  { id: 'bronchitis', name: 'Bronchitis', category: 'Respiratory' },
  { id: 'sleep-apnea', name: 'Sleep Apnea', category: 'Respiratory' },
  
  // Endocrine
  { id: 'diabetes-type-1', name: 'Diabetes Type 1', category: 'Endocrine' },
  { id: 'diabetes-type-2', name: 'Diabetes Type 2', category: 'Endocrine' },
  { id: 'hypothyroidism', name: 'Hypothyroidism', category: 'Endocrine' },
  { id: 'hyperthyroidism', name: 'Hyperthyroidism', category: 'Endocrine' },
  { id: 'obesity', name: 'Obesity', category: 'Endocrine' },
  
  // Neurological
  { id: 'epilepsy', name: 'Epilepsy', category: 'Neurological' },
  { id: 'migraine', name: 'Migraine', category: 'Neurological' },
  { id: 'stroke', name: 'Stroke', category: 'Neurological' },
  { id: 'parkinsons', name: "Parkinson's Disease", category: 'Neurological' },
  { id: 'alzheimers', name: "Alzheimer's Disease", category: 'Neurological' },
  { id: 'multiple-sclerosis', name: 'Multiple Sclerosis', category: 'Neurological' },
  
  // Gastrointestinal
  { id: 'gerd', name: 'GERD (Gastroesophageal Reflux Disease)', category: 'Gastrointestinal' },
  { id: 'ibs', name: 'IBS (Irritable Bowel Syndrome)', category: 'Gastrointestinal' },
  { id: 'crohns', name: "Crohn's Disease", category: 'Gastrointestinal' },
  { id: 'ulcerative-colitis', name: 'Ulcerative Colitis', category: 'Gastrointestinal' },
  { id: 'peptic-ulcer', name: 'Peptic Ulcer Disease', category: 'Gastrointestinal' },
  
  // Musculoskeletal
  { id: 'arthritis', name: 'Arthritis', category: 'Musculoskeletal' },
  { id: 'osteoporosis', name: 'Osteoporosis', category: 'Musculoskeletal' },
  { id: 'fibromyalgia', name: 'Fibromyalgia', category: 'Musculoskeletal' },
  { id: 'lower-back-pain', name: 'Chronic Lower Back Pain', category: 'Musculoskeletal' },
  { id: 'osteoarthritis', name: 'Osteoarthritis', category: 'Musculoskeletal' },
  
  // Mental Health
  { id: 'depression', name: 'Depression', category: 'Mental Health' },
  { id: 'anxiety', name: 'Anxiety Disorder', category: 'Mental Health' },
  { id: 'bipolar', name: 'Bipolar Disorder', category: 'Mental Health' },
  { id: 'ptsd', name: 'PTSD (Post-Traumatic Stress Disorder)', category: 'Mental Health' },
  { id: 'adhd', name: 'ADHD (Attention Deficit Hyperactivity Disorder)', category: 'Mental Health' },
  
  // Infectious Diseases
  { id: 'covid-19', name: 'COVID-19', category: 'Infectious Diseases' },
  { id: 'influenza', name: 'Influenza', category: 'Infectious Diseases' },
  { id: 'hepatitis-b', name: 'Hepatitis B', category: 'Infectious Diseases' },
  { id: 'hiv', name: 'HIV/AIDS', category: 'Infectious Diseases' },
  { id: 'tuberculosis', name: 'Tuberculosis', category: 'Infectious Diseases' },
  
  // Skin Conditions
  { id: 'eczema', name: 'Eczema', category: 'Skin Conditions' },
  { id: 'psoriasis', name: 'Psoriasis', category: 'Skin Conditions' },
  { id: 'melanoma', name: 'Melanoma', category: 'Skin Conditions' },
  { id: 'acne', name: 'Acne', category: 'Skin Conditions' },
  
  // Eye & Ear
  { id: 'glaucoma', name: 'Glaucoma', category: 'Eye & Ear' },
  { id: 'cataracts', name: 'Cataracts', category: 'Eye & Ear' },
  { id: 'hearing-loss', name: 'Hearing Loss', category: 'Eye & Ear' },
  { id: 'tinnitus', name: 'Tinnitus', category: 'Eye & Ear' },
  
  // Kidney & Urinary
  { id: 'kidney-disease', name: 'Chronic Kidney Disease', category: 'Kidney & Urinary' },
  { id: 'kidney-stones', name: 'Kidney Stones', category: 'Kidney & Urinary' },
  { id: 'uti', name: 'Urinary Tract Infection', category: 'Kidney & Urinary' },
  { id: 'incontinence', name: 'Urinary Incontinence', category: 'Kidney & Urinary' },
  { id: 'bladder-infection', name: 'Bladder Infection (Cystitis)', category: 'Kidney & Urinary' },
  { id: 'enlarged-prostate', name: 'Enlarged Prostate (BPH)', category: 'Kidney & Urinary' },
  
  // Additional Cardiovascular
  { id: 'angina', name: 'Angina Pectoris', category: 'Cardiovascular' },
  { id: 'cardiomyopathy', name: 'Cardiomyopathy', category: 'Cardiovascular' },
  { id: 'peripheral-artery-disease', name: 'Peripheral Artery Disease', category: 'Cardiovascular' },
  { id: 'deep-vein-thrombosis', name: 'Deep Vein Thrombosis (DVT)', category: 'Cardiovascular' },
  { id: 'pulmonary-embolism', name: 'Pulmonary Embolism', category: 'Cardiovascular' },
  { id: 'valve-disease', name: 'Heart Valve Disease', category: 'Cardiovascular' },
  
  // Additional Respiratory
  { id: 'pulmonary-fibrosis', name: 'Pulmonary Fibrosis', category: 'Respiratory' },
  { id: 'lung-cancer', name: 'Lung Cancer', category: 'Respiratory' },
  { id: 'pleural-effusion', name: 'Pleural Effusion', category: 'Respiratory' },
  { id: 'sarcoidosis', name: 'Sarcoidosis', category: 'Respiratory' },
  { id: 'chronic-cough', name: 'Chronic Cough', category: 'Respiratory' },
  
  // Additional Endocrine
  { id: 'gestational-diabetes', name: 'Gestational Diabetes', category: 'Endocrine' },
  { id: 'addisons-disease', name: "Addison's Disease", category: 'Endocrine' },
  { id: 'cushings-syndrome', name: "Cushing's Syndrome", category: 'Endocrine' },
  { id: 'polycystic-ovary', name: 'PCOS (Polycystic Ovary Syndrome)', category: 'Endocrine' },
  { id: 'metabolic-syndrome', name: 'Metabolic Syndrome', category: 'Endocrine' },
  
  // Additional Gastrointestinal
  { id: 'celiac-disease', name: 'Celiac Disease', category: 'Gastrointestinal' },
  { id: 'diverticulitis', name: 'Diverticulitis', category: 'Gastrointestinal' },
  { id: 'gallstones', name: 'Gallstones', category: 'Gastrointestinal' },
  { id: 'pancreatitis', name: 'Pancreatitis', category: 'Gastrointestinal' },
  { id: 'liver-cirrhosis', name: 'Liver Cirrhosis', category: 'Gastrointestinal' },
  { id: 'hepatitis-c', name: 'Hepatitis C', category: 'Gastrointestinal' },
  { id: 'hemorrhoids', name: 'Hemorrhoids', category: 'Gastrointestinal' },
  
  // Additional Musculoskeletal
  { id: 'rheumatoid-arthritis', name: 'Rheumatoid Arthritis', category: 'Musculoskeletal' },
  { id: 'gout', name: 'Gout', category: 'Musculoskeletal' },
  { id: 'lupus', name: 'Systemic Lupus Erythematosus (SLE)', category: 'Musculoskeletal' },
  { id: 'scoliosis', name: 'Scoliosis', category: 'Musculoskeletal' },
  { id: 'herniated-disc', name: 'Herniated Disc', category: 'Musculoskeletal' },
  { id: 'carpal-tunnel', name: 'Carpal Tunnel Syndrome', category: 'Musculoskeletal' },
  { id: 'tennis-elbow', name: 'Tennis Elbow (Lateral Epicondylitis)', category: 'Musculoskeletal' },
  
  // Additional Mental Health
  { id: 'ocd', name: 'OCD (Obsessive-Compulsive Disorder)', category: 'Mental Health' },
  { id: 'panic-disorder', name: 'Panic Disorder', category: 'Mental Health' },
  { id: 'social-anxiety', name: 'Social Anxiety Disorder', category: 'Mental Health' },
  { id: 'eating-disorder', name: 'Eating Disorder', category: 'Mental Health' },
  { id: 'autism', name: 'Autism Spectrum Disorder', category: 'Mental Health' },
  { id: 'schizophrenia', name: 'Schizophrenia', category: 'Mental Health' },
  
  // Additional Neurological
  { id: 'dementia', name: 'Dementia', category: 'Neurological' },
  { id: 'neuropathy', name: 'Peripheral Neuropathy', category: 'Neurological' },
  { id: 'brain-tumor', name: 'Brain Tumor', category: 'Neurological' },
  { id: 'meningitis', name: 'Meningitis', category: 'Neurological' },
  { id: 'huntingtons', name: "Huntington's Disease", category: 'Neurological' },
  { id: 'restless-legs', name: 'Restless Legs Syndrome', category: 'Neurological' },
  
  // Additional Infectious Diseases
  { id: 'malaria', name: 'Malaria', category: 'Infectious Diseases' },
  { id: 'dengue', name: 'Dengue Fever', category: 'Infectious Diseases' },
  { id: 'typhoid', name: 'Typhoid Fever', category: 'Infectious Diseases' },
  { id: 'chickenpox', name: 'Chickenpox', category: 'Infectious Diseases' },
  { id: 'shingles', name: 'Shingles (Herpes Zoster)', category: 'Infectious Diseases' },
  { id: 'mononucleosis', name: 'Mononucleosis', category: 'Infectious Diseases' },
  
  // Additional Skin Conditions
  { id: 'dermatitis', name: 'Contact Dermatitis', category: 'Skin Conditions' },
  { id: 'rosacea', name: 'Rosacea', category: 'Skin Conditions' },
  { id: 'vitiligo', name: 'Vitiligo', category: 'Skin Conditions' },
  { id: 'skin-cancer', name: 'Skin Cancer (Non-Melanoma)', category: 'Skin Conditions' },
  { id: 'fungal-infection', name: 'Fungal Skin Infection', category: 'Skin Conditions' },
  { id: 'warts', name: 'Warts', category: 'Skin Conditions' },
  
  // Additional Eye & Ear
  { id: 'macular-degeneration', name: 'Macular Degeneration', category: 'Eye & Ear' },
  { id: 'diabetic-retinopathy', name: 'Diabetic Retinopathy', category: 'Eye & Ear' },
  { id: 'dry-eyes', name: 'Dry Eye Syndrome', category: 'Eye & Ear' },
  { id: 'ear-infection', name: 'Ear Infection (Otitis)', category: 'Eye & Ear' },
  { id: 'vertigo', name: 'Vertigo', category: 'Eye & Ear' },
  { id: 'menieres', name: "Meniere's Disease", category: 'Eye & Ear' },
  
  // Women's Health
  { id: 'endometriosis', name: 'Endometriosis', category: 'Other' },
  { id: 'fibroids', name: 'Uterine Fibroids', category: 'Other' },
  { id: 'menopause', name: 'Menopause', category: 'Other' },
  { id: 'ovarian-cysts', name: 'Ovarian Cysts', category: 'Other' },
  
  // Men's Health
  { id: 'prostate-cancer', name: 'Prostate Cancer', category: 'Other' },
  { id: 'erectile-dysfunction', name: 'Erectile Dysfunction', category: 'Other' },
  { id: 'low-testosterone', name: 'Low Testosterone', category: 'Other' },
  
  // Blood Disorders
  { id: 'anemia', name: 'Anemia', category: 'Other' },
  { id: 'iron-deficiency', name: 'Iron Deficiency', category: 'Other' },
  { id: 'sickle-cell', name: 'Sickle Cell Disease', category: 'Other' },
  { id: 'leukemia', name: 'Leukemia', category: 'Other' },
  { id: 'lymphoma', name: 'Lymphoma', category: 'Other' },
  
  // Autoimmune Conditions
  { id: 'multiple-sclerosis-add', name: 'Multiple Sclerosis', category: 'Other' },
  { id: 'hashimotos', name: "Hashimoto's Thyroiditis", category: 'Other' },
  { id: 'graves-disease', name: "Graves' Disease", category: 'Other' },
  { id: 'inflammatory-bowel', name: 'Inflammatory Bowel Disease', category: 'Other' },
  
  // Cancer Types
  { id: 'breast-cancer', name: 'Breast Cancer', category: 'Other' },
  { id: 'colon-cancer', name: 'Colon Cancer', category: 'Other' },
  { id: 'pancreatic-cancer', name: 'Pancreatic Cancer', category: 'Other' },
  { id: 'ovarian-cancer', name: 'Ovarian Cancer', category: 'Other' },
  
  // Allergies & Immune
  { id: 'food-allergies', name: 'Food Allergies', category: 'Other' },
  { id: 'seasonal-allergies', name: 'Seasonal Allergies', category: 'Other' },
  { id: 'drug-allergies', name: 'Drug Allergies', category: 'Other' },
  { id: 'immune-deficiency', name: 'Immune Deficiency', category: 'Other' },
  
  // Sleep Disorders
  { id: 'insomnia', name: 'Insomnia', category: 'Other' },
  { id: 'narcolepsy', name: 'Narcolepsy', category: 'Other' },
  { id: 'sleep-disorders', name: 'Sleep Disorders', category: 'Other' },
  
  // Other Common Conditions
  { id: 'chronic-fatigue', name: 'Chronic Fatigue Syndrome', category: 'Other' },
  { id: 'irritable-bladder', name: 'Irritable Bladder Syndrome', category: 'Other' },
  { id: 'lactose-intolerance', name: 'Lactose Intolerance', category: 'Other' },
  { id: 'motion-sickness', name: 'Motion Sickness', category: 'Other' },
  { id: 'chronic-pain', name: 'Chronic Pain Syndrome', category: 'Other' }
];

export const getMedicalConditionsByCategory = (category: string): MedicalCondition[] => {
  return COMMON_MEDICAL_CONDITIONS.filter(condition => condition.category === category);
};

export const searchMedicalConditions = (query: string): MedicalCondition[] => {
  const lowercaseQuery = query.toLowerCase();
  return COMMON_MEDICAL_CONDITIONS.filter(condition =>
    condition.name.toLowerCase().includes(lowercaseQuery) ||
    condition.category.toLowerCase().includes(lowercaseQuery)
  );
}; 