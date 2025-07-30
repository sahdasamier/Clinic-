import bcrypt from 'bcryptjs';

/**
 * Secure password utilities for the clinic management system
 * Uses bcryptjs for hashing and verification
 */

// Salt rounds for bcrypt (10-12 is recommended for production)
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password securely
 * @param plainTextPassword - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  if (!plainTextPassword || plainTextPassword.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }
  
  if (plainTextPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  try {
    const hash = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a plain text password against a hashed password
 * @param plainTextPassword - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise<boolean> - True if passwords match, false otherwise
 */
export async function verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
  if (!plainTextPassword || !hashedPassword) {
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Generate a secure random password
 * @param length - Length of the password (minimum 8, default 12)
 * @returns string - A randomly generated password
 */
export function generateSecurePassword(length: number = 12): string {
  if (length < 8) {
    length = 8;
  }
  
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required set
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Validate password strength
 * @param password - The password to validate
 * @returns object with validation results
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, strength: 'weak' };
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length < 8) {
    errors.push('Password should be at least 8 characters for better security');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password should contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password should contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password should contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password should contain at least one special character');
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0 && password.length >= 12) {
    strength = 'strong';
  } else if (errors.length <= 2 && password.length >= 8) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0 || (errors.length === 1 && errors[0].includes('should')),
    errors,
    strength
  };
} 