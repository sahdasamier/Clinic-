// Super Admin Configuration
export const SUPER_ADMIN_EMAILS = [
  'admin@sahdasclinic.com',
  'sahdasamier013@gmail.com'
];

// Check if user is super admin
export const isSuperAdmin = (email: string): boolean => {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
};

// Admin routes configuration
export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard'
}; 