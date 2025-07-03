import i18n from '../i18n';

/**
 * Safely get the text direction for the current language
 * Returns 'rtl' for Arabic, 'ltr' for all other languages
 */
export const getTextDirection = (): 'rtl' | 'ltr' => {
  try {
    // Check if i18n.dir method exists
    if (typeof i18n.dir === 'function') {
      return i18n.dir();
    }
    
    // Fallback: manually determine direction based on language
    const currentLanguage = i18n.language || 'en';
    
    // Arabic and Hebrew are RTL languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    
    return rtlLanguages.some(lang => currentLanguage.startsWith(lang)) ? 'rtl' : 'ltr';
  } catch (error) {
    console.warn('⚠️ Error getting text direction, defaulting to ltr:', error);
    return 'ltr';
  }
};

/**
 * Safely update the document direction and language
 */
export const updateDocumentDirection = (): void => {
  try {
    const direction = getTextDirection();
    const language = i18n.language || 'en';
    
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    console.log(`📝 Document direction updated: ${direction}, language: ${language}`);
  } catch (error) {
    console.warn('⚠️ Error updating document direction:', error);
  }
};

/**
 * Check if current language is RTL
 */
export const isRTL = (): boolean => {
  return getTextDirection() === 'rtl';
};

/**
 * Safe i18n initialization check
 */
export const isI18nInitialized = (): boolean => {
  try {
    return i18n.isInitialized;
  } catch (error) {
    console.warn('⚠️ Error checking i18n initialization:', error);
    return false;
  }
}; 