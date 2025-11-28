import { Response, NextFunction } from 'express';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../models';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const createSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { plan, mpesaTransactionId } = req.body;

    if (!plan || !Object.values(SubscriptionPlan).includes(plan)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid subscription plan (monthly or annual)',
      });
      return;
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      farmer: req.user!.id,
      status: SubscriptionStatus.ACTIVE,
    });

    if (existingSubscription) {
      res.status(400).json({
        success: false,
        message: 'You already have an active subscription',
      });
      return;
    }

    // Calculate dates and amount (example pricing)
    const startDate = new Date();
    const endDate = new Date();
    let amount = 0;

    if (plan === SubscriptionPlan.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
      amount = 500; // KES 500 per month
    } else if (plan === SubscriptionPlan.ANNUAL) {
      endDate.setFullYear(endDate.getFullYear() + 1);
      amount = 5000; // KES 5000 per year
    }

    const subscription = await Subscription.create({
      farmer: req.user!.id,
      plan,
      startDate,
      endDate,
      amount,
      payment: {
        mpesaTransactionId,
        paidAt: new Date(),
      },
      status: SubscriptionStatus.ACTIVE,
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: { subscription },
    });
  } catch (error: any) {
    logger.error('Create subscription error:', error);
    next(error);
  }
};

export const getSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subscription = await Subscription.findOne({ farmer: req.user!.id });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
      return;
    }

    res.json({
      success: true,
      data: { subscription },
    });
  } catch (error: any) {
    logger.error('Get subscription error:', error);
    next(error);
  }
};

export const cancelSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subscription = await Subscription.findOne({ farmer: req.user!.id });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'No subscription found',
      });
      return;
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.autoRenew = false;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: { subscription },
    });
  } catch (error: any) {
    logger.error('Cancel subscription error:', error);
    next(error);
  }
};

