import { Timestamp } from 'firebase/firestore';

// Convert Firebase Timestamp to JavaScript Date
export const timestampToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date();
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firebase Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's a timestamp number
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // If it's a string date
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  // Fallback to current date
  return new Date();
};

// Format date for display in tables
export const formatDateForTable = (timestamp: any): string => {
  try {
    const date = timestampToDate(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format date with time for detailed view
export const formatDateTime = (timestamp: any): string => {
  try {
    const date = timestampToDate(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (timestamp: any): string => {
  try {
    const date = timestampToDate(timestamp);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// Get relative time (e.g., "2 days ago", "1 hour ago")
export const getRelativeTime = (timestamp: any): string => {
  try {
    const date = timestampToDate(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    return 'Unknown';
  }
};

// Validate date input
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}; 