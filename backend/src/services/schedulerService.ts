import cron from 'node-cron';
import { Subscription, SubscriptionStatus } from '../models';
import emailService from './emailService';
import logger from '../utils/logger';
import axios from 'axios';

class SchedulerService {
  private aiServiceUrl: string;

  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.startSchedulers();
  }

  private startSchedulers() {
    // Daily demand spike alerts at 8 AM
    cron.schedule('0 8 * * *', async () => {
      logger.info('Running daily demand spike alert job...');
      await this.checkDemandSpikes();
    });

    // Subscription renewal reminders - check daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      logger.info('Running subscription renewal reminder job...');
      await this.checkSubscriptionRenewals();
    });

    logger.info('Scheduled jobs started: Demand spike alerts (daily 8 AM), Subscription reminders (daily 9 AM)');
  }

  private async checkDemandSpikes() {
    try {
      // Get all active subscriptions
      const activeSubscriptions = await Subscription.find({
        status: SubscriptionStatus.ACTIVE,
      }).populate('farmer');

      // Get unique farmers with active subscriptions
      const subscribedFarmers = activeSubscriptions
        .map((sub: any) => sub.farmer)
        .filter((farmer: any) => farmer && farmer.verificationStatus === 'approved')
        .filter((farmer: any, index: number, self: any[]) => 
          index === self.findIndex((f: any) => f._id.toString() === farmer._id.toString())
        );

      if (subscribedFarmers.length === 0) {
        logger.info('No subscribed farmers found for demand alerts');
        return;
      }

      // Get AI forecasts from AI service
      let forecasts: any[] = [];
      try {
        const response = await axios.get(`${this.aiServiceUrl}/api/v1/forecasts/nationwide?forecast_type=monthly`);
        if (response.data.success && response.data.data.forecasts) {
          forecasts = response.data.data.forecasts;
        }
      } catch (error: any) {
        logger.error('Failed to fetch AI forecasts for demand alerts:', error.message);
        return;
      }

      // Identify high-demand crops (demand > 80% or significant increase)
      const highDemandCrops = forecasts.filter(
        (forecast: any) => forecast.demand > 80 || (forecast.confidence && forecast.confidence > 90)
      );

      if (highDemandCrops.length === 0) {
        logger.info('No high-demand crops detected');
        return;
      }

      // Send alerts to all subscribed farmers
      let successCount = 0;
      let failCount = 0;

      for (const farmer of subscribedFarmers) {
        try {
          await emailService.sendAIDemandAlert(farmer.email, {
            crops: highDemandCrops.map((crop: any) => ({
              name: crop.crop,
              demand: crop.demand,
              confidence: crop.confidence,
              priceRecommendation: crop.priceRecommendation,
            })),
          });
          successCount++;
        } catch (error: any) {
          logger.error(`Failed to send demand alert to ${farmer.email}:`, error.message);
          failCount++;
        }
      }

      logger.info(`Demand spike alerts sent: ${successCount} successful, ${failCount} failed`);
    } catch (error: any) {
      logger.error('Error in demand spike alert job:', error);
    }
  }

  private async checkSubscriptionRenewals() {
    try {
      // Find subscriptions expiring in 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const expiringSubscriptions = await Subscription.find({
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          $gte: new Date(), // Not expired yet
          $lte: sevenDaysFromNow, // Expiring within 7 days
        },
      }).populate('farmer');

      if (expiringSubscriptions.length === 0) {
        logger.info('No subscriptions expiring soon');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const subscription of expiringSubscriptions) {
        try {
          const farmer = subscription.farmer as any;
          if (farmer && farmer.email) {
            await emailService.sendSubscriptionReminder(farmer.email, {
              endDate: subscription.endDate,
              plan: subscription.plan,
              amount: subscription.amount,
            });
            successCount++;
          }
        } catch (error: any) {
          logger.error(`Failed to send renewal reminder for subscription ${subscription._id}:`, error.message);
          failCount++;
        }
      }

      logger.info(`Subscription renewal reminders sent: ${successCount} successful, ${failCount} failed`);
    } catch (error: any) {
      logger.error('Error in subscription renewal reminder job:', error);
    }
  }

  // Manual trigger for testing
  async triggerDemandSpikeCheck() {
    logger.info('Manually triggering demand spike check...');
    await this.checkDemandSpikes();
  }

  async triggerSubscriptionCheck() {
    logger.info('Manually triggering subscription renewal check...');
    await this.checkSubscriptionRenewals();
  }
}

export default new SchedulerService();

