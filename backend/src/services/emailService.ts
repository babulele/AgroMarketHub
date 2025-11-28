import nodemailer from 'nodemailer';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private emailFrom: string;
  private adminEmails: string[];

  constructor() {
    const emailService = process.env.EMAIL_SERVICE;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    this.emailFrom = process.env.EMAIL_FROM || 'noreply@agromarkethub.com';
    
    // Parse admin emails (comma-separated)
    const adminEmailsStr = process.env.ADMIN_EMAILS || '';
    this.adminEmails = adminEmailsStr
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailService && emailUser && emailPass) {
      // Determine SMTP port based on service
      const port = this.getSmtpPort(emailService);
      const secure = port === 465;

      this.transporter = nodemailer.createTransport({
        host: emailService,
        port: port,
        secure: secure, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false,
        },
      });

      logger.info(`Email service configured: ${emailService}`);
    } else {
      // Fallback to console logging in development
      logger.warn('Email service not configured. Email service will log to console.');
    }
  }

  private getSmtpPort(service: string): number {
    // Use EMAIL_PORT if explicitly set
    if (process.env.EMAIL_PORT) {
      return parseInt(process.env.EMAIL_PORT, 10);
    }

    // Common SMTP ports
    if (service.includes('gmail.com')) {
      return 587; // Gmail SMTP
    } else if (service.includes('outlook.com') || service.includes('hotmail.com')) {
      return 587; // Outlook SMTP
    } else if (service.includes('yahoo.com')) {
      return 587; // Yahoo SMTP
    } else {
      // Default to 587 (STARTTLS)
      return 587;
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      if (!this.transporter) {
        // Development mode - just log
        logger.info('Email (dev mode):', {
          to: options.to,
          subject: options.subject,
          text: options.text || options.html,
        });
        return;
      }

      await this.transporter.sendMail({
        from: this.emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      logger.info(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error: any) {
      logger.error('Email send error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOrderConfirmation(email: string, orderData: any): Promise<void> {
    const html = `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> ${orderData.id}</p>
      <p><strong>Total Amount:</strong> KES ${orderData.totalAmount}</p>
      <p><strong>Items:</strong></p>
      <ul>
        ${orderData.items.map((item: any) => `<li>${item.name} - ${item.quantity} ${item.unit}</li>`).join('')}
      </ul>
      <p>We'll send you updates as your order is processed.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Order Confirmation - AgroMarketHub',
      html,
    });
  }

  async sendDeliveryUpdate(email: string, orderId: string, status: string): Promise<void> {
    const statusMessages: Record<string, string> = {
      assigned: 'A rider has been assigned to your order',
      picking: 'Your order is being picked up from the farm',
      in_transit: 'Your order is on the way',
      delivered: 'Your order has been delivered!',
    };

    const html = `
      <h2>Delivery Update</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p>${statusMessages[status] || 'Your order status has been updated'}</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Delivery Update - Order ${orderId}`,
      html,
    });
  }

  async sendSubscriptionReminder(email: string, subscriptionData: any): Promise<void> {
    const html = `
      <h2>Subscription Reminder</h2>
      <p>Your subscription will expire on ${new Date(subscriptionData.endDate).toLocaleDateString()}</p>
      <p>Please renew to continue enjoying our services.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Subscription Renewal Reminder - AgroMarketHub',
      html,
    });
  }

  async sendAIDemandAlert(email: string, forecastData: any): Promise<void> {
    const html = `
      <h2>High Demand Alert</h2>
      <p>We've detected high demand for the following crops:</p>
      <ul>
        ${forecastData.crops.map((crop: any) => `<li>${crop.name} - ${crop.demand}% increase</li>`).join('')}
      </ul>
      <p>Consider listing these products to maximize your sales!</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'High Demand Alert - AgroMarketHub',
      html,
    });
  }

  async sendToAdmins(subject: string, html: string): Promise<void> {
    if (this.adminEmails.length === 0) {
      logger.warn('No admin emails configured. Skipping admin notification.');
      return;
    }

    for (const adminEmail of this.adminEmails) {
      try {
        await this.sendEmail({
          to: adminEmail,
          subject: `[Admin] ${subject}`,
          html,
        });
      } catch (error: any) {
        logger.error(`Failed to send email to admin ${adminEmail}:`, error);
      }
    }
  }

  async sendFarmerVerificationNotification(email: string, status: 'approved' | 'rejected', reason?: string): Promise<void> {
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    const html = `
      <h2>Account Verification ${status === 'approved' ? 'Approved' : 'Rejected'}</h2>
      <p>Your farmer account verification has been <strong>${statusText}</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      ${status === 'approved' 
        ? '<p>You can now start listing your products and accessing all farmer features.</p>'
        : '<p>Please contact support if you have any questions.</p>'
      }
    `;

    await this.sendEmail({
      to: email,
      subject: `Account Verification ${status === 'approved' ? 'Approved' : 'Rejected'} - AgroMarketHub`,
      html,
    });
  }
}

export default new EmailService();
