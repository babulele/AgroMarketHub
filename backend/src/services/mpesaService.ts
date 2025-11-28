import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger';

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  environment: 'sandbox' | 'production';
  callbackUrl: string;
  initiatorName?: string;
  initiatorSecurityCredential?: string;
  payoutResultUrl?: string;
  payoutTimeoutUrl?: string;
  b2cShortcode?: string;
}

class MpesaService {
  private config: MpesaConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  // Lazy-load configuration to ensure env vars are loaded
  private getConfig(): MpesaConfig {
    if (!this.config) {
      // Re-read environment variables at runtime (not at module load time)
      const consumerKey = (process.env.MPESA_CONSUMER_KEY || '').trim();
      const consumerSecret = (process.env.MPESA_CONSUMER_SECRET || '').trim();
      const shortcode = (process.env.MPESA_SHORTCODE || '').trim();
      const passkey = (process.env.MPESA_PASSKEY || '').trim();
      const callbackUrl = (process.env.MPESA_CALLBACK_URL || '').trim();
      const initiatorName = (process.env.MPESA_INITIATOR_NAME || '').trim();
      const initiatorSecurityCredential = (process.env.MPESA_INITIATOR_SECURITY_CREDENTIAL || '').trim();
      const payoutResultUrl = (process.env.MPESA_PAYOUT_RESULT_URL || '').trim();
      const payoutTimeoutUrl = (process.env.MPESA_PAYOUT_TIMEOUT_URL || '').trim();
      const b2cShortcode = (process.env.MPESA_B2C_SHORTCODE || shortcode || '').trim();

      this.config = {
        consumerKey,
        consumerSecret,
        shortcode,
        passkey,
        environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
        callbackUrl,
        initiatorName,
        initiatorSecurityCredential,
        payoutResultUrl,
        payoutTimeoutUrl,
        b2cShortcode,
      };

      // Log configuration status (without sensitive data)
      if (consumerKey && consumerSecret) {
        logger.info('M-Pesa service configured', {
          hasConsumerKey: !!consumerKey,
          hasConsumerSecret: !!consumerSecret,
          hasShortcode: !!shortcode,
          hasPasskey: !!passkey,
          hasCallbackUrl: !!callbackUrl,
          hasB2CConfig: !!(initiatorName && initiatorSecurityCredential),
          environment: this.config.environment,
        });
      } else {
        logger.warn('M-Pesa service not fully configured', {
          hasConsumerKey: !!consumerKey,
          hasConsumerSecret: !!consumerSecret,
          hasShortcode: !!shortcode,
          hasPasskey: !!passkey,
          hasCallbackUrl: !!callbackUrl,
          envKeys: Object.keys(process.env).filter(k => k.startsWith('MPESA_')),
        });
      }
    }
    return this.config;
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const config = this.getConfig(); // Ensure config is loaded

    try {
      const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString(
        'base64'
      );

      const baseUrl = config.environment === 'sandbox'
        ? 'https://sandbox.safaricom.co.ke'
        : 'https://api.safaricom.co.ke';

      const response = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      this.accessToken = response.data.access_token;
      // Set expiry to 55 minutes (tokens expire in 1 hour)
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

      if (!this.accessToken) {
        throw new Error('Failed to get M-Pesa access token: No token in response');
      }

      return this.accessToken;
    } catch (error: any) {
      logger.error('M-Pesa token error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      // Provide more specific error message
      if (error.response?.status === 401) {
        throw new Error('M-Pesa authentication failed: Invalid consumer key or secret');
      } else if (error.response?.data) {
        throw new Error(`M-Pesa token error: ${error.response.data.error || error.response.data.errorMessage || error.message}`);
      }
      
      throw new Error(`Failed to get M-Pesa access token: ${error.message}`);
    }
  }

  private generatePassword(timestamp: string): string {
    const config = this.getConfig(); // Ensure config is loaded
    const data = `${config.shortcode}${config.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  private formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    let formattedPhone = phoneNumber.trim().replace(/^\+/, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    if (!/^254\d{9}$/.test(formattedPhone)) {
      throw new Error('Invalid phone number format. Use format: 254712345678');
    }

    return formattedPhone;
  }

  isB2CConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(
      config.initiatorName &&
      config.initiatorSecurityCredential &&
      (config.payoutResultUrl || config.callbackUrl) &&
      (config.payoutTimeoutUrl || config.callbackUrl)
    );
  }

  async initiateSTKPush(phoneNumber: string, amount: number, accountReference: string): Promise<any> {
    try {
      const config = this.getConfig(); // Ensure config is loaded at runtime
      
      // Validate configuration
      if (!config.consumerKey || !config.consumerSecret) {
        throw new Error('M-Pesa consumer key and secret are required');
      }

      if (!config.shortcode || !config.passkey) {
        throw new Error('M-Pesa shortcode and passkey are required');
      }

      if (!config.callbackUrl) {
        throw new Error('M-Pesa callback URL is required');
      }

      // Validate inputs
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        throw new Error('Valid phone number is required');
      }

      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Valid amount is required');
      }

      if (!accountReference || typeof accountReference !== 'string') {
        throw new Error('Account reference is required');
      }

      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = this.generatePassword(timestamp);

      // Format phone number (remove + and ensure it starts with 254)
      let formattedPhone = phoneNumber.trim().replace(/^\+/, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      // Validate formatted phone number
      if (!/^254\d{9}$/.test(formattedPhone)) {
        throw new Error('Invalid phone number format. Use format: 254712345678');
      }

      // Ensure shortcode is numeric (M-Pesa API expects number or numeric string)
      const businessShortCode = parseInt(config.shortcode, 10);
      if (isNaN(businessShortCode)) {
        throw new Error(`Invalid shortcode format: ${config.shortcode}. Must be numeric.`);
      }

      const payload = {
        BusinessShortCode: businessShortCode.toString(), // M-Pesa accepts as string
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa requires whole numbers
        PartyA: formattedPhone,
        PartyB: businessShortCode.toString(),
        PhoneNumber: formattedPhone,
        CallBackURL: config.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: 'AgroMarketHub Payment',
      };

      logger.info('Initiating M-Pesa STK Push:', {
        phoneNumber: formattedPhone,
        amount: payload.Amount,
        accountReference,
        shortcode: config.shortcode,
        callbackUrl: config.callbackUrl,
      });

      const baseUrl = config.environment === 'sandbox'
        ? 'https://sandbox.safaricom.co.ke'
        : 'https://api.safaricom.co.ke';

      const response = await axios.post(
        `${baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      logger.info('M-Pesa STK Push response:', response.data);
      
      // Check if M-Pesa returned an error in the response
      if (response.data.ResponseCode && response.data.ResponseCode !== '0') {
        throw new Error(response.data.ResponseDescription || 'M-Pesa payment request failed');
      }
      
      return response.data;
    } catch (error: any) {
      logger.error('M-Pesa STK Push error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: error.config?.url,
        code: error.code,
      });
      
      // Provide more specific error messages
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Unable to connect to M-Pesa API. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('M-Pesa authentication failed. Please check your credentials.');
      } else if (error.response?.status === 400) {
        const mpesaError = error.response.data;
        throw new Error(mpesaError.errorMessage || mpesaError.error || 'Invalid request to M-Pesa API');
      } else if (error.response?.data) {
        const mpesaError = error.response.data;
        throw new Error(mpesaError.errorMessage || mpesaError.error || mpesaError.ResponseDescription || 'Failed to initiate M-Pesa payment');
      }
      
      throw new Error(`M-Pesa payment error: ${error.message}`);
    }
  }

  async initiateB2CPayout(phoneNumber: string, amount: number, remarks: string, occasion?: string): Promise<any> {
    const config = this.getConfig();

    if (!this.isB2CConfigured()) {
      throw new Error('M-Pesa payout service is not fully configured');
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Valid payout amount is required');
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const accessToken = await this.getAccessToken();

    const baseUrl = config.environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';

    const payload = {
      InitiatorName: config.initiatorName,
      SecurityCredential: config.initiatorSecurityCredential,
      CommandID: 'BusinessPayment',
      Amount: Math.round(amount),
      PartyA: config.b2cShortcode || config.shortcode,
      PartyB: formattedPhone,
      Remarks: remarks || 'Farmer Payout',
      QueueTimeOutURL: config.payoutTimeoutUrl || `${config.callbackUrl}/payouts/timeout`,
      ResultURL: config.payoutResultUrl || `${config.callbackUrl}/payouts/result`,
      Occasion: occasion || 'Farmer Payout',
    };

    try {
      logger.info('Initiating M-Pesa B2C payout:', {
        amount: payload.Amount,
        phoneNumber: formattedPhone,
        shortcode: payload.PartyA,
      });

      const response = await axios.post(`${baseUrl}/mpesa/b2c/v1/paymentrequest`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      logger.info('M-Pesa B2C response:', response.data);

      if (response.data.ResponseCode && response.data.ResponseCode !== '0') {
        throw new Error(response.data.ResponseDescription || 'M-Pesa payout request failed');
      }

      return response.data;
    } catch (error: any) {
      logger.error('M-Pesa B2C error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });

      if (error.response?.status === 401) {
        throw new Error('M-Pesa authentication failed. Please check your credentials.');
      }

      throw new Error(
        error.response?.data?.errorMessage ||
          error.response?.data?.error ||
          error.response?.data?.ResponseDescription ||
          'Failed to initiate M-Pesa payout'
      );
    }
  }

  verifyWebhook(data: any, signature: string): boolean {
    // Implement webhook signature verification
    // This is a simplified version - actual implementation should verify against M-Pesa signature
    return true;
  }
}

export default new MpesaService();

