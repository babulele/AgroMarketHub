import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Payout, PayoutStatus, User } from '../models';
import mpesaService from '../services/mpesaService';
import logger from '../utils/logger';

export const requestPayout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, phoneNumber, remarks } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid withdrawal amount',
      });
      return;
    }

    const farmer = await User.findById(req.user!.id).select('phone firstName lastName');
    if (!farmer) {
      res.status(404).json({
        success: false,
        message: 'Farmer profile not found',
      });
      return;
    }

    const payoutPhone = (phoneNumber || farmer.phone || '').trim();
    if (!payoutPhone) {
      res.status(400).json({
        success: false,
        message: 'A phone number is required for payouts',
      });
      return;
    }

    const payout = await Payout.create({
      farmer: req.user!.id,
      amount: Math.round(Number(amount)),
      phoneNumber: payoutPhone,
      remarks: remarks?.slice(0, 200) || 'Farmer payout',
      status: PayoutStatus.REQUESTED,
    });

    if (!mpesaService.isB2CConfigured()) {
      if (process.env.NODE_ENV === 'development') {
        payout.status = PayoutStatus.COMPLETED;
        payout.mpesaTransactionId = `MOCK-${Date.now()}`;
        payout.mpesaResponseDescription = 'Mock payout processed (B2C not configured)';
        await payout.save();

        res.json({
          success: true,
          message: 'Payout processed in mock mode (M-Pesa B2C not configured)',
          data: payout,
        });
        return;
      }

      payout.status = PayoutStatus.FAILED;
      payout.failureReason = 'M-Pesa payout service not configured';
      await payout.save();

      res.status(503).json({
        success: false,
        message:
          'M-Pesa payout service is not configured. Please contact support to enable withdrawals.',
      });
      return;
    }

    try {
      const response = await mpesaService.initiateB2CPayout(
        payoutPhone,
        payout.amount,
        payout.remarks || 'Farmer payout',
        payout._id.toString()
      );

      payout.status = PayoutStatus.PROCESSING;
      payout.mpesaConversationId = response.ConversationID || response.conversationID;
      payout.mpesaOriginatorConversationId =
        response.OriginatorConversationID || response.originatorConversationID;
      payout.mpesaResponseDescription = response.ResponseDescription;
      await payout.save();

      res.json({
        success: true,
        message: 'Payout request submitted successfully',
        data: payout,
      });
    } catch (error: any) {
      payout.status = PayoutStatus.FAILED;
      payout.failureReason = error.message;
      await payout.save();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const getPayouts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payouts = await Payout.find({ farmer: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
};

export const handlePayoutResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = req.body?.Result;
    if (!result) {
      res.status(400).json({ message: 'Invalid payload' });
      return;
    }

    const originatorConversationId = result.OriginatorConversationID;
    const conversationId = result.ConversationID;
    const resultCode = result.ResultCode;
    const resultDesc = result.ResultDesc;

    const payout = await Payout.findOne({
      $or: [
        { mpesaOriginatorConversationId: originatorConversationId },
        { mpesaConversationId: conversationId },
      ],
    });

    if (!payout) {
      logger.warn('Payout callback received for unknown conversation', {
        originatorConversationId,
        conversationId,
      });
      res.json({ message: 'Callback acknowledged' });
      return;
    }

    const parameters = result.ResultParameters?.ResultParameter || [];
    const paramMap: Record<string, any> = {};
    parameters.forEach((param: any) => {
      paramMap[param.Key] = param.Value;
    });

    if (resultCode === 0) {
      payout.status = PayoutStatus.COMPLETED;
      payout.mpesaTransactionId =
        paramMap.TransactionReceipt || paramMap.TransactionID || payout.mpesaTransactionId;
      payout.mpesaResponseDescription = resultDesc;
      payout.amount = Number(paramMap.TransactionAmount || payout.amount);
    } else {
      payout.status = PayoutStatus.FAILED;
      payout.failureReason = resultDesc || 'Payout failed';
      payout.mpesaResponseDescription = resultDesc;
    }

    await payout.save();
    res.json({ message: 'Callback processed successfully' });
  } catch (error: any) {
    logger.error('Payout callback error:', error.message);
    res.status(500).json({ message: 'Error processing payout callback' });
  }
};

export const handlePayoutTimeout = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = req.body?.Result || req.body;
    const originatorConversationId = result?.OriginatorConversationID;

    if (originatorConversationId) {
      await Payout.findOneAndUpdate(
        { mpesaOriginatorConversationId: originatorConversationId },
        {
          status: PayoutStatus.FAILED,
          failureReason: 'M-Pesa payout timed out',
        }
      );
    }

    res.json({ message: 'Timeout acknowledged' });
  } catch (error: any) {
    logger.error('Payout timeout callback error:', error.message);
    res.status(500).json({ message: 'Error processing payout timeout' });
  }
};


