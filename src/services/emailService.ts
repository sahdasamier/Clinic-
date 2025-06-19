import emailjs from '@emailjs/browser';

// EmailJS Configuration - Fixed with correct values
const EMAILJS_CONFIG = {
  serviceId: 'service_n85wg6i',        // ✅ Gmail service ID  
  templateId: 'template_cjjw42i',      // ✅ Contact Us template ID (was wrong before)
  publicKey: '4r1MGc7ZnbGx-x2gL'      // ✅ Your actual public key
};

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

// Initialize EmailJS
export const initializeEmailJS = (): void => {
  try {
    if (EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'your_public_key') {
      emailjs.init(EMAILJS_CONFIG.publicKey);
      console.log('✅ EmailJS initialized successfully');
    } else {
      console.warn('⚠️ EmailJS not configured. Please update EMAILJS_CONFIG with your credentials.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize EmailJS:', error);
  }
};

// Check if EmailJS is properly configured
const isEmailJSConfigured = (): boolean => {
  return EMAILJS_CONFIG.serviceId !== 'your_service_id' && 
         EMAILJS_CONFIG.templateId !== 'your_template_id' && 
         EMAILJS_CONFIG.publicKey !== 'your_public_key';
};

// Send support email
export const sendSupportEmail = async (emailData: SupportEmailData): Promise<boolean> => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS not configured. Please update EMAILJS_CONFIG with your credentials.');
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

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Support email sent successfully:', response);
      return true;
    } else {
      console.error('❌ Failed to send support email:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending support email:', error);
    return false;
  }
};

// Send feedback email
export const sendFeedbackEmail = async (feedbackData: FeedbackEmailData): Promise<boolean> => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS not configured. Please update EMAILJS_CONFIG with your credentials.');
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

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Feedback email sent successfully:', response);
      return true;
    } else {
      console.error('❌ Failed to send feedback email:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending feedback email:', error);
    return false;
  }
};

// Get setup instructions for EmailJS
export const getSetupInstructions = (): string => {
  return `
📧 EmailJS Setup Instructions:

1. Go to https://www.emailjs.com/
2. Create a free account
3. Create an email service (Gmail, Outlook, etc.)
4. Create an email template with these variables:
   - {{to_email}}
   - {{from_name}}
   - {{from_email}}
   - {{subject}}
   - {{message}}
   - {{reply_to}}

5. Get your credentials:
   - Service ID
   - Template ID  
   - Public Key

6. Update EMAILJS_CONFIG in emailService.ts:
   const EMAILJS_CONFIG = {
     serviceId: 'your_service_id',
     templateId: 'your_template_id', 
     publicKey: 'your_public_key'
   };

7. Restart your application

💡 Free tier includes 200 emails/month
🔒 Emails will be sent securely via EmailJS
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