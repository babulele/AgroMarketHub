import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole, OrderStatus } from '../models';
import mpesaService from '../services/mpesaService';
import { Order } from '../models';
import emailService from '../services/emailService';
import logger from '../utils/logger';
import {
  requestPayout,
  getPayouts,
  handlePayoutResult,
  handlePayoutTimeout,
} from '../controllers/payoutController';

type MpesaPaymentRequestBody = {
  phoneNumber: string;
  amount: number;
  orderId: string;
};

type MpesaCallbackItem = {
  Name: string;
  Value?: string | number;
};

type MpesaCallbackRequestBody = {
  Body?: {
    stkCallback?: {
      ResultCode?: number;
      CallbackMetadata?: {
        Item?: MpesaCallbackItem[];
      };
    };
  };
};

type MpesaErrorResponse = Error & {
  response?: {
    data?: {
      errorMessage?: string;
      error?: string;
      ResponseDescription?: string;
    };
    status?: number;
  };
};

const router = Router();

// Initiate payment
router.post('/payment', authenticate, authorize(UserRole.BUYER), async (
  req: Request<unknown, unknown, MpesaPaymentRequestBody>,
  res: Response
) => {
  try {
    const { phoneNumber, amount, orderId } = req.body;

    // Validate required fields
    if (!phoneNumber) {
      res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
      return;
    }

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
      return;
    }

    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Check if M-Pesa is configured
    const isConfigured = 
      process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY;

    if (!isConfigured) {
      // In development, return a mock response
      if (process.env.NODE_ENV === 'development') {
        logger.warn('M-Pesa not configured. Returning mock payment response.');
        res.json({
          success: true,
          message: 'Payment initiated (MOCK - M-Pesa not configured)',
          data: {
            ResponseCode: '0',
            ResponseDescription: 'Success. Request accepted for processing',
            MerchantRequestID: `MOCK-${Date.now()}`,
            CheckoutRequestID: `MOCK-CHECKOUT-${Date.now()}`,
            CustomerMessage: 'M-Pesa credentials not configured. This is a mock response.',
          },
        });
        return;
      } else {
        res.status(500).json({
          success: false,
          message: 'M-Pesa payment service is not configured',
        });
        return;
      }
    }

    const result = await mpesaService.initiateSTKPush(
      phoneNumber,
      amount,
      `ORDER-${orderId}`
    );

    res.json({
      success: true,
      message: 'Payment initiated',
      data: result,
    });
  } catch (error: unknown) {
    const err = error as MpesaErrorResponse;
    logger.error('M-Pesa payment error:', {
      message: err.message,
      stack: err.stack,
      response: err.response?.data,
      status: err.response?.status,
    });
    
    // Return user-friendly error message with more context
    const errorMessage = err.message || 
                        err.response?.data?.errorMessage || 
                        err.response?.data?.error || 
                        err.response?.data?.ResponseDescription ||
                        'Failed to initiate M-Pesa payment';
    
    // Determine appropriate status code
    let statusCode = 500;
    if (err.response?.status) {
      statusCode = err.response.status;
    } else if (err.message?.includes('authentication failed')) {
      statusCode = 401;
    } else if (err.message?.includes('Invalid') || err.message?.includes('required')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        details: {
          originalError: err.message,
          response: err.response?.data,
          stack: err.stack,
        }
      }),
    });
  }
});

// M-Pesa webhook callback
router.post('/callback', async (
  req: Request<unknown, unknown, MpesaCallbackRequestBody>,
  res: Response
) => {
  try {
    const callbackData = req.body;
    const metadata = callbackData.Body?.stkCallback?.CallbackMetadata;

    const findMetadataValue = (name: string): string | number | undefined =>
      metadata?.Item?.find((item: MpesaCallbackItem) => item.Name === name)?.Value;

    // Verify webhook signature
    // const signature = req.headers['x-mpesa-signature'];
    // if (!mpesaService.verifyWebhook(callbackData, signature)) {
    //   return res.status(401).json({ message: 'Invalid signature' });
    // }

    // Process callback
    if (callbackData.Body?.stkCallback?.ResultCode === 0) {
      const receiptValue = findMetadataValue('MpesaReceiptNumber');
      const transactionId = typeof receiptValue === 'string' ? receiptValue : undefined;

      // Update order payment status
      // Extract order ID from AccountReference
      const accountReferenceValue = findMetadataValue('AccountReference');
      const orderId =
        typeof accountReferenceValue === 'string'
          ? accountReferenceValue.replace('ORDER-', '')
          : undefined;

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.payment.status = 'completed';
          order.payment.mpesaTransactionId = transactionId;
          order.payment.paidAt = new Date();
          order.status = OrderStatus.CONFIRMED;
          await order.save();

          // Send confirmation email
          const buyer = await order.buyer;
          if (buyer && 'email' in buyer) {
            await emailService.sendOrderConfirmation(buyer.email as string, {
              id: order._id,
              totalAmount: order.totalAmount,
              items: order.items,
            });
          }
        }
      }
    }

    res.json({ message: 'Callback received' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing callback' });
  }
});

// Farmer payout endpoints
router.post('/payouts', authenticate, authorize(UserRole.FARMER), requestPayout);
router.get('/payouts', authenticate, authorize(UserRole.FARMER), getPayouts);

// M-Pesa B2C callback endpoints
router.post('/payouts/result', handlePayoutResult);
router.post('/payouts/timeout', handlePayoutTimeout);

export default router;

