// Mock EmailJS service - @emailjs/browser removed during cleanup
// This service provides fallback functionality without external dependencies

// EmailJS Configuration - Preserved for reference
const EMAILJS_CONFIG = {
  serviceId: 'service_n85wg6i',        // Gmail service ID  
  templateId: 'template_cjjw42i',      // Contact Us template ID
  publicKey: '4r1MGc7ZnbGx-x2gL'      // Public key
};

// Mock email service implementation
// This replaces the removed @emailjs/browser dependency

interface EmailJSResponse {
  status: number;
  text: string;
}

interface EmailParams {
  [key: string]: any;
}

// Mock emailjs object to replace the removed dependency
const emailjs = {
  send: async (
    serviceID: string,
    templateID: string,
    templateParams: EmailParams,
    publicKey?: string
  ): Promise<EmailJSResponse> => {
    console.log('📧 Mock Email Service - Email would be sent:');
    console.log('Service ID:', serviceID);
    console.log('Template ID:', templateID);
    console.log('Template Params:', templateParams);
    console.log('Public Key:', publicKey);
    
    // Simulate successful response
    return {
      status: 200,
      text: 'Mock email sent successfully'
    };
  },

  sendForm: async (
    serviceID: string,
    templateID: string,
    form: HTMLFormElement,
    publicKey?: string
  ): Promise<EmailJSResponse> => {
    console.log('📧 Mock Email Service - Form would be sent:');
    console.log('Service ID:', serviceID);
    console.log('Template ID:', templateID);
    console.log('Form:', form);
    console.log('Public Key:', publicKey);
    
    // Simulate successful response
    return {
      status: 200,
      text: 'Mock form email sent successfully'
    };
  }
};

export default emailjs;
export { EmailJSResponse, EmailParams };

// Support email data interface
export interface SupportEmailData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  supportType: string;
  ticketId: string;
  submittedAt: string;
  browserInfo: string;
}

// Feedback email data interface
export interface FeedbackEmailData {
  name: string;
  email: string;
  feedback: string;
  rating: string;
}

// Initialize Mock EmailJS
export const initializeEmailJS = (): void => {
  try {
    if (EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'your_public_key') {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      console.log('✅ Mock EmailJS initialized successfully (using fallback implementation)');
    } else {
      console.warn('⚠️ EmailJS not configured. Using mock implementation.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize mock EmailJS:', error);
  }
};

// Check if EmailJS is properly configured (mock always returns false to show fallback)
const isEmailJSConfigured = (): boolean => {
  // Always return false in mock mode to ensure fallback behavior is shown
  return false;
};

// Send support email (mock implementation)
export const sendSupportEmail = async (emailData: SupportEmailData): Promise<boolean> => {
  if (!isEmailJSConfigured()) {
    console.warn('📧 Mock EmailJS: Email service not configured, showing fallback instructions.');
    return false;
  }

  try {
    const templateParams = {
      to_email: 'drsuperclinic@gmail.com',
      from_name: emailData.fullName,
      from_email: emailData.email,
      subject: `ClinicCare Support: [${emailData.supportType.toUpperCase()}] ${emailData.subject}`,
      message: emailData.message,
      support_type: emailData.supportType,
      ticket_id: emailData.ticketId,
      submitted_at: emailData.submittedAt,
      browser_info: emailData.browserInfo,
      reply_to: emailData.email
    };

    // Mock email sending
    console.log('📧 Mock support email would be sent:', templateParams);
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Mock support email sent successfully:', response);
      return true;
    } else {
      console.error('❌ Mock support email failed:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in mock support email:', error);
    return false;
  }
};

// Send feedback email (mock implementation)
export const sendFeedbackEmail = async (feedbackData: FeedbackEmailData): Promise<boolean> => {
  if (!isEmailJSConfigured()) {
    console.warn('📧 Mock EmailJS: Feedback service not configured, showing fallback instructions.');
    return false;
  }

  try {
    const templateParams = {
      to_email: 'drsuperclinic@gmail.com',
      from_name: feedbackData.name,
      from_email: feedbackData.email,
      subject: 'ClinicCare Feedback Submission',
      message: feedbackData.feedback,
      rating: feedbackData.rating,
      submitted_at: new Date().toLocaleString(),
      reply_to: feedbackData.email
    };

    // Mock email sending
    console.log('📧 Mock feedback email would be sent:', templateParams);
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Mock feedback email sent successfully:', response);
      return true;
    } else {
      console.error('❌ Mock feedback email failed:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in mock feedback email:', error);
    return false;
  }
};

// Get setup instructions for EmailJS
export const getSetupInstructions = (): string => {
  return `
📧 EmailJS Setup Instructions:

⚠️  NOTICE: @emailjs/browser dependency was removed during codebase cleanup.
    The email service is currently using a mock implementation.

🔧 To restore email functionality:

1. Install EmailJS dependency:
   npm install @emailjs/browser

2. Restore the original import in emailService.ts:
   import emailjs from '@emailjs/browser';

3. Go to https://www.emailjs.com/
4. Create a free account
5. Create an email service (Gmail, Outlook, etc.)
6. Create an email template with these variables:
   - {{to_email}}
   - {{from_name}}
   - {{from_email}}
   - {{subject}}
   - {{message}}
   - {{reply_to}}

7. Get your credentials:
   - Service ID
   - Template ID  
   - Public Key

8. Update EMAILJS_CONFIG in emailService.ts with your actual credentials

9. Restart your application

💡 Free tier includes 200 emails/month
🔒 Emails will be sent securely via EmailJS

📧 Current fallback: Manual email copy-to-clipboard functionality
`;
};

// Generate fallback email message that can be copied to clipboard
export const generateFallbackEmailMessage = (emailData: SupportEmailData): string => {
  return `TO: drsuperclinic@gmail.com
SUBJECT: ClinicCare Support: [${emailData.supportType.toUpperCase()}] ${emailData.subject}

Support Ticket: ${emailData.ticketId}
Submitted: ${emailData.submittedAt}

From: ${emailData.fullName}
Email: ${emailData.email}
Support Type: ${emailData.supportType}

Message:
${emailData.message}

---
Browser: ${emailData.browserInfo}
Sent via ClinicCare Contact Form

📱 WhatsApp Alternative: +201147299675`;
};

// Copy text to clipboard utility
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};