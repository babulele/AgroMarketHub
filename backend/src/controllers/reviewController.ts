import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Review, Product } from '../models';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models';
import { Order } from '../models';
import logger from '../utils/logger';

// Create a review
export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, orderId, rating, comment, images } = req.body;

    // Validate required fields
    if (!productId || !orderId || !rating || !comment) {
      res.status(400).json({
        success: false,
        message: 'Please provide productId, orderId, rating, and comment',
      });
      return;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
      return;
    }

    // Verify the order exists and belongs to the buyer
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    if (order.buyer.toString() !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'You can only review orders you placed',
      });
      return;
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      res.status(400).json({
        success: false,
        message: 'You can only review delivered orders',
      });
      return;
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this order',
      });
      return;
    }

    // Verify the product is in the order
    // Order items use 'product' field (ObjectId reference)
    const orderItem = order.items.find(
      (item: any) => 
        (item.product && item.product.toString() === productId) ||
        (item.productId && item.productId.toString() === productId)
    );
    if (!orderItem) {
      res.status(400).json({
        success: false,
        message: 'Product not found in this order',
      });
      return;
    }

    // Get product to get farmer ID
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Create review
    const review = await Review.create({
      buyer: req.user!.id,
      product: productId,
      farmer: product.farmer,
      order: orderId,
      rating,
      comment: comment.trim(),
      images: images || [],
      isVerified: true,
    });

    // Update product average rating (we'll calculate this in a virtual or aggregation)
    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review },
    });
  } catch (error: any) {
    logger.error('Create review error:', error);
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this order',
      });
    } else {
      next(error);
    }
  }
};

// Get reviews for a product
export const getProductReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    let sortOption: any = { createdAt: -1 };

    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortOption = { rating: -1 };
    } else if (sort === 'lowest') {
      sortOption = { rating: 1 };
    } else if (sort === 'helpful') {
      sortOption = { helpful: -1 };
    }

    const reviews = await Review.find({ product: productId })
      .populate({ path: 'buyer', select: 'firstName lastName' })
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    const stats = ratingStats[0] || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [],
    };

    // Calculate rating distribution
    const distribution = {
      5: stats.ratingDistribution.filter((r: number) => r === 5).length,
      4: stats.ratingDistribution.filter((r: number) => r === 4).length,
      3: stats.ratingDistribution.filter((r: number) => r === 3).length,
      2: stats.ratingDistribution.filter((r: number) => r === 2).length,
      1: stats.ratingDistribution.filter((r: number) => r === 1).length,
    };

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
          distribution,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get product reviews error:', error);
    next(error);
  }
};

// Get reviews for a farmer
export const getFarmerReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { farmerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ farmer: farmerId })
      .populate({ path: 'buyer', select: 'firstName lastName' })
      .populate({ path: 'product', select: 'name images' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Calculate average rating for farmer
    const ratingStats = await Review.aggregate([
      { $match: { farmer: new mongoose.Types.ObjectId(farmerId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const stats = ratingStats[0] || {
      averageRating: 0,
      totalReviews: 0,
    };

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get farmer reviews error:', error);
    next(error);
  }
};

// Mark review as helpful
export const markHelpful = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { review },
    });
  } catch (error: any) {
    logger.error('Mark helpful error:', error);
    next(error);
  }
};

// Update product average rating
async function updateProductRating(productId: string): Promise<void> {
  try {
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats[0]) {
      await Product.findByIdAndUpdate(productId, {
        $set: {
          averageRating: Math.round(stats[0].averageRating * 10) / 10,
          totalReviews: stats[0].totalReviews,
        },
      });
    }
  } catch (error: any) {
    logger.error('Update product rating error:', error);
  }
}

