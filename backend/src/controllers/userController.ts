import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User, UserRole, VerificationStatus, Product, Review } from '../models';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import emailService from '../services/emailService';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updateData = req.body;
    const allowedFields = ['firstName', 'lastName', 'phone', 'farmLocation', 'vehicleType', 'licenseNumber'];

    const filteredData: any = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user!.id, filteredData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

export const uploadIdDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({
        success: false,
        message: 'Please provide document URL',
      });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.role !== UserRole.FARMER) {
      res.status(400).json({
        success: false,
        message: 'ID document upload is only for farmers',
      });
      return;
    }

    user.idDocument = {
      url,
      uploadedAt: new Date(),
    };
    user.verificationStatus = VerificationStatus.PENDING;
    await user.save();

    res.json({
      success: true,
      message: 'ID document uploaded successfully',
      data: { user },
    });
  } catch (error: any) {
    logger.error('Upload ID document error:', error);
    next(error);
  }
};

export const getPendingVerifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const farmers = await User.find({
      role: UserRole.FARMER,
      verificationStatus: VerificationStatus.PENDING,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { farmers },
    });
  } catch (error: any) {
    logger.error('Get pending verifications error:', error);
    next(error);
  }
};

export const verifyFarmer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { farmerId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== UserRole.FARMER) {
      res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
      return;
    }

    if (action === 'approve') {
      farmer.verificationStatus = VerificationStatus.APPROVED;
      farmer.verifiedAt = new Date();
      farmer.verifiedBy = req.user!.id as any;
    } else if (action === 'reject') {
      farmer.verificationStatus = VerificationStatus.REJECTED;
      farmer.verifiedBy = req.user!.id as any;
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"',
      });
      return;
    }

    await farmer.save();

    // Send verification notification email
    try {
      await emailService.sendFarmerVerificationNotification(
        farmer.email,
        action === 'approve' ? 'approved' : 'rejected',
        reason
      );
    } catch (error: any) {
      logger.error('Failed to send verification email:', error);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: `Farmer ${action}d successfully`,
      data: { farmer },
    });
  } catch (error: any) {
    logger.error('Verify farmer error:', error);
    next(error);
  }
};

export const getFarmerPublicProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { farmerId } = req.params;

    if (!Types.ObjectId.isValid(farmerId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid farmer ID',
      });
      return;
    }

    const farmer = await User.findOne({
      _id: farmerId,
      role: UserRole.FARMER,
    })
      .select('firstName lastName phone farmLocation verificationStatus createdAt')
      .lean();

    if (!farmer) {
      res.status(404).json({
        success: false,
        message: 'Farmer not found',
      });
      return;
    }

    const farmerObjectId = new Types.ObjectId(farmerId);

    const [products, productStatsAgg, reviewStatsAgg, recentReviews] = await Promise.all([
      Product.find({ farmer: farmerObjectId, isActive: true })
        .select(
          'name price unit images inventory location category description averageRating totalReviews createdAt'
        )
        .sort({ createdAt: -1 })
        .lean(),
      Product.aggregate([
        { $match: { farmer: farmerObjectId } },
        {
          $group: {
            _id: '$farmer',
            totalProducts: { $sum: 1 },
            totalInventory: { $sum: '$inventory.quantity' },
            averagePrice: { $avg: '$price' },
          },
        },
      ]),
      Review.aggregate([
        { $match: { farmer: farmerObjectId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
      ]),
      Review.find({ farmer: farmerObjectId })
        .populate('buyer', 'firstName lastName')
        .populate('product', 'name images price unit')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const productStats = productStatsAgg[0] || {
      totalProducts: 0,
      totalInventory: 0,
      averagePrice: 0,
    };

    const ratingDistribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let totalReviews = 0;
    let weightedRating = 0;

    reviewStatsAgg.forEach((stat) => {
      const rating = stat._id as number;
      const count = stat.count as number;
      if (ratingDistribution[rating] !== undefined) {
        ratingDistribution[rating] = count;
      }
      totalReviews += count;
      weightedRating += rating * count;
    });

    const averageRating = totalReviews > 0 ? Number((weightedRating / totalReviews).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        farmer: {
          _id: farmerId,
          ...farmer,
        },
        stats: {
          totalProducts: productStats.totalProducts || 0,
          totalInventory: productStats.totalInventory || 0,
          averagePrice: productStats.averagePrice ? Number(productStats.averagePrice.toFixed(2)) : 0,
          averageRating,
          totalReviews,
          ratingDistribution,
        },
        products,
        recentReviews,
      },
    });
  } catch (error: any) {
    logger.error('Get farmer public profile error:', error);
    next(error);
  }
};

