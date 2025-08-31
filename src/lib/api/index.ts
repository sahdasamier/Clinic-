/**
 * API Module Exports
 * Centralized exports for all API modules
 */

// Core API modules
export * from './auth';
export * from './patients';
export * from './appointments';
export * from './payments';
export * from './clinics';
export * from './notifications';
export * from './messaging';
export * from './storage';
export * from './analytics';
export * from './scheduling';
export * from './inventory';
export * from './adminAuth';
export * from './doctorPatients';

// Legacy Firebase modules (to be migrated)
export * from './firebase-legacy';
export * from './firebase-optimized-legacy';
export * from './firebase-direct-legacy';
export * from './firebase-safe-legacy';