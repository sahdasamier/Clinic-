import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Basic Terms
      'clinic_management': 'Clinic Management',
      'login': 'Login',
      'email': 'Email',
      'email_address': 'Email Address',
      'password': 'Password',
      'sign_in': 'Sign In',
      'signing_in': 'Signing in...',
      'forgot_password': 'Forgot Password?',
      'reset_password': 'Reset Password',
      'send_reset_email': 'Send Reset Email',
      'sending': 'Sending...',
      'password_reset_email_sent': 'Password reset email has been sent to',
      'enter_email_for_reset': 'Enter your email address and we\'ll send you a link to reset your password.',
      'verifying_reset_link': 'Verifying Reset Link',
      'please_wait_verifying': 'Please wait while we verify your password reset link...',
      'password_reset_success': 'Password Reset Successful',
      'password_updated_successfully': 'Your password has been updated',
      'password_reset_complete': 'Your password has been reset successfully!',
      'redirecting_to_login': 'Redirecting you to login page...',
      'go_to_login': 'Go to Login',
      'back_to_login': 'Back to Login',
      'enter_new_password_for': 'Enter a new password for',
      'new_password': 'New Password',
      'confirm_new_password': 'Confirm New Password',
      'password_min_length': 'Password must be at least 6 characters',
      'updating_password': 'Updating Password...',
      'update_password': 'Update Password',
      'change_password': 'Change Password',
      'current_password': 'Current Password',
      'enter_current_password_and_new_password': 'Enter your current password and choose a new secure password.',
      'password_changed_successfully': 'Password changed successfully',
      'passwords_do_not_match': 'Passwords do not match',
      'user_not_authenticated': 'User not authenticated. Please log in again.',
      'current_password_incorrect': 'Current password is incorrect',
      'password_too_weak': 'Password is too weak. Please choose a stronger password.',
      'requires_recent_login': 'Please log out and log back in before changing your password.',
      'failed_to_change_password': 'Failed to change password. Please try again.',
      'no_account': "Don't have an account? Sign up",
      'authorized_access_only': 'Authorized Access Only',
      'management_system': 'Management System',
      'clinic_care': 'Clinicy',
      'version': 'version',
      
      // Profile & User
      'general_practitioner': 'General Practitioner',
      'profile_settings': 'Profile & Settings',
      'sign_out': 'Sign Out',
      'welcome_back': 'Welcome back',
      
      // Navigation & Dashboard
      'dashboard': 'Dashboard',
      'patients': 'Patients',
      'appointments': 'Appointments',
      'inventory': 'Inventory',
      'payments': 'Payments',
      'notifications': 'Notifications',
      'scheduling': 'Doctor Scheduling',
      'doctor_scheduling': 'Doctor Scheduling',
      'settings': 'Settings',
      'language': 'Language',
      'expand_sidebar': 'Expand Sidebar',
      'collapse_sidebar': 'Collapse Sidebar',
      'change_language': 'Change Language',
      
      // Clinic Setup
      'clinic_onboarding': 'Clinic Onboarding',
      'clinic_address': 'Clinic Address',
      'clinic_phone': 'Clinic Phone',
      'clinic_email': 'Clinic Email',
      'clinic_name': 'Clinic Name',
      'clinic_details': 'Clinic Details',
      'operating_hours': 'Operating Hours',
      'clinic_list': 'Clinic List',
      'address': 'Address',
      'phone': 'Phone',
      
      // Staff Management
      'invite_staff': 'Invite Staff',
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'full_name': 'Full Name',
      'role': 'Role',
      'doctor': 'Doctor',
      'management': 'Management',
      'receptionist': 'Receptionist',
      'send_invite': 'Send Invite',
      'invited_staff': 'Invited Staff',
      'name': 'Name',
      'status': 'Status',
      'pending': 'Pending',
      'joined': 'Joined',
      
      // Dashboard Stats
      'appointments_today': 'Appointments Today',
      'new_patients': 'New Patients',
      'completed_appointments': 'Completed Appointments',
      'upcoming_appointments': 'Upcoming Appointments',
      'total_revenue': 'Total Revenue',
      'weekly_appointments': 'Weekly Appointments',
      'payments_due': 'Payments Due',
      'inventory_alerts': 'Inventory Alerts',
      
      // Dashboard Types
      'receptionist_dashboard': 'Receptionist Dashboard',
      'patient_dashboard': 'Patient Dashboard',
      'doctor_dashboard': 'Doctor Dashboard',
      
      // Appointments
      'patient': 'Patient',
      'time': 'Time',
      'confirmed': 'Confirmed',
      'cancelled': 'Cancelled',
      'create_appointment': 'Create Appointment',
      'edit_appointment': 'Edit Appointment',
      'book_edit_appointment': 'Book/Edit Appointment',
      'patient_name': 'Patient Name',
      'appointment_date': 'Appointment Date',
      'appointment_time': 'Appointment Time',
      'appointment_details': 'Appointment Details',
      'appointment_list': 'Appointment List',
      'appointment_status': 'Appointment Status',
      'save_appointment': 'Save Appointment',
      'next_appointment': 'Next Appointment',
      
      // Patients
      'add_edit_patient': 'Add/Edit Patient',
      'patient_profile': 'Patient Profile',
      'patient_details': 'Patient Details',
      'patient_documents': 'Patient Documents',
      'date_of_birth': 'Date of Birth',
      'patient_age': 'Patient Age',
      'patient_gender': 'Patient Gender',
      'patient_address': 'Patient Address',
      'patient_condition': 'Patient Condition',
      'medical_history': 'Medical History',
      'emergency_contact_name': 'Emergency Contact Name',
      'emergency_contact_phone': 'Emergency Contact Phone',
      'insurance_provider': 'Insurance Provider',
      'insurance_number': 'Insurance Number',
      'current_medications': 'Current Medications',
      'blood_type': 'Blood Type',
      'height': 'Height',
      'weight': 'Weight',
      'upload_document': 'Upload Document',
      'document_name': 'Document Name',
      'upload_date': 'Upload Date',
      
      // Medical Records
      'medical_records': 'Medical Records',
      'view_records': 'View Records',
      'doctor_notes': 'Doctor Notes',
      'add_note': 'Add Note',
      'enter_note': 'Enter your note here...',
      'save_note': 'Save Note',
      'notes': 'Notes',
      'profile': 'Profile',
      'visits': 'Visits',
      
      // Billing & Payments
      'billing_information': 'Billing Information',
      'view_billing': 'View Billing',
      'payment_list': 'Payment List',
      'payment_details': 'Payment Details',
      'payment_method': 'Payment Method',
      'invoice_id': 'Invoice ID',
      'amount': 'Amount',
      'date': 'Date',
      'paid': 'Paid',
      'unpaid': 'Unpaid',
      
      // Inventory
      'inventory_list': 'Inventory List',
      'add_edit_inventory_item': 'Add/Edit Inventory Item',
      'low_stock_alerts': 'Low Stock Alerts',
      'item_name': 'Item Name',
      'quantity': 'Quantity',
      'supplier': 'Supplier',
      'last_updated': 'Last Updated',
      'manage_inventory': 'Manage Medical Supplies & Equipment',
      'coming_soon': 'Coming Soon',
      'feature_under_development': 'This feature is currently under development.',
      
      // Common Actions
      'save': 'Save',
      'close': 'Close',
      'register': 'Register',
      'already_have_account': 'Already have an account? Sign in',
      'type': 'Type',
      'view': 'View',
      'edit': 'Edit',
      'delete': 'Delete',
      'cancel': 'Cancel',
      'confirm': 'Confirm',
      'loading': 'Loading...',
      'refresh': 'Refresh',
      'search': 'Search',
      'filter': 'Filter',
      'sort': 'Sort',
      'export': 'Export',
      'import': 'Import',
      'print': 'Print',
      
      // Dashboard specific
      'clinical_dashboard': 'Clinical Dashboard',
      'working_doctors_today': 'Working Doctors Today',
      'completion_rate': 'Completion Rate',
      'completed': 'Completed',
      
      // Patient Management specific
      'patient_management': 'Patient Management',
      'whatsapp_all': 'WhatsApp All',
      'add_new_patient': 'Add New Patient',
      'search_patients_placeholder': 'Search patients by name, email, phone, or condition...',
      'organize': 'Organize',
      'all': 'All',
      'table': 'Table',
      'cards': 'Cards',
      'active_filters': 'Active Filters',
      'gender': 'Gender',
      'age': 'Age',
      'condition': 'Condition',
      'clear_all_filters': 'Clear All Filters',
      'male': 'Male',
      'female': 'Female',
      'contact': 'Contact',
      'last_visit': 'Last Visit',
      'actions': 'Actions',
      'years': 'years',
      'duration': 'Duration',
      
      // Patient Status Values
      'old': 'Old Patient',
      'new': 'New Patient',
      'follow-up': 'Follow-up',
      'admitted': 'Admitted',
      'transferred': 'Transferred',
      'discharged': 'Discharged',
      
      // Medical Conditions
      'diabetes': 'Diabetes',
      'hypertension': 'Hypertension',
      'asthma': 'Asthma',
      'routine checkup': 'Routine Checkup',
      'routine_checkup': 'Routine Checkup',
      'diabetes type 2': 'Diabetes Type 2',
      'migraine': 'Migraine',
      'chest pain': 'Chest Pain',
      'back pain': 'Back Pain',
      'headache': 'Headache',
      'fever': 'Fever',
      'cough': 'Cough',
      'cold': 'Cold',
      'flu': 'Flu',
      'allergies': 'Allergies',
      'high blood pressure': 'High Blood Pressure',
      'low blood pressure': 'Low Blood Pressure',
      'heart disease': 'Heart Disease',
      'kidney disease': 'Kidney Disease',
      'liver disease': 'Liver Disease',
      'arthritis': 'Arthritis',
      'depression': 'Depression',
      'anxiety': 'Anxiety',
      'obesity': 'Obesity',
      'anemia': 'Anemia',
      'thyroid disorder': 'Thyroid Disorder',
      
      // Medical Specialties
      'general_medicine': 'General Medicine',
      'cardiology': 'Cardiology',
      'pediatrics': 'Pediatrics',
      'dermatology': 'Dermatology',
      'orthopedics': 'Orthopedics',
      'neurology': 'Neurology',
      'gastroenterology': 'Gastroenterology',
      'ophthalmology': 'Ophthalmology',
      'ent': 'ENT (Ear, Nose, Throat)',
      'psychiatry': 'Psychiatry',
      'other': 'Other',
      
      // Tab Categories
      'all patients': 'All Patients',
      'new patients': 'New Patients',
      'follow-up patients': 'Follow-up Patients',
      'old patients': 'Old Patients',
      'under observation': 'Under Observation',
      'transferred patients': 'Transferred Patients',
      'discharged patients': 'Discharged Patients',
      'appointment data': 'Appointment Data',
      
      // Appointment status
      'checked-in': 'Checked In',
      'waiting': 'Waiting',
      'in-progress': 'In Progress',
      'scheduled': 'Scheduled',
      
      // Additional status terms
      'active': 'Active',
      'none_today': 'None Today',
      
      // Doctor Scheduling terms
      'add_time_slot': 'Add Time Slot',
      'edit_doctor_schedule': 'Edit Doctor Schedule',
      'working_hours_start': 'Working Hours Start',
      'working_hours_end': 'Working Hours End',
      'off_days': 'Off Days',
      'available_slot': 'Available Slot',
      'regular_working_hours': 'Regular Working Hours',
      'please_fill_all_fields': 'Please fill all fields',
      'time_slot_already_exists': 'Time slot already exists',
      'time_slot_already_reserved': 'Time slot is already reserved',
      'edit_doctor_information': 'Edit Doctor Information',
      'working_hours_schedule': 'Working Hours & Schedule',
      'consultation_duration': 'Consultation Duration',
      'max_patients_per_hour': 'Max Patients Per Hour',
      'available_slots': 'Available Slots',
      'reserved_for_patient': 'Reserved for Patient',
      'standard_doctor_availability': 'Standard doctor availability during working hours',
      'manually_added_slot': 'Available Slot (Added Manually)',
      
      // Patient page sync and organization terms
      'automatic_sync_active': '🔄 Automatic Patient-Appointment Sync Active',
      'sync_now': 'Sync Now',
      'from_appointments': 'From Appointments',
      'follow_up': 'Follow-up',
      'completion': 'Completion',
      'reservation': 'Reservation',
      'reservations': 'Reservations',
      'appointment_reservations': 'appointment reservations',
      'appointment_completion_status': 'appointment completion status',
      'patients_with_appointments_listed_first': 'Patients with appointments are listed first.',
      'patients_with_completed_listed_first': 'Patients with completed appointments are listed first.',
      'organized_by_text': 'Patients are organized by',
      'appointment_data_organized_by_completion': 'This tab shows appointment data organized by completion status, automatically synced from the Appointment page.',
      'appointments_awaiting_completion': 'Appointments awaiting completion',
      'pending_not_completed': 'Pending/Not Completed',
      'no_completed_appointments_found': 'No completed appointments found',
      'no_pending_appointments_found': 'No pending appointments found',
      'successfully_completed_appointments': 'Successfully completed appointments',
      'loading_appointment_data': 'Loading Appointment Data...',
      'syncing_appointment_data': 'Syncing appointment data from the appointment page',
      'completed_status': 'Completed',
      'total_patients': 'Total Patients',
      'comprehensive_patient_care': '🏥 Comprehensive Patient Care',
      'sync_appointments': 'Sync Appointments',
      
      // Notifications
      'failed_to_load_settings': 'Failed to load settings',
      'failed_to_refresh_notifications': 'Failed to refresh notifications',
      'notification_marked_as_read': 'Notification marked as read',
      'failed_to_mark_as_read': 'Failed to mark as read',
      'notification_deleted': 'Notification deleted',
      'failed_to_delete_notification': 'Failed to delete notification',
      'all_notifications_marked_as_read': 'All notifications marked as read',
      'failed_to_mark_all_as_read': 'Failed to mark all as read',
      'settings_saved_successfully': 'Settings saved successfully',
      'failed_to_save_settings': 'Failed to save settings',
      'mark_as_read': 'Mark as read',
      'delete_notification': 'Delete notification',
      'notification_preferences': 'Notification Preferences',
      'realtime_updates': 'Real-time updates from your clinic management system',
      'no_notifications_found': 'No notifications found',
      'all_caught_up': "You're all caught up! New notifications will appear here when there's something important to share.",
      'notification_settings': 'Notification Settings',
      'customize_notification_preferences': 'Customize your notification preferences',
      'appointment_notifications': 'Appointment Notifications',
      'payment_notifications': 'Payment Notifications',
      'system_updates': 'System Updates',
      'save_settings': 'Save Settings',
      'quick_actions': 'Quick Actions',
      'manage_all_notifications': 'Manage all notifications at once',
      'mark_all_as_read': 'Mark All as Read',
      'clear_all_notifications': 'Clear All Notifications',
      'refresh_from_all_data': 'Refresh from all data',
      'load_more_notifications': 'Load more notifications',
      'loading_more': 'Loading...',
      'all_notifications_loaded': 'All notifications loaded ({{count}} total)',
      'loaded_more_notifications': 'Loaded {{count}} more notification{{s}}',
      'failed_to_load_more': 'Failed to load more notifications',
      'notifications_refreshed': 'Notifications refreshed! Found {{total}} total notifications ({{unread}} unread) from all application data',
      'refreshing_from_all_modules': 'Refreshing notifications from all application modules...',
      'refreshing_notifications': 'Refreshing notifications',
      'notification_type_all': 'All Notifications',
      'notification_type_appointment': 'Appointments',
      'notification_type_payment': 'Payments',
      
      // Settings Page
      'manage_profile_clinic_settings': 'Manage your profile, clinic settings, and system preferences',
      'settings_menu': 'Settings Menu',
      'configure_clinic_preferences': 'Configure your clinic & preferences',
      'profile_management': 'Profile Management',
      'clinic_settings_tab': 'Clinic Settings',
      'security_privacy': 'Security & Privacy',
      'system_settings': 'System Settings',
      'profile_information': 'Profile Information',
      'manage_personal_professional_details': 'Manage your personal and professional details',
      'edit_profile': 'Edit Profile',
      'cancel_edit': 'Cancel Edit',
      'available': 'Available',
      'hours_ago': '{{count}} hours ago',
      'basic_information': 'Basic Information',
      'professional_information': 'Professional Information',
      'not_specified': 'Not specified',
      'phone_number': 'Phone Number',
      'emergency_contact': 'Emergency Contact',
      'primary_specialization': 'Primary Specialization',
      'years_of_experience': 'Years of Experience',
      'medical_license_number': 'Medical License Number',
      'medical_school': 'Medical School',
      'residency': 'Residency',
      'board_certifications': 'Board Certifications',
      'languages_bio': 'Languages & Bio',
      'languages_spoken': 'Languages Spoken',
      'consultation_fee': 'Consultation Fee',
      'professional_bio': 'Professional Bio',
      'no_bio_available': 'No bio available',
      'availability_settings': 'Availability Settings',
      'working_days': 'Working Days',
      'working_hours': 'Working Hours',
      'lunch_break': 'Lunch Break',
      'notification_type_inventory': 'Inventory',
      'notification_type_system': 'System',
      'notification_appointment_type': 'Appointment',
      'notification_payment_type': 'Payment',
      'notification_inventory_type': 'Inventory',
      'notification_system_type': 'System',
      'created_at': 'Created at',
      'message': 'Message',
      'title': 'Title',
      'read': 'Read',
      'unread': 'Unread',
      'notification_cleared': 'Notification cleared',
      'all_notifications_cleared': 'All notifications cleared',
      'failed_to_clear_notifications': 'Failed to clear notifications',
      'notification_count': '{{count}} notification{{s}}',
      'unread_count': '{{count}} unread',
      'refreshing': 'Refreshing...',
      'refresh_all_data': 'Refresh All Data',
      'processing': 'Processing...',
      'clear_all_with_count': 'Clear All ({{count}})',
      'for': 'for',
      
      // Inventory Alert Messages
      'low_stock_alert_title': 'Low Stock Alert',
      'out_of_stock_alert_title': 'Out of Stock Alert',
      'low_stock_message': '{{itemName}} is running low. Only {{quantity}} units left (minimum: {{minQuantity}})',
      'out_of_stock_message': '{{itemName}} is out of stock. Please reorder from {{supplier}}',
      'units_left': 'units left',
      'minimum': 'minimum',
      'please_reorder_from': 'Please reorder from',
      
      // Notification Titles & Messages
      'new_appointment_scheduled': 'New Appointment Scheduled',
      'appointment_reminder': 'Appointment Reminder',
      'patient_no_show': 'Patient No-Show',
      'appointment_cancelled': 'Appointment Cancelled',
      'payment_received': 'Payment Received',
      'payment_overdue': 'Payment Overdue',
      'payment_due_soon': 'Payment Due Soon',
      'new_patient_registration': 'New Patient Registration',
      'follow_up_due': 'Follow-up Due',
      'medication_refill_due': 'Medication Refill Due',
      'system_update': 'System Update',
      'system_update_message': 'New features have been added to the patient management system. Check out the updated medication tracking!',
      
      // Doctor Scheduling - Additional Keys
      'professional_doctor_schedule_management': '🩺 Professional doctor schedule & appointment time management',
      'schedule_date': '📅 Schedule Date:',
      'select_date': 'Select Date',
      'time_slots_total': 'Time Slots ({{count}} total)',
      'doctor_schedule_statistics': '📊 Doctor Schedule Statistics',
      'working_today': 'Working Today',
      'total_appointments': 'Total Appointments',
      'busy_doctors': 'Busy Doctors',
      'available_doctors': 'Available Doctors',
      'time_slot_color_guide': '🎨 Time Slot Color Guide',
      'available_slot_added_manually': '⏰ Available Slot (Added Manually)',
      'reserved_patient_appointment': '🔒 Reserved (Patient Appointment)',
      'interactive_time_slots': '💡 Interactive Time Slots',
      'click_time_slot_to_edit': 'Click on any time slot to edit its type, add patient details, or modify the schedule!',
      'doctor_schedules': 'Doctor Schedules',
      'weekly_overview': 'Weekly Overview',
      'all_doctors': 'All Doctors',
      'doctor_schedules_for_date': '📋 Doctor Schedules for {{date}}',
      'how_to_manage_time_slots': '💡 How to manage time slots:',
      'click_plus_button_to_add': '• Click the + button next to any doctor to add available time slots',
      'add_multiple_time_slots': '• Add multiple time slots to any doctor, even if they already have appointments',
      'click_time_slot_chip_to_edit': '• Click any time slot chip to edit, reserve, or convert to different types',
      'time_slots': 'Time Slots',
      'schedule_utilization': 'Schedule Utilization',
      'reserved': 'Reserved',
      'slots': 'slots',
      'doctor_schedule': 'Doctor Schedule',
      'review': 'Review',
      
      // Days of the week
      'monday': 'Monday',
      'tuesday': 'Tuesday', 
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday',
      
      // Short day names
      'mon': 'Mon',
      'tue': 'Tue',
      'wed': 'Wed',
      'thu': 'Thu',
      'fri': 'Fri',
      'sat': 'Sat',
      'sun': 'Sun',
      
      // Additional scheduling terms
      'all_doctors_day': 'All Doctors {{day}}',
      'schedule_for_day': 'Schedule for {{day}}',
      'doctors_working_on': 'Doctors working on {{day}}',
      
      'reserved_appointments_count': 'Reserved Appointments ({{count}})',
      'available_slots_count': 'Available Slots ({{count}})',
      'doctors_off_today': 'Doctors Off Today ({{day}})',
      'day_off': 'Day Off',
      'weekly_schedule_overview': 'Weekly Schedule Overview',
      'weekly_working_patterns': 'Weekly Working Patterns',
      'weekly_overview_description': 'Complete overview of all doctors\' working schedules throughout the week. Click edit to modify any doctor\'s schedule.',
      'all_doctors_count': 'All Doctors ({{count}})',
      'none': 'None',
      'max_patients_per_hour_template': 'Max {{max}} patients/hour',
      'consultation_duration_min': '{{duration}} min consultations',
      
      // Daily availability management
      'quick_availability_presets': 'Quick Availability Presets',
      'morning_preset': '🌅 Morning (9-12)',
      'afternoon_preset': '☀️ Afternoon (2-5)',
      'evening_preset': '🌙 Evening (6-9)',
      'full_day_preset': '🌈 Full Day',
      'default_hours': '📋 Default Hours',
      'clear_all': '🗑️ Clear All',
      'current_time_slots': 'Current Time Slots',
      'add_custom_time': 'Add Custom Time',
      'no_slots_message': 'No time slots added yet. Use quick presets above or add custom slots below.',
      'availability_presets': 'Availability Presets',
      'add_custom_time_slot': 'Add Custom Time Slot',
      'select_time': 'Select time',
      'add_slot': 'Add Slot',
      'create_availability_for': 'Create availability for {{doctor}}',
      'what_this_does': 'What this does',
      'add_time_slot_description': 'This adds an available time slot to the doctor\'s schedule. You can add time slots to ANY doctor, even if they already have existing appointments.',
      'green_slots': 'Green slots',
      'blue_slots': 'Blue slots',
      'red_slots': 'Red slots',
      'regular_working_hours_description': 'Regular working hours (doctor\'s normal schedule)',
      'available_slots_description': 'Available slots you add manually (like this one)',
      'reserved_slots_description': 'Reserved appointments with actual patient names',
      'can_add_multiple_time_slots': 'You can add multiple time slots to the same doctor on different times!',
      'has_existing_appointments': 'Has existing appointments - can add more time slots',
      'slots_count': '{{count}} slots',
      'add_available_time_slot': 'Add Available Time Slot',
      'enter_time_format': 'Enter any time in HH:MM format (e.g., 14:30, 09:15)',
      'time_hhmm_format': 'Time (HH:MM format)',
      'change_time_or_enter_new': 'Change time or enter new custom time slot',
      'personal_information': 'Personal Information',
      'register_new_medical_professional': 'Register a new medical professional to your clinic team',
      'add_new_doctor': 'Add New Doctor',
      'doctor_information': 'Doctor Information',
      'doctor_registration_description': 'Please fill in the details below to add a new doctor to your clinic management system. All fields marked with * are required for registration.',
      'doctor_name_placeholder': 'e.g., Dr. Ahmed Hassan Mohamed',
      'medical_specialty': 'Medical Specialty',
      'working_schedule': 'Working Schedule',
      'typical_duration_range': 'Typical: 15-60 minutes',
      'recommended_patients_range': 'Recommended: 2-4 patients',
      'add_doctor_to_clinic': 'Add Doctor to Clinic',
      'update_doctor_profile': 'Update {{doctor}}\'s profile and schedule settings',
      'doctor_name': 'Doctor Name',
      'working_hours_and_schedule': 'Working Hours & Schedule',
      'update_doctor': 'Update Doctor',
      'edit_doctor_profile': 'Edit Doctor Profile',
      'edit_time_slot_time': 'Edit Time Slot: {{time}}',
      'configure_slot_type_and_patient': 'Configure slot type and patient details',
      'current_status': 'Current Status',
      'regular': 'Regular',
      'slot_type': 'Slot Type',
      'extra_availability_outside_hours': 'Extra availability outside regular hours',
      'booked_appointment_with_patient': 'Booked appointment with patient details',
      'full_patient_name': 'Full patient name',
      'patient_phone': 'Patient Phone',
      'contact_number': 'Contact number',
      'specialist_referral': 'Specialist Referral',
      'additional_notes_placeholder': 'Additional notes about the appointment...',
      'please_select_doctor_and_time': 'Please select a doctor and enter a time',
      'available_time_slot_added': 'Available time slot {{time}} added for {{doctor}} on {{date}}. Doctor now has {{count}} time slots.',
      'doctor_added_successfully': 'Doctor {{name}} added successfully!',
      'doctor_updated_successfully': 'Doctor {{name}} updated successfully!',
      'please_fill_doctor_name_specialty': 'Please fill in doctor name and specialty',
      'patient_name_required': 'Patient name is required for reserved appointments',
      'converted_to_regular': 'Converted to Regular Working Hours',
      'converted_to_available': 'Converted to Available Slot',
      'reserved_slot_tooltip': 'RESERVED: {{patient}} (Click to edit)',
      'available_slot_tooltip': 'Available Slot (Click to edit)',
      'regular_hours_tooltip': 'Regular Working Hours (Click to edit)',
      'room': 'Room',
      'available_time_slot_created': 'Available time slot created from doctor scheduling',
      'available_time_slot': 'Available time slot',
      'years_text': '{{count}} years',
      'egp_amount': 'EGP {{amount}}',
      'bio_placeholder': 'Dr. Ahmed Ali is a board-certified General Practitioner with over 8 years of experience in providing comprehensive healthcare services. He specializes in preventive medicine, chronic disease management, and patient education.',
      'edit_profile_information': 'Edit Profile Information',
      'profile_statistics': 'Profile Statistics',
      'performance_overview': 'Performance overview',
      'appointments_this_month': 'Appointments This Month',
      'successful_treatments': 'Successful Treatments',
      'vacation': 'On Vacation',
      'emergency_only': 'Emergency Only',
      'saving_profile': 'Saving Profile...',
      'saving_clinic_settings': 'Saving Clinic Settings...',
      'save_clinic_settings': 'Save Clinic Settings',
      'saving': 'Saving...',
      'save_preferences': 'Save Preferences',
      
      // Settings Page - Additional Keys
      'achievements_certifications': 'Achievements & Certifications',
      'awards_recognitions': 'Awards and recognitions',
      'board_certified': 'Board Certified',
      'excellence_award': 'Excellence Award',
      'best_doctor_2023': 'Best Doctor 2023 - Egyptian Medical Syndicate',
      'cairo_university_medicine': 'Cairo University Faculty of Medicine',
      'professional_member': 'Professional Member',
      'egyptian_medical_syndicate_member': 'Egyptian Medical Syndicate - Member #12345',
      'add_achievement': 'Add Achievement',
      'professional_information_actions': 'Professional Information & Actions',
      'license_details_quick_actions': 'License details and quick actions',
      'license_number': 'License Number',
      'registration_date': 'Registration Date',
      'january_15_2016': 'January 15, 2016',
      'department': 'Department',
      'license_status': 'License Status',
      'update_credentials': 'Update Credentials',
      'update_professional_credentials': 'Update Professional Credentials',
      'professional_credentials': 'Professional Credentials',
      'medical_license_certificate': 'Medical License Certificate',
      'license_information': 'License Information',
      'license_type': 'License Type',
      'licensing_authority': 'Licensing Authority',
      'license_valid_from': 'License Valid From',
      'license_valid_until': 'License Valid Until',
      'license_scope': 'License Scope',
      'specialty_board_certification': 'Specialty Board Certification',
      'board_name': 'Board Name',
      'certification_date': 'Certification Date',
      'certification_status': 'Certification Status',
      'active_status': 'Active',
      'expired_status': 'Expired',
      'pending_status': 'Pending',
      'suspended_status': 'Suspended',
      'continuing_education': 'Continuing Education',
      'cme_credits': 'CME Credits',
      'last_renewal_date': 'Last Renewal Date',
      'next_renewal_date': 'Next Renewal Date',
      'professional_memberships': 'Professional Memberships',
      'organization_name': 'Organization Name',
      'membership_type': 'Membership Type',
      'membership_status': 'Membership Status',
      'membership_since': 'Member Since',
      'update_license_info': 'Update License Information',
      'save_credentials': 'Save Credentials',
      'verify_credentials': 'Verify Credentials',
      'credentials_updated_successfully': 'Professional credentials updated successfully',
      'license_validated': 'License validated successfully',
      'invalid_license_number': 'Invalid license number',
      'license_expired': 'License has expired',
      'credentials_form_title': 'Professional Credentials Management',
      'credentials_form_subtitle': 'Manage your medical licenses, certifications, and professional memberships',
      'license_upload_instruction': 'Upload a clear copy of your medical license',
      'supported_file_formats': 'Supported formats: PDF, JPG, PNG (Max 5MB)',
      'credential_required_field': 'This credential field is required',
      'license_number_format': 'License number format is invalid',
      'date_validation_future': 'Date cannot be in the future',
      'date_validation_past': 'Date cannot be in the past',
      'renewal_reminder': 'Renewal reminder will be sent 30 days before expiry',
      'upload_supporting_documents': 'Upload Supporting Documents',
      'document_verification_pending': 'Document verification pending',
      'document_verified': 'Document verified',
      'document_rejected': 'Document rejected',
      'medical_license_form': 'Medical License Form',
      'update_credentials_form': 'Update Credentials Form',
      'add_achievement_form': 'Add Achievement Form',
      'license_certificate_upload': 'License Certificate Upload',
      'certificate_file': 'Certificate File',
      'browse_files': 'Browse Files',
      'drag_drop_files': 'Drag and drop files here',
      'file_size_limit': 'Maximum file size: 10MB',
      'accepted_formats': 'Accepted formats: PDF, JPG, PNG',
      'license_verification_status': 'License Verification Status',
      'verified': 'Verified',
      'not_verified': 'Not Verified',
      'under_review': 'Under Review',
      'achievement_category_options': 'Achievement Category Options',
      'professional_award': 'Professional Award',
      'research_publication': 'Research Publication',
      'conference_presentation': 'Conference Presentation',
      'community_service': 'Community Service',
      'other_achievement': 'Other Achievement',
      'form_validation_errors': 'Form Validation Errors',
      'please_fix_errors': 'Please fix the following errors:',
      'required_field_empty': 'Required field is empty',
      'invalid_email_format': 'Invalid email format',
      'invalid_phone_format': 'Invalid phone number format',
      'file_too_large': 'File size is too large',
      'unsupported_file_type': 'Unsupported file type',
      'form_submitted_successfully': 'Form submitted successfully',
      'changes_saved': 'Changes saved successfully',
      'upload_in_progress': 'Upload in progress...',
      'processing_request': 'Processing your request...',
      'confirm_delete': 'Are you sure you want to delete this item?',
      'action_cannot_be_undone': 'This action cannot be undone',
      'view_certificate': 'View Certificate',
      'view_certification': 'View Certification',
      'certification_details': 'Certification Details',
      'certificate_name': 'Certificate Name',
      'issuing_organization': 'Issuing Organization',
      'issue_date': 'Issue Date',
      'expiry_date': 'Expiry Date',
      'certificate_number': 'Certificate Number',
      'achievement_title': 'Achievement Title',
      'achievement_description': 'Achievement Description',
      'achievement_date': 'Achievement Date',
      'achievement_category': 'Achievement Category',
      'award_title': 'Award Title',
      'awarded_by': 'Awarded By',
      'add_new_achievement': 'Add New Achievement',
      'edit_achievement': 'Edit Achievement',
      'save_achievement': 'Save Achievement',
      'cancel_changes': 'Cancel Changes',
      'form_validation_required': 'This field is required',
      'form_validation_invalid': 'Please enter a valid value',
      'upload_certificate': 'Upload Certificate',
      'attach_document': 'Attach Document',
      'remove_attachment': 'Remove Attachment',
      'select_category': 'Select Category',
      'enter_details': 'Enter Details',
      'doctor_first_name': 'Doctor First Name',
      'doctor_last_name': 'Doctor Last Name',
      'doctor_email': 'Doctor Email',
      'doctor_phone': 'Doctor Phone',
      'years_experience': 'Years of Experience',
      'qualification': 'Qualification',
      'university': 'University',
      'graduation_year': 'Graduation Year',
      'clinic_room': 'Clinic Room',
      'basic_clinic_information': 'Basic Clinic Information',
      'view_clinic_core_details': 'View your clinic\'s core details and information',
      'clinic_information': 'Clinic Information',
      'operation_information': 'Operation Information',
      'licensed_medical_facility': 'Licensed Medical Facility',
      'active_valid': 'Active & Valid',
      
      // Payment Management System
      payment: {
        title: 'Payment Management',
        subtitle: 'Streamline invoices, track payments, and manage billing seamlessly',
        
        // Fields
        fields: {
          amount: 'Amount',
          patientName: 'Patient Name',
          invoiceDate: 'Invoice Date',
          dueDate: 'Due Date',
          description: 'Description',
          serviceCategory: 'Service Category',
          paymentMethod: 'Payment Method',
          insuranceCoverage: 'Insurance Coverage',
          insurance: 'Insurance',
          method: 'Method'
        },
        
        // Status
        status: {
          paid: 'Paid',
          pending: 'Pending',
          overdue: 'Overdue',
          partial: 'Partial'
        },
        
        // Categories
        categories: {
          consultation: 'Consultation',
          checkup: 'Check-up',
          surgery: 'Surgery',
          emergency: 'Emergency',
          followup: 'Follow-up',
          procedure: 'Medical Procedure'
        },
        
        // Payment Methods
        methods: {
          cash: 'Cash',
          credit_card: 'Credit Card',
          bank_transfer: 'Bank Transfer',
          insurance: 'Insurance'
        },
        
        // Statistics
        stats: {
          totalRevenue: 'Total Revenue',
          totalProfit: 'Total Profit',
          pendingPayments: 'Pending Payments',
          overdueAmount: 'Overdue Amount',
          thisMonth: 'This Month',
          totalInvoices: 'Total invoices',
          revenueMinusInsurance: 'Revenue - Insurance',
          pendingInvoices: '{{count}} invoices',
          overdueInvoices: '{{count}} overdue'
        },
        
        // Actions
        actions: {
          createNewInvoice: 'Create New Invoice',
          exportAll: 'Export All',
          filter: 'Filter',
          export: 'Export',
          view: 'View',
          download: 'Download',
          send: 'Send',
          edit: 'Edit',
          delete: 'Delete',
          viewInvoice: 'View Invoice',
          downloadPDF: 'Download PDF',
          sendReminder: 'Send Reminder',
          clickToChangeStatus: 'Click to change status',
          createInvoice: 'Create Invoice',
          share: 'Share',
          print: 'Print',
          printInvoice: 'Print Invoice',
          generatingPDF: 'Generating PDF for invoice {{invoiceId}}...',
          preparingPrint: 'Preparing invoice {{invoiceId}} for printing...',
          openingWhatsApp: 'Opening WhatsApp to send reminder to {{patient}}...'
        },
        
        // Search
        search: {
          placeholder: 'Search payments by patient, invoice ID, or description...'
          
        },
        
        // Table
        table: {
          invoice: 'Invoice',
          patient: 'Patient',
          amount: 'Amount',
          method: 'Method',
          date: 'Date',
          status: 'Status',
          actions: 'Actions',
          insurance: 'Insurance',
          due: 'Due'
        },
        
        // Tabs
        tabs: {
          all: 'All ({{count}})',
          paid: 'Paid ({{count}})',
          pending: 'Pending ({{count}})',
          overdue: 'Overdue ({{count}})'
        },
        
        // View modes
        view: {
          table: 'Table',
          cards: 'Cards'
        },
        
        // Filters
        filters: {
          title: 'Filter Payments',
          subtitle: 'Filter by status or period',
          allPayments: 'All Payments',
          thisMonth: 'This Month',
          lastMonth: 'Last Month',
          paidOnly: 'Paid Only',
          pendingOnly: 'Pending Only',
          overdueOnly: 'Overdue Only',
          withInsurance: 'With Insurance'
        },
        
        // Status Menu
        statusMenu: {
          title: 'Change Payment Status',
          pendingDesc: 'Payment is awaiting',
          paidDesc: 'Payment completed',
          overdueDesc: 'Payment is late',
          partialDesc: 'Partially paid'
        },
        
        // Dialogs
        dialogs: {
          createNewInvoice: 'Create New Invoice',
          invoicePreview: 'Invoice Preview'
        },
        
        // Placeholders
        placeholders: {
          patientName: 'e.g., Patient Name',
          description: 'Description of services provided...'
        },
        
        // Helpers
        helpers: {
          serviceDate: 'Date when the service was provided',
          insuranceCoverage: 'Leave blank if no insurance coverage'
        },
        
        // Validation
        validation: {
          fillAllFields: 'Please fill in all required fields',
          validAmount: 'Amount must be a valid number greater than 0',
          futureDateNotAllowed: 'Invoice date cannot be in the future',
          dueDateAfterInvoice: 'Due date must be after the invoice date'
        },
        
        // Success Messages
        success: {
          invoiceCreated: '✅ Invoice {{invoiceId}} created successfully for {{patient}}!',
          invoiceDownloaded: '✅ Invoice {{invoiceId}} downloaded successfully!',
          invoiceSentToPrinter: '✅ Invoice {{invoiceId}} sent to printer!',
          reminderSent: '✅ WhatsApp reminder sent to {{patient}}!',
          invoiceDeleted: '🗑️ Invoice {{invoiceId}} deleted successfully!',
          statusChanged: '✅ Payment {{invoiceId}} status changed from "{{oldStatus}}" to "{{newStatus}}"'
        },
        
        // Info Messages
        info: {
          alreadyPaid: 'ℹ️ Invoice {{invoiceId}} is already paid. No reminder needed.'
        },
        
        // Analytics
        analytics: {
          paymentMethods: 'Payment Methods',
          transactions: '{{count}} transactions'
        },
        
        // Insurance
        insurance: {
          none: 'None'
        },
        
        // Reminder Messages
        reminder: {
          title: 'Clinic Payment Reminder',
          dear: 'Dear',
          friendlyReminder: 'This is a friendly reminder about your outstanding payment',
          amountDue: 'Amount Due',
          pleaseArrange: 'Please arrange payment at your earliest convenience.',
          questions: 'For any questions, please contact our clinic.',
          thankYou: 'Thank you!'
        },
        
        // Confirmation Messages
        confirmation: {
          deleteInvoice: 'Are you sure you want to delete invoice {{invoiceId}}?\n\nThis action cannot be undone.'
        }
      },

      // Invoice System
      invoice: {
        title: 'INVOICE',
        
        // Default Clinic Information
        defaultClinic: {
          name: 'Modern Clinic',
          address: '123 Medical Street, Healthcare City',
          phone: '+20 123 456 7890',
          email: 'info@modernclinic.com'
        },
        
        // Labels
        labels: {
          phone: 'Phone',
          email: 'Email',
          invoiceNumber: 'Invoice Number',
          patientId: 'Patient ID',
          issueDate: 'Issue Date',
          dueDate: 'Due Date',
          status: 'Status',
          serviceDate: 'Service Date'
        },
        
        // Sections
        sections: {
          billTo: 'Bill To',
          invoiceDetails: 'Invoice Details',
          servicesAndProcedures: 'Services & Procedures'
        },
        
        // Table Headers
        table: {
          description: 'Description',
          category: 'Category',
          paymentMethod: 'Payment Method',
          amount: 'Amount'
        },
        
        // Status
        status: {
          paid: 'Paid',
          pending: 'Pending',
          overdue: 'Overdue',
          partial: 'Partial'
        },
        
        // Categories
        categories: {
          consultation: 'Consultation',
          checkup: 'Check-up',
          surgery: 'Surgery',
          emergency: 'Emergency',
          followup: 'Follow-up',
          procedure: 'Medical Procedure'
        },
        
        // Payment Methods
        paymentMethods: {
          cash: 'Cash',
          credit_card: 'Credit Card',
          bank_transfer: 'Bank Transfer',
          insurance: 'Insurance'
        },
        
        // Insurance
        insurance: {
          coverageApplied: '✓ Insurance Coverage Applied',
          activeDescription: 'This patient has active insurance coverage'
        },
        
        // Calculations
        calculations: {
          subtotal: 'Subtotal',
          vat: 'VAT',
          totalAmount: 'Total Amount',
          insuranceCoverage: 'Insurance Coverage',
          patientBalance: 'Patient Balance'
        },
        
        // Footer
        footer: {
          paymentTermsTitle: 'Payment Terms & Notes',
          paymentDue30Days: 'Payment is due within 30 days of invoice date',
          latePaymentCharges: 'Late payments may incur additional charges',
          questionsContact: 'For questions, please contact us at',
          generatedBy: 'Generated by',
          managementSystem: 'Management System'
        },
        
        // Actions
        actions: {
          downloadPDF: 'Download PDF',
          printInvoice: 'Print Invoice',
          share: 'Share'
        }
      },

      // Common terms
      common: {
        cancel: 'Cancel',
        close: 'Close',
        for: 'for'
      },

      // Missing Translation Keys for All Pages
      'comprehensive_schedule_management': 'Comprehensive Schedule Management',
      'recurring_schedule': 'Recurring Schedule',
      'comprehensive_schedule_management_subtitle': 'Comprehensive schedule management system for doctors and appointments',
      
      // Appointment Management Keys
      'appointment_management': 'Appointment Management',
      'comprehensive_appointment_scheduling': 'Comprehensive Appointment Scheduling',
      'appointment_statistics': 'Appointment Statistics',
      'todays_progress': "Today's Progress",
      'doctor_hours': 'Doctor Hours',
      'confirmed_today': 'Confirmed Today',
      'search_appointments_placeholder': 'Search appointments by patient, doctor, type, or phone...',
      'realtime_scheduling_coordination': 'Real-time scheduling & patient appointment coordination',
      'auto_sync_patient_database': 'Auto-sync with patient database',
      'appointment_scheduling': 'Appointment Scheduling',
      'professional_appointment_management': 'Professional appointment management & scheduling',
      'schedule_new_appointment': 'Schedule New Appointment',
      'showing_appointments': 'Showing {{showing}} of {{total}} appointments',
      'with_filters_applied': 'with {{count}} filter(s) applied',
      'pending_confirmation': 'Pending Confirmation',
      'no_show': 'No Show',
      'whatsapp_patient': 'WhatsApp Patient',
      'whatsapp_reminder_message': 'Hello {{patient}}, this is a reminder for your {{type}} appointment today at {{time}}.',
      'whatsapp_appointment_message': 'Hello {{patient}}, regarding your {{type}} appointment on {{date}} at {{time}}.',
      'no_appointments_match_filters': 'No appointments match the current filters',
      'try_adjusting_search_criteria': 'Try adjusting your search criteria or clearing some filters',
      'no_appointments_today': 'No appointments scheduled for today',
      'no_pending_appointments': 'No pending appointments',
      'no_completed_appointments': 'No completed appointments',
      'no_confirmed_appointments': 'No confirmed appointments',
      'no_pending_confirmation_appointments': 'No appointments pending confirmation',
      'no_cancelled_appointments': 'No cancelled appointments',
      'no_rescheduled_appointments': 'No rescheduled appointments',
      'no_no_show_appointments': 'No no-show appointments',
      'no_appointments_found': 'No appointments found',
      'schedule_appointments_today': 'Schedule some appointments for today',
      'all_appointments_completed_confirmed': 'All appointments are completed or confirmed',
      'complete_appointments_to_see_here': 'Complete some appointments to see them here',
      'no_confirmed_status_yet': 'No appointments with confirmed status yet',
      'all_appointments_confirmed': 'All appointments are confirmed',
      'no_appointments_cancelled': 'No appointments have been cancelled',
      'no_appointments_rescheduled': 'No appointments have been rescheduled',
      'no_patients_missed_appointments': 'No patients have missed their appointments',
      'schedule_first_appointment': 'Schedule your first appointment to get started'
      
    }
  },
  ar: {
    translation: {
      // Appointment Management
      "appointment_management": "إدارة المواعيد",
      "realtime_scheduling_coordination": "جدولة في الوقت الفعلي وتنسيق مواعيد المرضى",
      "auto_sync_patient_database": "مزامنة تلقائية مع قاعدة بيانات المرضى",
      "appointment_scheduling": "جدولة المواعيد",
      "professional appointment management": "إدارة مواعيد المرضى المهنية والجدولة",
      "todays_schedule": "جدول اليوم",
      "schedule_new_appointment": "جدولة موعد جديد",
      "appointment_statistics": "إحصائيات المواعيد",
      "todays_progress": "تقدم اليوم",
      "doctor_hours": "ساعات الطبيب",
      "doctor hours display": "3 مساءً - 8 مساءً",
      "confirmed_today": "مؤكد اليوم",
      "available_slots": "الفترات المتاحة",
      
      // Search & Filters
      "search_appointments_placeholder": "🔍 البحث في المواعيد بالمريض أو الطبيب أو النوع أو الهاتف...",
      "showing_appointments": "عرض {{showing}} من {{total}} موعد",
      "with_filters_applied": "مع تطبيق {{count}} مرشح/مرشحات",
      "filter": "تصفية",
      "table": "جدول",
      "cards": "بطاقات",
      "all": "الكل",
      "today": "اليوم",
      "search": "بحث",
      
      // Status & States
      "pending": "معلق",
      "completed": "مكتمل",
      "confirmed": "مؤكد",
      "pending_confirmation": "في انتظار التأكيد",
      "cancelled": "ملغي",
      "rescheduled": "معاد جدولته",
      "no_show": "لم يحضر",
      "status": "الحالة",
      
      // Basic Info
      "patient": "المريض",
      "doctor": "الطبيب",
      "time": "الوقت",
      "time_duration": "الوقت والمدة",
      "type": "النوع",
      "priority": "الأولوية",
      "actions": "الإجراءات",
      "duration": "المدة",
      "minutes": "دقيقة",
      "location": "الموقع",
      "notes": "الملاحظات",
      
      // Appointment Types
      "consultation": "استشارة",
      "check_up": "فحص",
      "follow_up": "متابعة",
      "surgery_consultation": "استشارة جراحية",
      "emergency": "طارئ",
      
      // Priority Levels
      "normal": "عادي",
      "high_priority": "أولوية عالية",
      "urgent": "عاجل",
      
      // Actions
      "mark_as_pending": "تحديد كمعلق",
      "mark_as_completed": "تحديد كمكتمل",
      "click_to_change_status": "انقر لتغيير الحالة",
      "view_notes": "عرض الملاحظات",
      "edit_appointment": "تحرير الموعد",
      "create_appointment": "إنشاء موعد",
      "save_appointment": "حفظ الموعد",
      "book_edit_appointment": "حجز/تحرير موعد",
      "cancel": "إلغاء",
      "close": "إغلاق",
      "back": "السابق",
      "next": "التالي",
      
      // WhatsApp Integration
      "whatsapp_patient": "واتساب المريض",
      "whatsapp": "واتساب",
      "whatsapp_reminder_message": "مرحباً {{patient}}، هذا تذكير بموعدك {{type}} اليوم في {{time}}.",
      "whatsapp_appointment_message": "مرحباً {{patient}}، هذا بخصوص موعدك {{type}} في {{date}} في {{time}}.",
      
      // Empty States & Messages
      "no_appointments_match_filters": "لا توجد مواعيد تطابق المرشحات",
      "try_adjusting_search_criteria": "جرب تعديل معايير البحث أو مسح بعض المرشحات",
      "clear_all_filters": "مسح جميع المرشحات",
      "no_appointments_today": "لا توجد مواعيد مجدولة لليوم",
      "no_pending_appointments": "لا توجد مواعيد معلقة",
      "no_completed_appointments": "لا توجد مواعيد مكتملة",
      "no_confirmed_appointments": "لا توجد مواعيد مؤكدة",
      "no_pending_confirmation_appointments": "لا توجد مواعيد في انتظار التأكيد",
      "no_cancelled_appointments": "لا توجد مواعيد ملغاة",
      "no_rescheduled_appointments": "لا توجد مواعيد معاد جدولتها",
      "no_no_show_appointments": "لا توجد مواعيد لم يحضر إليها",
      "no_appointments_found": "لم يتم العثور على مواعيد",
      "schedule_appointments_today": "جدول بعض المواعيد لليوم",
      "all_appointments_completed_confirmed": "جميع المواعيد مكتملة أو مؤكدة",
      "complete_appointments_to_see_here": "أكمل بعض المواعيد لرؤيتها هنا",
      "no_confirmed_status_yet": "لا توجد مواعيد بحالة مؤكدة بعد",
      "all_appointments_confirmed": "تم تأكيد جميع المواعيد",
      "no_appointments_cancelled": "لم يتم إلغاء أي مواعيد",
      "no_appointments_rescheduled": "لم يتم إعادة جدولة أي مواعيد",
      "no_patients_missed_appointments": "لم يفوت أي مرضى مواعيدهم",
      "schedule_first_appointment": "جدول موعدك الأول للبدء",
      
      // Basic Terms
      "clinic_management": "إدارة العيادة",
      "login": "تسجيل الدخول",
      "email": "البريد الإلكتروني",
      "email_address": "عنوان البريد الإلكتروني",
      "password": "كلمة المرور",
      "sign_in": "تسجيل الدخول",
      "signing_in": "جاري تسجيل الدخول...",
      "forgot_password": "هل نسيت كلمة المرور؟",
      "reset_password": "إعادة تعيين كلمة المرور",
      "send_reset_email": "إرسال رسالة إعادة التعيين",
      "sending": "جاري الإرسال...",
      "password_reset_email_sent": "تم إرسال رسالة إعادة تعيين كلمة المرور إلى",
      "enter_email_for_reset": "أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
      "verifying_reset_link": "التحقق من رابط إعادة التعيين",
      "please_wait_verifying": "يرجى الانتظار بينما نتحقق من رابط إعادة تعيين كلمة المرور...",
      "password_reset_success": "تم إعادة تعيين كلمة المرور بنجاح",
      "password_updated_successfully": "تم تحديث كلمة المرور الخاصة بك",
      "password_reset_complete": "تم إعادة تعيين كلمة المرور بنجاح!",
      "redirecting_to_login": "جاري توجيهك إلى صفحة تسجيل الدخول...",
      "go_to_login": "الذهاب لتسجيل الدخول",
      "back_to_login": "العودة لتسجيل الدخول",
      "enter_new_password_for": "أدخل كلمة مرور جديدة لـ",
      "new_password": "كلمة المرور الجديدة",
      "confirm_new_password": "تأكيد كلمة المرور الجديدة",
      "password_min_length": "يجب أن تكون كلمة المرور مكونة من 6 أحرف على الأقل",
      "updating_password": "جاري تحديث كلمة المرور...",
      "update_password": "تحديث كلمة المرور",
      "change_password": "تغيير كلمة المرور",
      "current_password": "كلمة المرور الحالية",
      "enter_current_password_and_new_password": "أدخل كلمة المرور الحالية واختر كلمة مرور آمنة جديدة.",
      "password_changed_successfully": "تم تغيير كلمة المرور بنجاح",
      "passwords_do_not_match": "كلمات المرور غير متطابقة",
      "user_not_authenticated": "المستخدم غير مصادق عليه. يرجى تسجيل الدخول مرة أخرى.",
      "current_password_incorrect": "كلمة المرور الحالية غير صحيحة",
      "password_too_weak": "كلمة المرور ضعيفة جداً. يرجى اختيار كلمة مرور أقوى.",
      "requires_recent_login": "يرجى تسجيل الخروج وتسجيل الدخول مرة أخرى قبل تغيير كلمة المرور.",
      "failed_to_change_password": "فشل في تغيير كلمة المرور. يرجى المحاولة مرة أخرى.",
      "no_account": "ليس لديك حساب؟ اشترك الآن",
      "authorized_access_only": "وصول مخول فقط",
      "management_system": "نظام الإدارة",
      "clinic_care": "كلينيسي",
              "version": "الإصدار 2.0.1",
      
      // Profile & User - الملف الشخصي والمستخدم
      "general_practitioner": "طبيب عام",
      "management": "إدارة",
      "receptionist": "موظف استقبال",
      "full_name": "الاسم الكامل",
      "profile_settings": "الملف الشخصي والإعدادات",
      "sign_out": "تسجيل الخروج",
      
      // Navigation & Dashboard
      "dashboard": "لوحة القيادة",
      "patients": "المرضى",
      "appointments": "المواعيد",
      "inventory": "المخزون",
      "payments": "المدفوعات",
      "notifications": "الإشعارات",
      "scheduling": "جدولة الأطباء",
      "doctor_scheduling": "جدولة الأطباء",
      "settings": "الإعدادات",
      "language": "اللغة",
      "expand_sidebar": "توسيع الشريط الجانبي",
      "collapse_sidebar": "طي الشريط الجانبي",
      "change_language": "تغيير اللغة",
      
      // Form Fields
      "patient_name": "اسم المريض",
      "phone_number": "رقم الهاتف",
      "appointment_date": "تاريخ الموعد",
      "appointment_time": "وقت الموعد",
      "appointment_details": "تفاصيل الموعد",
      "appointment_type": "نوع الموعد",
      "phone_placeholder": "مثال: +20 XXX XXX XXXX",
      "location_placeholder": "مثال: غرفة 101، غرفة استشارة أ",
      "notes_placeholder": "أدخل أي ملاحظات إضافية حول الموعد أو التاريخ الطبي أو المتطلبات الخاصة...",
      "appointment_notes_placeholder": "أدخل أي ملاحظات خاصة أو تعليمات لهذا الموعد...",
      
      // Medical Specialties
      "general_practice": "طب عام",
      "cardiology": "أمراض القلب",
      "dermatology": "الأمراض الجلدية",
      "orthopedics": "جراحة العظام",
      "specialty": "التخصص",
      
      // Validation Messages
      "patient_name_required": "اسم المريض مطلوب",
      "phone_required": "رقم الهاتف مطلوب",
      "date_required": "تاريخ الموعد مطلوب",
      "time_required": "وقت الموعد مطلوب",
      "type_required": "نوع الموعد مطلوب",
      "doctor_required": "اختيار الطبيب مطلوب",
      "fill_required_fields": "يرجى ملء جميع الحقون",
      
      // Success Messages
      "appointment_saved_successfully": "تم حفظ الموعد بنجاح!",
      "saving": "جاري الحفظ...",
      "appointment_save_failed": "فشل في حفظ الموعد",
      
      // Missing Appointment Keys
      "schedule": "جدولة",
      "performance_today": "الأداء اليوم", 
      "clinic_analytics_overview": "نظرة عامة على تحليلات العيادة",
      "time_remaining": "الوقت المتبقي",
      "avg_duration": "متوسط المدة",
      "min": "د",
      "schedule_appointment": "جدولة موعد",
      "more_appointments": "مواعيد أخرى",
      "appointments_finishing_at": "{{count}} مواعيد • تنتهي في {{time}}",
      "done_count": "{{completed}}/{{total}} منجز",
      "enjoy_free_day_or_schedule": "استمتع بيومك الحر أو جدول بعض المواعيد",
        
        // Billing & Payments - الفواتير والمدفوعات
      'billing_information': 'معلومات الفواتير',
      'view_billing': 'عرض الفواتير',
      'payment_list': 'قائمة المدفوعات',
      'payment_details': 'تفاصيل الدفع',
      'payment_method': 'طريقة الدفع',
      'invoice_id': 'معرف الفاتورة',
      'amount': 'المبلغ',
      'date': 'التاريخ',
      'paid': 'مدفوع',
      'unpaid': 'غير مدفوع',
      
      // Inventory - المخزون
      'inventory_list': 'قائمة المخزون',
      'add_edit_inventory_item': 'إضافة أو تعديل عنصر المخزون',
      'low_stock_alerts': 'تنبيهات انخفاض المخزون',
      'item_name': 'اسم العنصر',
      'quantity': 'الكمية',
      'supplier': 'المورد',
      'last_updated': 'آخر تحديث',
      'manage_inventory': 'إدارة المستلزمات الطبية والمعدات',
      'coming_soon': 'قريباً',
      'feature_under_development': 'هذه الميزة قيد التطوير حالياً.',
      
      // Additional Terms
      'save': 'حفظ',
      'register': 'التسجيل',
      'already_have_account': 'هل لديك حساب بالفعل؟ تسجيل الدخول',
      'view': 'عرض',
      'edit': 'تعديل',
      'delete': 'حذف',
      'confirm': 'تأكيد',
      'loading': 'جاري التحميل...',
      'refresh': 'تحديث',
      'sort': 'ترتيب',
      'export': 'تصدير',
      'import': 'استيراد',
      'print': 'طباعة',
      
      // Dashboard & Patient Management  
      'clinical_dashboard': 'لوحة القيادة الطبية',
      'working_doctors_today': 'الأطباء العاملون اليوم',
      'patient_management': 'إدارة المرضى',
      'whatsapp_all': 'واتساب للجميع',
      'add_new_patient': 'إضافة مريض جديد',
      'search_patients_placeholder': 'البحث في المرضى بالاسم أو البريد الإلكتروني أو الهاتف أو الحالة...',
      'organize': 'تنظيم',
      'active_filters': 'المرشحات النشطة',
      'gender': 'الجنس',
      'age': 'العمر',
      'condition': 'الحالة المرضية',
      'male': 'ذكر',
      'female': 'أنثى',
      'contact': 'جهة الاتصال',
      'last_visit': 'آخر زيارة',
      'years': 'سنة',
      
      // Patient Form Fields - حقول نموذج المريض
      'patient_age': 'عمر المريض',
      'patient_gender': 'جنس المريض',
      'patient_address': 'عنوان المريض',
      'patient_condition': 'حالة المريض',
      'medical_history': 'التاريخ الطبي',
      'emergency_contact_name': 'اسم جهة الاتصال الطارئة',
      'emergency_contact_phone': 'هاتف جهة الاتصال الطارئة',
      'insurance_provider': 'مقدم التأمين',
      'insurance_number': 'رقم التأمين',
      'current_medications': 'الأدوية الحالية',
      'blood_type': 'فصيلة الدم',
      'height': 'الطول',
      'weight': 'الوزن',
      
      // Patient Status Values - قيم حالة المريض
      'old': 'مريض قديم',
      'new': 'مريض جديد',
      'follow-up': 'متابعة',
      'admitted': 'منوم',
      'transferred': 'محول',
      'discharged': 'مخرج',
      
      // Medical Conditions - الحالات الطبية
      'diabetes': 'السكري',
      'hypertension': 'ارتفاع ضغط الدم',
      'asthma': 'الربو',
      'routine checkup': 'فحص روتيني',
      'routine_checkup': 'فحص روتيني',
      'diabetes type 2': 'السكري النوع الثاني',
      'migraine': 'الصداع النصفي',
      'chest pain': 'ألم في الصدر',
      'back pain': 'ألم في الظهر',
      'headache': 'صداع',
      'fever': 'حمى',
      'cough': 'سعال',
      'cold': 'نزلة برد',
      'flu': 'إنفلونزا',
      'allergies': 'حساسية',
      'high blood pressure': 'ارتفاع ضغط الدم',
      'low blood pressure': 'انخفاض ضغط الدم',
      'heart disease': 'أمراض القلب',
      'kidney disease': 'أمراض الكلى',
      'liver disease': 'أمراض الكبد',
      'arthritis': 'التهاب المفاصل',
      'depression': 'اكتئاب',
      'anxiety': 'قلق',
      'obesity': 'سمنة',
      'anemia': 'فقر الدم',
      'thyroid disorder': 'اضطراب الغدة الدرقية',
      
      // Medical Specialties  
      'general_medicine': 'طب عام',
      'pediatrics': 'طب الأطفال',
      'neurology': 'الأعصاب',
      'gastroenterology': 'الجهاز الهضمي',
      'ophthalmology': 'طب العيون',
      'ent': 'أنف وأذن وحنجرة',
      'psychiatry': 'الطب النفسي',
      'other': 'أخرى',
      
      // Tab Categories
      'all patients': 'جميع المرضى',
      'new patients': 'مرضى جدد',
      'follow-up patients': 'مرضى متابعة',
      'old patients': 'مرضى قدامى',
      'under observation': 'تحت الملاحظة',
      'transferred patients': 'مرضى محولون',
      'discharged patients': 'مرضى مخرجون',
      'appointment data': 'بيانات المواعيد',
      
      // Appointment status - حالة الموعد
      'checked-in': 'تم تسجيل الدخول',
      'waiting': 'في الانتظار',
      'in-progress': 'قيد التنفيذ',
      'scheduled': 'مجدول',
      
      // Additional status terms - مصطلحات حالة إضافية
      'active': 'نشط',
      'none_today': 'لا يوجد اليوم',
      
      // Doctor Scheduling terms
      'add_time_slot': 'إضافة جدول زمني',
      'edit_doctor_schedule': 'تعديل جدول الطبيب',
      'working_hours_start': 'بدء ساعات العمل',
      'working_hours_end': 'نهاية ساعات العمل',
      'off_days': 'أيام الراحة',
      'available_slot': 'جدول متاح',
      'regular_working_hours': 'ساعات عمل ثابتة',
      'please_fill_all_fields': 'من فضلك أملأ جميع الحقون',
      'time_slot_already_exists': 'جدول زمني موجود بالفعل',
      'time_slot_already_reserved': 'جدول زمني محجوز بالفعل',
      'edit_doctor_information': 'تعديل معلومات الطبيب',
      'working_hours_schedule': 'جدول ساعات العمل والجدول',
      'consultation_duration': 'مدة الاستشارة',
      'max_patients_per_hour': 'أقصى عدد مرضى في الساعة',
      'reserved_for_patient': 'محجوز للمريض',
      'standard_doctor_availability': 'التواجد الطبي المعتمد خلال ساعات العمل',
      'manually_added_slot': 'جدول ساعات متاح (إضافة جديدة)',
      'professional_doctor_schedule_management': '🩺 إدارة مواعيد وجداول الأطباء المهنية',
      'schedule_date': '📅 تاريخ الجدولة:',
      'doctor_schedule_statistics': '📊 إحصائيات جداول الأطباء',
      'working_today': 'يعملون اليوم',
      'total_appointments': 'إجمالي المواعيد',
      'busy_doctors': 'أطباء مشغولون',
      'available_doctors': 'أطباء متاحون',
      'time_slot_color_guide': '🎨 دليل ألوان الأوقات المحددة',
      'available_slot_added_manually': '⏰ وقت متاح (مضاف يدوياً)',
      'reserved_patient_appointment': '🔒 محجوز (موعد مريض)',
      'interactive_time_slots': '💡 الأوقات المحددة التفاعلية',
      'click_time_slot_to_edit': 'انقر على أي وقت محدد لتعديل نوعه أو إضافة تفاصيل المريض أو تعديل الجدول!',
      'doctor_schedules': 'جداول الأطباء',
      'weekly_overview': 'النظرة الأسبوعية',
      'all_doctors': 'جميع الأطباء',
      'doctor_schedules_for_date': '📋 جداول الأطباء لتاريخ {{date}}',
      'how_to_manage_time_slots': '💡 كيفية إدارة الأوقات المحددة:',
      'click_plus_button_to_add': '• انقر على زر + بجانب أي طبيب لإضافة أوقات متاحة',
      'add_multiple_time_slots': '• أضف عدة أوقات محددة لأي طبيب، حتى لو كان لديه مواعيد بالفعل',
      'click_time_slot_chip_to_edit': '• انقر على أي وقت محدد للتعديل أو الحجز أو التحويل لأنواع مختلفة',
      'time_slots': 'الأوقات المحددة',
      'time_slots_total': 'الأوقات المحددة ({{count}} إجمالي)',
      'schedule_utilization': 'استخدام الجدول',
      'reserved': 'محجوز',
      'doctor_schedule': 'جدول الطبيب',
      'review': 'مراجعة',
      
      // Weekly scheduling and recurring appointments - NEW
      'weekly_schedule': 'جدول أسبوعي',
      'weekly_schedule_saved': 'تم حفظ الجدول الأسبوعي للدكتور {{doctor}} مع {{count}} موعد جديد',
      'weekly_schedule_generated': 'تم إنشاؤه من الجدول الأسبوعي',
      'day_off': 'يوم راحة',
      'off': 'راحة',
      'recurring_appointment': 'موعد متكرر',
      'recurring_appointments_created': 'تم إنشاء {{count}} موعد متكرر لمدة {{weeks}} أسابيع',
      'week': 'أسبوع',
      
      // Daily availability management - إدارة التوفر اليومي
      'quick_availability_presets': 'الإعدادات السريعة للتوفر',
      'morning_preset': '🌅 الصباح (9-12)',
      'afternoon_preset': '☀️ بعد الظهر (2-5)',
      'evening_preset': '🌙 المساء (6-9)',
      'full_day_preset': '🌈 يوم كامل',
      'default_hours': '📋 الساعات الافتراضية',
      'clear_all': '🗑️ مسح الكل',
      'current_time_slots': 'الأوقات الحالية',
      'add_custom_time': 'إضافة وقت مخصص',
      'no_slots_message': 'لم يتم إضافة أوقات بعد. استخدم الإعدادات السريعة أعلاه أو أضف أوقات مخصصة أدناه.',
      'availability_presets': 'الإعدادات المسبقة للتوفر',
      'add_custom_time_slot': 'إضافة فترة زمنية مخصصة',
      'select_time': 'اختر الوقت',
      'add_slot': 'إضافة فترة',
      
      // Days of the week - أيام الأسبوع
      'monday': 'الاثنين',
      'tuesday': 'الثلاثاء',
      'wednesday': 'الأربعاء',
      'thursday': 'الخميس',
      'friday': 'الجمعة',
      'saturday': 'السبت',
      'sunday': 'الأحد',
      
      // Short day names - أسماء الأيام المختصرة
      'mon': 'اثنين',
      'tue': 'ثلاثاء',
      'wed': 'أربعاء',
      'thu': 'خميس',
      'fri': 'جمعة',
      'sat': 'سبت',
      'sun': 'أحد',
      
      // Additional scheduling terms - مصطلحات جدولة إضافية
      'all_doctors_day': 'جميع الأطباء {{day}}',
      'schedule_for_day': 'جدول يوم {{day}}',
      'doctors_working_on': 'الأطباء العاملون يوم {{day}}',
      
      // Doctor Management & Scheduling - إدارة الأطباء والجدولة
      'add_new_doctor': 'إضافة طبيب جديد',
      'register_new_medical_professional': 'تسجيل متخصص طبي جديد في فريق عيادتك',
      'doctor_information': 'معلومات الطبيب',
      'doctor_registration_description': 'يرجى ملء التفاصيل أدناه لإضافة طبيب جديد إلى نظام إدارة عيادتك. جميع الحقول المحددة بعلامة * مطلوبة للتسجيل.',
      'doctor_name_placeholder': 'مثال: د. أحمد حسن محمد',
      'medical_specialty': 'التخصص الطبي',
      'working_schedule': 'جدول العمل',
      'typical_duration_range': 'المدة المعتادة: 15-60 دقيقة',
      'recommended_patients_range': 'العدد الموصى به: 2-4 مرضى',
      'add_doctor_to_clinic': 'إضافة طبيب إلى العيادة',
      'doctor_added_successfully': 'تم إضافة الطبيب {{name}} بنجاح!',
      'doctor_updated_successfully': 'تم تحديث الطبيب {{name}} بنجاح!',
      'edit_doctor_profile': 'تعديل ملف الطبيب',
      'please_fill_doctor_name_specialty': 'يرجى ملء اسم الطبيب والتخصص',
      
      // Create Availability Dialog - حوار إنشاء التوفر
      'create_availability_for': 'إنشاء توفر للطبيب {{doctor}}',
      'what_this_does': 'ℹ️ ما يفعله هذا:',
      'add_time_slot_description': 'هذا يضيف فترة زمنية متاحة إلى جدول الطبيب. يمكنك إضافة فترات زمنية لأي طبيب، حتى لو كان لديه مواعيد موجودة بالفعل.',
      'green_slots': '• الفترات الخضراء:',
      'blue_slots': '• الفترات الزرقاء:',
      'red_slots': '• الفترات الحمراء:',
      'regular_working_hours_description': 'ساعات العمل العادية (جدول الطبيب الطبيعي)',
      'available_slots_description': 'الفترات المتاحة التي تضيفها يدوياً (مثل هذه)',
      'reserved_slots_description': 'المواعيد المحجوزة مع أسماء المرضى الفعلية',
      'can_add_multiple_time_slots': '✅ يمكنك إضافة عدة فترات زمنية لنفس الطبيب في أوقات مختلفة!',
      'available_time_slot_added': 'تم إضافة فترة زمنية متاحة {{time}} للطبيب {{doctor}} في {{date}}. الطبيب لديه الآن {{count}} فترة زمنية.',
      'add_available_time_slot': 'إضافة فترة زمنية متاحة',
      'enter_time_format': 'أدخل أي وقت بصيغة HH:MM (مثال: 14:30، 09:15)',
      'time_hhmm_format': 'الوقت (صيغة HH:MM)',
      'change_time_or_enter_new': 'تغيير الوقت أو إدخال فترة زمنية مخصصة جديدة',
      'personal_information': 'المعلومات الشخصية',
      'slots': 'الفترات',
      'weekly_overview_description': 'نظرة شاملة على جداول عمل جميع الأطباء خلال الأسبوع. انقر على تعديل لتغيير جدول أي طبيب.',
      'weekly_working_patterns': 'أنماط العمل الأسبوعية',
      'weekly_schedule_overview': 'النظرة الأسبوعية للجداول',
      'all_doctors_count': 'جميع الأطباء ({{count}})',
      'add_time_slot_button': 'إضافة فترة زمنية',
      'save_time_slot': 'حفظ الفترة الزمنية',
      'cancel_time_slot': 'إلغاء الفترة الزمنية',
      'edit_time_slot': 'تحرير الفترة الزمنية',
      'delete_time_slot': 'حذف الفترة الزمنية',
      'time_slot_saved': 'تم حفظ الفترة الزمنية بنجاح',
      'invalid_time_format': 'تنسيق الوقت غير صالح',
      'time_already_reserved': 'هذا الوقت محجوز بالفعل',
      
      // Patient page sync and organization terms
      'automatic_sync_active': '🔄 مزامنة تلقائية نشطة للمريض والموعد',
      'sync_now': 'مزامنة الآن',
      'from_appointments': 'من المواعيد',
      'completion': 'الإنجاز',
      'reservation': 'الحجز',
      'reservations': 'الحجوزات',
      'appointment_reservations': 'حجوزات المواعيد',
      'appointment_completion_status': 'حالة إنجاز المواعيد',
      'patients_with_appointments_listed_first': 'المرضى الذين لديهم مواعيد مدرجون أولاً.',
      'patients_with_completed_listed_first': 'المرضى الذين لديهم مواعيد مكتملة مدرجون أولاً.',
      'organized_by_text': 'المرضى منظمون حسب',
      'appointment_data_organized_by_completion': 'تُظهر هذه التبويبة بيانات المواعيد منظمة حسب حالة الإنجاز، مزامنة تلقائياً من صفحة المواعيد.',
      'appointments_awaiting_completion': 'المواعيد في انتظار الإنجاز',
      'pending_not_completed': 'قيد الانتظار/غير مكتمل',
      'no_completed_appointments_found': 'لم يتم العثور على مواعيد مكتملة',
      'no_pending_appointments_found': 'لم يتم العثور على مواعيد قيد الانتظار',
      'successfully_completed_appointments': 'تم إكمال المواعيد بنجاح',
      'loading_appointment_data': 'جاري تحميل بيانات الموعد...',
      'syncing_appointment_data': 'مزامنة بيانات المواعيد من صفحة المواعيد',
      'completed_status': 'مكتمل',
      'total_patients': 'إجمالي المرضى',
      'comprehensive_patient_care': '🏥 صحة المريض الشاملة',
      'sync_appointments': 'مزامنة المواعيد',
      'for': 'لـ',
      
      // Settings Page
      'manage_profile_clinic_settings': 'إدارة ملفك الشخصي وإعدادات العيادة والنظام',
      'settings_menu': 'قائمة الإعدادات',
      'configure_clinic_preferences': 'تكوين إعدادات العيادة والتفضيلات',
      'profile_management': 'إدارة الملف الشخصي',
      'clinic_settings_tab': 'إعدادات العيادة',
      'security_privacy': 'الأمان والخصوصية',
      'system_settings': 'إعدادات النظام',
      'profile_information': 'معلومات الملف الشخصي',
      'manage_personal_professional_details': 'إدارة تفاصيلك الشخصية والمهنية',
      'edit_profile': 'تحرير الملف الشخصي',
      'cancel_edit': 'إلغاء التحرير',
      'available': 'متاح',
      'hours_ago': 'منذ {{count}} ساعات',
      'basic_information': 'المعلومات الأساسية',
      'professional_information': 'المعلومات المهنية',
      'not_specified': 'غير محدد',
      'emergency_contact': 'جهة الاتصال الطارئة',
      'primary_specialization': 'التخصص الرئيسي',
      'years_of_experience': 'سنوات الخبرة',
      'medical_license_number': 'رقم الرخصة الطبية',
      'medical_school': 'كلية الطب',
      'residency': 'الإقامة الطبية',
      'board_certifications': 'شهادات المجلس',
      'languages_bio': 'اللغات والسيرة الذاتية',
      'languages_spoken': 'اللغات المتحدثة',
      'consultation_fee': 'رسوم الاستشارة',
      'professional_bio': 'السيرة الذاتية المهنية',
      'no_bio_available': 'لا توجد سيرة ذاتية متاحة',
      'availability_settings': 'إعدادات التوفر',
      'working_days': 'أيام العمل',
      'working_hours': 'ساعات العمل',
      'lunch_break': 'استراحة الغداء',
      
      // Notifications - الإشعارات
      'failed_to_load_settings': 'فشل في تحميل الإعدادات',
      'failed_to_refresh_notifications': 'فشل في تحديث الإشعارات',
      'notification_marked_as_read': 'تم تحديد الإشعار كمقروء',
      'failed_to_mark_as_read': 'فشل في تحديد الإشعار كمقروء',
      'notification_deleted': 'تم حذف الإشعار',
      'failed_to_delete_notification': 'فشل في حذف الإشعار',
      'all_notifications_marked_as_read': 'تم تحديد جميع الإشعارات كمقروءة',
      'failed_to_mark_all_as_read': 'فشل في تحديد جميع الإشعارات كمقروءة',
      'settings_saved_successfully': 'تم حفظ الإعدادات بنجاح',
      'failed_to_save_settings': 'فشل في حفظ الإعدادات',
      'mark_as_read': 'تحديد كمقروء',
      'delete_notification': 'حذف الإشعار',
      'notification_preferences': 'تفضيلات الإشعارات',
      'realtime_updates': 'تحديثات في الوقت الفعلي من نظام إدارة العيادة',
      'no_notifications_found': 'لم يتم العثور على إشعارات',
      'all_caught_up': 'أنت محدث! ستظهر الإشعارات الجديدة هنا عندما يكون هناك شيء مهم للمشاركة.',
      'notification_settings': 'إعدادات الإشعارات',
      'customize_notification_preferences': 'تخصيص تفضيلات الإشعارات الخاصة بك',
      'appointment_notifications': 'إشعارات المواعيد',
      'payment_notifications': 'إشعارات المدفوعات',
      'system_updates': 'تحديثات النظام',
      'save_settings': 'حفظ الإعدادات',
      'quick_actions': 'إجراءات سريعة',
      'manage_all_notifications': 'إدارة جميع الإشعارات في وقت واحد',
      'mark_all_as_read': 'تحديد الجميع كمقروء',
      'clear_all_notifications': 'مسح جميع الإشعارات',
      'refresh_from_all_data': 'تحديث من جميع البيانات',
      'load_more_notifications': 'تحميل المزيد من الإشعارات',
      'loading_more': 'جاري التحميل...',
      'all_notifications_loaded': 'تم تحميل جميع الإشعارات ({{count}} إجمالي)',
      'loaded_more_notifications': 'تم تحميل {{count}} إشعار إضافي',
      'failed_to_load_more': 'فشل في تحميل المزيد من الإشعارات',
      'notifications_refreshed': 'تم تحديث الإشعارات! تم العثور على {{total}} إشعار إجمالي ({{unread}} غير مقروء) من جميع بيانات التطبيق',
      'refreshing_from_all_modules': 'تحديث الإشعارات من جميع وحدات التطبيق...',
      'refreshing_notifications': 'تحديث الإشعارات',
      'notification_type_all': 'جميع الإشعارات',
      'notification_type_appointment': 'المواعيد',
      'notification_type_payment': 'المدفوعات',
      'notification_type_inventory': 'المخزون',
      'notification_type_system': 'النظام',
      'notification_appointment_type': 'موعد',
      'notification_payment_type': 'دفع',
      'notification_inventory_type': 'مخزون',
      'notification_system_type': 'نظام',
      'created_at': 'تم الإنشاء في',
      'message': 'الرسالة',
      'title': 'العنوان',
      'read': 'مقروء',
      'unread': 'غير مقروء',
      'notification_cleared': 'تم مسح الإشعار',
      'all_notifications_cleared': 'تم مسح جميع الإشعارات',
      'failed_to_clear_notifications': 'فشل في مسح الإشعارات',
      'notification_count': '{{count}} إشعار',
      'unread_count': '{{count}} غير مقروء',
      'refreshing': 'جاري التحديث...',
      'refresh_all_data': 'تحديث جميع البيانات',
      'processing': 'جاري المعالجة...',
      'clear_all_with_count': 'مسح الجميع ({{count}})',
      
      // Inventory Alert Messages - رسائل تنبيهات المخزون
      'low_stock_alert_title': 'تنبيه انخفاض المخزون',
      'out_of_stock_alert_title': 'تنبيه نفاد المخزون',
      'low_stock_message': '{{itemName}} منخفض. متبقي {{quantity}} وحدة فقط (الحد الأدنى: {{minQuantity}})',
      'out_of_stock_message': '{{itemName}} نفد من المخزون. يرجى إعادة الطلب من {{supplier}}',
      'units_left': 'وحدة متبقية',
      'minimum': 'الحد الأدنى',
      'please_reorder_from': 'يرجى إعادة الطلب من',
      
      // Notification Titles & Messages - عناوين ورسائل الإشعارات
      'new_appointment_scheduled': 'تم جدولة موعد جديد',
      'appointment_reminder': 'تذكير بالموعد',
      'patient_no_show': 'لم يحضر المريض',
      'appointment_cancelled': 'تم إلغاء الموعد',
      'payment_received': 'تم استلام الدفعة',
      'payment_overdue': 'دفعة متأخرة',
      'payment_due_soon': 'دفعة مستحقة قريباً',
      'new_patient_registration': 'تسجيل مريض جديد',
      'follow_up_due': 'متابعة مستحقة',
      'medication_refill_due': 'إعادة تعبئة الدواء مستحقة',
      'system_update': 'تحديث النظام',
      'system_update_message': 'تم إضافة ميزات جديدة إلى نظام إدارة المرضى. تحقق من تتبع الأدوية المحدث!',
      

      'years_text': '{{count}} سنوات',
      'egp_amount': '{{amount}} جنيه مصري',
      'bio_placeholder': 'د. أحمد علي طبيب عام معتمد بخبرة تزيد عن 8 سنوات في تقديم خدمات الرعاية الصحية الشاملة. يتخصص في الطب الوقائي وإدارة الأمراض المزمنة وتثقيف المرضى.',
      'edit_profile_information': 'تحرير معلومات الملف الشخصي',
      'profile_statistics': 'إحصائيات الملف الشخصي',
      'performance_overview': 'نظرة عامة على الأداء',
      'appointments_this_month': 'المواعيد هذا الشهر',
      'successful_treatments': 'العلاجات الناجحة',
      'vacation': 'في إجازة',
      'emergency_only': 'طوارئ فقط',
      'saving_profile': 'حفظ الملف الشخصي...',
      'saving_clinic_settings': 'حفظ إعدادات العيادة...',
      'save_clinic_settings': 'حفظ إعدادات العيادة',
      'save_preferences': 'حفظ التفضيلات',
      
      // Settings Page - Additional Arabic Keys - مفاتيح إضافية لصفحة الإعدادات
      'achievements_certifications': 'الإنجازات والشهادات',
      'awards_recognitions': 'الجوائز والتقديرات',
      'board_certified': 'معتمد من المجلس',
      'excellence_award': 'جائزة التميز',
      'best_doctor_2023': 'أفضل طبيب 2023 - نقابة الأطباء المصرية',
      'cairo_university_medicine': 'كلية الطب جامعة القاهرة',
      'professional_member': 'عضو مهني',
      'egyptian_medical_syndicate_member': 'نقابة الأطباء المصرية - عضو رقم 12345',
      'add_achievement': 'إضافة إنجاز',
      'professional_information_actions': 'المعلومات المهنية والإجراءات',
      'license_details_quick_actions': 'تفاصيل الترخيص والإجراءات السريعة',
      'license_number': 'رقم الترخيص',
      'registration_date': 'تاريخ التسجيل',
      'january_15_2016': '15 يناير 2016',
      'department': 'القسم',
      'license_status': 'حالة الترخيص',
      'update_credentials': 'تحديث الاعتمادات',
      'update_professional_credentials': 'تحديث الاعتمادات المهنية',
      'professional_credentials': 'الاعتمادات المهنية',
      'medical_license_certificate': 'شهادة الترخيص الطبي',
      'license_information': 'معلومات الترخيص',
      'license_type': 'نوع الترخيص',
      'licensing_authority': 'سلطة الترخيص',
      'license_valid_from': 'صالح من',
      'license_valid_until': 'صالح حتى',
      'license_scope': 'نطاق الترخيص',
      'specialty_board_certification': 'شهادة المجلس التخصصي',
      'board_name': 'اسم المجلس',
      'certification_date': 'تاريخ الشهادة',
      'certification_status': 'حالة الشهادة',
      'active_status': 'نشط',
      'expired_status': 'منتهي الصلاحية',
      'pending_status': 'قيد الانتظار',
      'suspended_status': 'معلق',
      'continuing_education': 'التعليم المستمر',
      'cme_credits': 'ساعات التعليم الطبي المستمر',
      'last_renewal_date': 'تاريخ آخر تجديد',
      'next_renewal_date': 'تاريخ التجديد القادم',
      'professional_memberships': 'العضويات المهنية',
      'organization_name': 'اسم المنظمة',
      'membership_type': 'نوع العضوية',
      'membership_status': 'حالة العضوية',
      'membership_since': 'عضو منذ',
      'update_license_info': 'تحديث معلومات الترخيص',
      'save_credentials': 'حفظ الاعتمادات',
      'verify_credentials': 'التحقق من الاعتمادات',
      'credentials_updated_successfully': 'تم تحديث الاعتمادات المهنية بنجاح',
      'license_validated': 'تم التحقق من الترخيص بنجاح',
      'invalid_license_number': 'رقم ترخيص غير صالح',
      'license_expired': 'انتهت صلاحية الترخيص',
      'credentials_form_title': 'إدارة الاعتمادات المهنية',
      'credentials_form_subtitle': 'إدارة تراخيصك الطبية وشهاداتك وعضوياتك المهنية',
      'license_upload_instruction': 'ارفع نسخة واضحة من ترخيصك الطبي',
      'supported_file_formats': 'الصيغ المدعومة: PDF، JPG، PNG (حد أقصى 5 ميجابايت)',
      'credential_required_field': 'هذا الحقل مطلوب للاعتماد',
      'license_number_format': 'تنسيق رقم الترخيص غير صالح',
      'date_validation_future': 'لا يمكن أن يكون التاريخ في المستقبل',
      'date_validation_past': 'لا يمكن أن يكون التاريخ في الماضي',
      'renewal_reminder': 'سيتم إرسال تذكير التجديد قبل 30 يوماً من انتهاء الصلاحية',
      'upload_supporting_documents': 'رفع المستندات الداعمة',
      'document_verification_pending': 'التحقق من المستند معلق',
      'document_verified': 'تم التحقق من المستند',
      'document_rejected': 'تم رفض المستند',
      'medical_license_form': 'نموذج الترخيص الطبي',
      'update_credentials_form': 'نموذج تحديث الاعتمادات',
      'add_achievement_form': 'نموذج إضافة إنجاز',
      'license_certificate_upload': 'رفع شهادة الترخيص',
      'certificate_file': 'ملف الشهادة',
      'browse_files': 'تصفح الملفات',
      'drag_drop_files': 'اسحب وأفلت الملفات هنا',
      'file_size_limit': 'الحد الأقصى لحجم الملف: 10 ميجابايت',
      'accepted_formats': 'الصيغ المقبولة: PDF، JPG، PNG',
      'license_verification_status': 'حالة التحقق من الترخيص',
      'verified': 'تم التحقق',
      'not_verified': 'لم يتم التحقق',
      'under_review': 'قيد المراجعة',
      'achievement_category_options': 'خيارات فئة الإنجاز',
      'professional_award': 'جائزة مهنية',
      'research_publication': 'نشر بحثي',
      'conference_presentation': 'عرض في مؤتمر',
      'community_service': 'خدمة مجتمعية',
      'other_achievement': 'إنجاز آخر',
      'form_validation_errors': 'أخطاء التحقق من النموذج',
      'please_fix_errors': 'يرجى إصلاح الأخطاء التالية:',
      'required_field_empty': 'الحقل المطلوب فارغ',
      'invalid_email_format': 'تنسيق البريد الإلكتروني غير صالح',
      'invalid_phone_format': 'تنسيق رقم الهاتف غير صالح',
      'file_too_large': 'حجم الملف كبير جداً',
      'unsupported_file_type': 'نوع الملف غير مدعوم',
      'form_submitted_successfully': 'تم إرسال النموذج بنجاح',
      'changes_saved': 'تم حفظ التغييرات بنجاح',
      'upload_in_progress': 'جاري الرفع...',
      'processing_request': 'جاري معالجة طلبك...',
      'confirm_delete': 'هل أنت متأكد من حذف هذا العنصر؟',
      'action_cannot_be_undone': 'لا يمكن التراجع عن هذا الإجراء',
      'view_certificate': 'عرض الشهادة',
      'view_certification': 'عرض الشهادة',
      'certification_details': 'تفاصيل الشهادة',
      'certificate_name': 'اسم الشهادة',
      'issuing_organization': 'الجهة المصدرة',
      'issue_date': 'تاريخ الإصدار',
      'expiry_date': 'تاريخ انتهاء الصلاحية',
      'certificate_number': 'رقم الشهادة',
      'achievement_title': 'عنوان الإنجاز',
      'achievement_description': 'وصف الإنجاز',
      'achievement_date': 'تاريخ الإنجاز',
      'achievement_category': 'فئة الإنجاز',
      'award_title': 'عنوان الجائزة',
      'awarded_by': 'ممنوحة من',
      'add_new_achievement': 'إضافة إنجاز جديد',
      'edit_achievement': 'تحرير الإنجاز',
      'save_achievement': 'حفظ الإنجاز',
      'cancel_changes': 'إلغاء التغييرات',
      'form_validation_required': 'هذا الحقل مطلوب',
      'form_validation_invalid': 'يرجى إدخال قيمة صحيحة',
      'upload_certificate': 'رفع الشهادة',
      'attach_document': 'إرفاق مستند',
      'remove_attachment': 'إزالة المرفق',
      'select_category': 'اختر الفئة',
      'enter_details': 'أدخل التفاصيل',
      'doctor_first_name': 'الاسم الأول للطبيب',
      'doctor_last_name': 'اسم العائلة للطبيب',
      'doctor_email': 'بريد الطبيب الإلكتروني',
      'doctor_phone': 'هاتف الطبيب',
      'years_experience': 'سنوات الخبرة',
      'qualification': 'المؤهل',
      'university': 'الجامعة',
      'graduation_year': 'سنة التخرج',
      'clinic_room': 'غرفة العيادة',
      'basic_clinic_information': 'معلومات العيادة الأساسية',
      'view_clinic_core_details': 'عرض التفاصيل الأساسية والمعلومات الخاصة بعيادتك',
      'clinic_information': 'معلومات العيادة',
      'operation_information': 'معلومات التشغيل',
      'licensed_medical_facility': 'منشأة طبية مرخصة',
      'active_valid': 'نشط وصالح',

      
      // Payment Management System - نظام إدارة المدفوعات
      payment: {
        title: 'إدارة المدفوعات',
        subtitle: 'تبسيط الفواتير وتتبع المدفوعات وإدارة الفوترة بسلاسة',
        
        // Fields
        fields: {
          amount: 'المبلغ',
          patientName: 'اسم المريض',
          invoiceDate: 'تاريخ الفاتورة',
          dueDate: 'تاريخ الاستحقاق',
          description: 'الوصف',
          serviceCategory: 'فئة الخدمة',
          paymentMethod: 'طريقة الدفع',
          insuranceCoverage: 'التغطية التأمينية',
          insurance: 'التأمين',
          method: 'الطريقة'
        },
        
        // Status
        status: {
          paid: 'مدفوع',
          pending: 'معلق',
          overdue: 'متأخر',
          partial: 'جزئي'
        },
        
        // Categories
        categories: {
          consultation: 'استشارة',
          checkup: 'فحص روتيني',
          surgery: 'جراحة',
          emergency: 'طوارئ',
          followup: 'متابعة',
          procedure: 'إجراء طبي'
        },
        
        // Payment Methods
        methods: {
          cash: 'نقداً',
          credit_card: 'بطاقة ائتمان',
          bank_transfer: 'تحويل بنكي',
          insurance: 'تأمين'
        },
        
        // Statistics
        stats: {
          totalRevenue: 'إجمالي الإيرادات',
          totalProfit: 'إجمالي الربح',
          pendingPayments: 'المدفوعات المعلقة',
          overdueAmount: 'المبلغ المتأخر',
          thisMonth: 'هذا الشهر',
          totalInvoices: 'إجمالي الفواتير',
          revenueMinusInsurance: 'الإيرادات - التأمين',
          pendingInvoices: '{{count}} فاتورة',
          overdueInvoices: '{{count}} متأخرة'
        },
        
        // Actions
        actions: {
          createNewInvoice: 'إنشاء فاتورة جديدة',
          exportAll: 'تصدير الكل',
          filter: 'تصفية',
          export: 'تصدير',
          view: 'عرض',
          download: 'تحميل',
          send: 'إرسال',
          edit: 'تعديل',
          delete: 'حذف',
          viewInvoice: 'عرض الفاتورة',
          downloadPDF: 'تحميل PDF',
          sendReminder: 'إرسال تذكير',
          clickToChangeStatus: 'اضغط لتغيير الحالة',
          createInvoice: 'إنشاء فاتورة',
          share: 'مشاركة',
          print: 'طباعة',
          printInvoice: 'طباعة الفاتورة',
          generatingPDF: 'جاري إنشاء PDF للفاتورة {{invoiceId}}...',
          preparingPrint: 'جاري تحضير الفاتورة {{invoiceId}} للطباعة...',
          openingWhatsApp: 'جاري فتح واتساب لإرسال تذكير لـ {{patient}}...'
        },
        
        // Search
        search: {
          placeholder: 'البحث في المدفوعات بواسطة المريض أو رقم الفاتورة أو الوصف...'
        },
        
        // Table
        table: {
          invoice: 'الفاتورة',
          patient: 'المريض',
          amount: 'المبلغ',
          method: 'الطريقة',
          date: 'التاريخ',
          status: 'الحالة',
          actions: 'الإجراءات',
          insurance: 'التأمين',
          due: 'الاستحقاق'
        },
        
        // Tabs
        tabs: {
          all: 'الكل ({{count}})',
          paid: 'مدفوع ({{count}})',
          pending: 'معلق ({{count}})',
          overdue: 'متأخر ({{count}})'
        },
        
        // View modes
        view: {
          table: 'جدول',
          cards: 'بطاقات'
        },
        
        // Filters
        filters: {
          title: 'تصفية المدفوعات',
          subtitle: 'تصفية حسب الحالة أو الفترة',
          allPayments: 'جميع المدفوعات',
          thisMonth: 'هذا الشهر',
          lastMonth: 'الشهر الماضي',
          paidOnly: 'المدفوع فقط',
          pendingOnly: 'المعلق فقط',
          overdueOnly: 'المتأخر فقط',
          withInsurance: 'مع التأمين'
        },
        
        // Status Menu
        statusMenu: {
          title: 'تغيير حالة الدفع',
          pendingDesc: 'الدفع في الانتظار',
          paidDesc: 'تم الدفع',
          overdueDesc: 'الدفع متأخر',
          partialDesc: 'دفع جزئي'
        },
        
        // Dialogs
        dialogs: {
          createNewInvoice: 'إنشاء فاتورة جديدة',
          invoicePreview: 'معاينة الفاتورة'
        },
        
        // Placeholders
        placeholders: {
          patientName: 'مثال: أحمد الراشد',
          description: 'وصف الخدمات المقدمة...'
        },
        
        // Helpers
        helpers: {
          serviceDate: 'تاريخ تقديم الخدمة',
          insuranceCoverage: 'اتركه فارغاً إذا لم يكن هناك تغطية تأمينية'
        },
        
        // Validation
        validation: {
          fillAllFields: 'يرجى ملء جميع الحقول المطلوبة',
          validAmount: 'يجب أن يكون المبلغ رقماً صالحاً أكبر من 0',
          futureDateNotAllowed: 'لا يمكن أن يكون تاريخ الفاتورة في المستقبل',
          dueDateAfterInvoice: 'يجب أن يكون تاريخ الاستحقاق بعد تاريخ الفاتورة'
        },
        
        // Success Messages
        success: {
          invoiceCreated: '✅ تم إنشاء الفاتورة {{invoiceId}} بنجاح لـ {{patient}}!',
          invoiceDownloaded: '✅ تم تحميل الفاتورة {{invoiceId}} بنجاح!',
          invoiceSentToPrinter: '✅ تم إرسال الفاتورة {{invoiceId}} للطابعة!',
          reminderSent: '✅ تم إرسال تذكير واتساب لـ {{patient}}!',
          invoiceDeleted: '🗑️ تم حذف الفاتورة {{invoiceId}} بنجاح!',
          statusChanged: '✅ تم تغيير حالة الدفع {{invoiceId}} من "{{oldStatus}}" إلى "{{newStatus}}"'
        },
        
        // Info Messages
        info: {
          alreadyPaid: 'ℹ️ الفاتورة {{invoiceId}} مدفوعة بالفعل. لا حاجة لتذكير.'
        },
        
        // Analytics
        analytics: {
          paymentMethods: 'طرق الدفع',
          transactions: '{{count}} معاملة'
        },
        
        // Insurance
        insurance: {
          none: 'لا يوجد'
        },
        
        // Reminder Messages
        reminder: {
          title: 'تذكير دفع العيادة',
          dear: 'عزيزي/عزيزتي',
          friendlyReminder: 'هذا تذكير ودود بشأن دفعتك المستحقة',
          amountDue: 'المبلغ المستحق',
          pleaseArrange: 'يرجى ترتيب الدفع في أقرب وقت ممكن.',
          questions: 'لأي استفسارات، يرجى الاتصال بعيادتنا.',
          thankYou: 'شكراً لك!'
        },
        
        // Confirmation Messages
        confirmation: {
          deleteInvoice: 'هل أنت متأكد من حذف الفاتورة {{invoiceId}}؟\n\nلا يمكن التراجع عن هذا الإجراء.'
        }
      },

      // Invoice System - نظام الفواتير
      invoice: {
        title: 'فاتورة',
        
        // Default Clinic Information
        defaultClinic: {
          name: 'العيادة الحديثة',
          address: '123 شارع الطب، مدينة الرعاية الصحية',
          phone: '+20 123 456 7890',
          email: 'info@modernclinic.com'
        },
        
        // Labels
        labels: {
          phone: 'الهاتف',
          email: 'البريد الإلكتروني',
          invoiceNumber: 'رقم الفاتورة',
          patientId: 'رقم المريض',
          issueDate: 'تاريخ الإصدار',
          dueDate: 'تاريخ الاستحقاق',
          status: 'الحالة',
          serviceDate: 'تاريخ الخدمة'
        },
        
        // Sections
        sections: {
          billTo: 'فاتورة إلى',
          invoiceDetails: 'تفاصيل الفاتورة',
          servicesAndProcedures: 'الخدمات والإجراءات'
        },
        
        // Table Headers
        table: {
          description: 'الوصف',
          category: 'الفئة',
          paymentMethod: 'طريقة الدفع',
          amount: 'المبلغ'
        },
        
        // Status
        status: {
          paid: 'مدفوع',
          pending: 'معلق',
          overdue: 'متأخر',
          partial: 'جزئي'
        },
        
        // Categories
        categories: {
          consultation: 'استشارة',
          checkup: 'فحص روتيني',
          surgery: 'جراحة',
          emergency: 'طوارئ',
          followup: 'متابعة',
          procedure: 'إجراء طبي'
        },
        
        // Payment Methods
        paymentMethods: {
          cash: 'نقداً',
          credit_card: 'بطاقة ائتمان',
          bank_transfer: 'تحويل بنكي',
          insurance: 'تأمين'
        },
        
        // Insurance
        insurance: {
          coverageApplied: '✓ تم تطبيق التغطية التأمينية',
          activeDescription: 'هذا المريض لديه تغطية تأمينية فعالة'
        },
        
        // Calculations
        calculations: {
          subtotal: 'المجموع الفرعي',
          vat: 'ضريبة القيمة المضافة',
          totalAmount: 'المبلغ الإجمالي',
          insuranceCoverage: 'التغطية التأمينية',
          patientBalance: 'رصيد المريض'
        },
        
        // Footer
        footer: {
          paymentTermsTitle: 'شروط الدفع والملاحظات',
          paymentDue30Days: 'الدفع مستحق في غضون 30 يوماً من تاريخ الفاتورة',
          latePaymentCharges: 'قد تتحمل المدفوعات المتأخرة رسوماً إضافية',
          questionsContact: 'للاستفسارات، يرجى الاتصال بنا على',
          generatedBy: 'تم إنشاؤها بواسطة',
          managementSystem: 'نظام الإدارة'
        },
        
        // Actions
        actions: {
          downloadPDF: 'تحميل PDF',
          printInvoice: 'طباعة الفاتورة',
          share: 'مشاركة'
        }
      },

      // Common terms - المصطلحات الشائعة
      common: {
        cancel: 'إلغاء',
        close: 'إغلاق',
        for: 'لـ'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      lookupLocalStorage: 'i18nextLng',
      
      caches: ['localStorage'],
      
      convertDetectedLanguage: (lng) => {
        if (lng.startsWith('ar')) return 'ar';
        return 'en';
      },
    },
    
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    console.log('i18n initialized with language:', i18n.language);
    console.log('localStorage language:', localStorage.getItem('i18nextLng'));
  });

i18n.on('languageChanged', (lng) => {
  console.log('Language changed to:', lng);
  console.log('Saved to localStorage:', localStorage.getItem('i18nextLng'));
});

export default i18n; 