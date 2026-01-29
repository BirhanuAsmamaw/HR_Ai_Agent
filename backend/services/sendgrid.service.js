require('dotenv').config();
const sgMail = require('@sendgrid/mail');


if (!process.env.SENDGRID_API_KEY) {
  console.warn('Warning: SENDGRID_API_KEY is not set in .env');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

class SendGridService {
  
  static async sendEmail(to, subject, htmlContent, textContent = null, fromEmail = null) {
    
    const from = fromEmail || process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
    
    try {
      if (!from) {
        throw new Error('Sender email is required. Set SENDGRID_FROM_EMAIL or EMAIL_USER in .env');
      }

      if (!to) {
        throw new Error('Recipient email is required');
      }

      if (!subject) {
        throw new Error('Email subject is required');
      }

      if (!htmlContent) {
        throw new Error('Email content is required');
      }

      const msg = {
        to: to,
        from: from,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      console.log(`Sending email via SendGrid to: ${to}`);
      console.log(`From: ${from}`);
      console.log(`Subject: ${subject}`);
      
      const response = await sgMail.send(msg);
      
      console.log(`Email sent successfully to ${to}`);
      console.log(`SendGrid response status: ${response[0].statusCode}`);
      
      return {
        success: true,
        statusCode: response[0].statusCode,
        messageId: response[0].headers['x-message-id'],
        to: to,
        from: from,
        subject: subject
      };
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
      
     
      if (error.response) {
        const { statusCode, body } = error.response;
        
        
        if (body && body.errors && Array.isArray(body.errors)) {
          const errorMessages = body.errors.map(err => err.message).join('; ');
          
          
          if (errorMessages.includes('verified Sender Identity') || errorMessages.includes('sender identity')) {
            throw new Error(
              `SendGrid Sender Identity Error: The "from" email address (${from || 'not set'}) is not verified in your SendGrid account. ` +
              `Please verify this email address in SendGrid: https://app.sendgrid.com/settings/sender_auth/senders ` +
              `or use a verified sender email address. Set SENDGRID_FROM_EMAIL in your .env file to a verified email.`
            );
          }
          
          throw new Error(`SendGrid API error (${statusCode}): ${errorMessages}`);
        }
        
        throw new Error(`SendGrid API error (${statusCode}): ${JSON.stringify(body)}`);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to send email via SendGrid');
      }
    }
  }

  
  static async sendApplicantEmail(applicant) {
    try {
      if (!applicant.email) {
        throw new Error('Applicant email is required');
      }

      if (!applicant.ai_generated_email) {
        throw new Error('AI-generated email not found. Please process the applicant with AI first.');
      }

      
      let subject = 'Application Update';
      if (applicant.ai_verdict === 'shortlist') {
        subject = `Application Update - ${applicant.name}`;
      } else if (applicant.ai_verdict === 'reject') {
        subject = `Thank You for Your Application - ${applicant.name}`;
      }

      
      const htmlContent = applicant.ai_generated_email
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');

      const result = await this.sendEmail(
        applicant.email,
        subject,
        htmlContent,
        applicant.ai_generated_email 
      );

      return result;
    } catch (error) {
      console.error('Error in sendApplicantEmail:', error);
      throw error;
    }
  }

  
  static async sendInterviewEmail(interview, applicant, location = null) {
    try {
      if (!applicant || !applicant.email) {
        throw new Error('Applicant email is required');
      }

      if (!interview || !interview.scheduled_at) {
        throw new Error('Interview scheduled_at is required');
      }

      
      const scheduledDate = new Date(interview.scheduled_at);
      const formattedDate = scheduledDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      
      const interviewLocation = location || process.env.INTERVIEW_LOCATION || 'Our office';

      
      const subject = `Interview Invitation - ${applicant.name}`;

      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Interview Invitation</h2>
          
          <p>Dear ${applicant.name},</p>
          
          <p>Thank you for your interest in our position. We are pleased to invite you for an interview.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Interview Details</h3>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${formattedTime}</p>
            <p style="margin: 10px 0;"><strong>Location:</strong> ${interviewLocation}</p>
          </div>
          
          <p>Please confirm your attendance at your earliest convenience. If you need to reschedule, please contact us as soon as possible.</p>
          
          <p>We look forward to meeting you!</p>
          
          <p>Best regards,<br>HR Team</p>
        </div>
      `;

      
      const textContent = `
Interview Invitation

Dear ${applicant.name},

Thank you for your interest in our position. We are pleased to invite you for an interview.

Interview Details:
Date: ${formattedDate}
Time: ${formattedTime}
Location: ${interviewLocation}

Please confirm your attendance at your earliest convenience. If you need to reschedule, please contact us as soon as possible.

We look forward to meeting you!

Best regards,
HR Team
      `.trim();

      const result = await this.sendEmail(
        applicant.email,
        subject,
        htmlContent,
        textContent
      );

      return result;
    } catch (error) {
      console.error('Error in sendInterviewEmail:', error);
      throw error;
    }
  }
}

module.exports = SendGridService;

