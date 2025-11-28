import { Response, NextFunction } from 'express';
import { Auction, AuctionStatus, Bid, Product } from '../models';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models';
import logger from '../utils/logger';

// Create an auction
export const createAuction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      productId,
      title,
      description,
      startingPrice,
      reservePrice,
      quantity,
      unit,
      startDate,
      endDate,
      images,
      location,
      minimumBidIncrement,
    } = req.body;

    // Validate required fields
    if (!productId || !title || !description || !startingPrice || !quantity || !startDate || !endDate || !location) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      res.status(400).json({
        success: false,
        message: 'Start date must be in the future',
      });
      return;
    }

    if (end <= start) {
      res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      });
      return;
    }

    // Verify product exists and belongs to farmer
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (product.farmer.toString() !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'You can only create auctions for your own products',
      });
      return;
    }

    // Check if product has enough inventory
    if (product.inventory.quantity < quantity) {
      res.status(400).json({
        success: false,
        message: 'Insufficient inventory for auction quantity',
      });
      return;
    }

    // Create auction
    const auction = await Auction.create({
      farmer: req.user!.id,
      product: productId,
      title: title.trim(),
      description: description.trim(),
      startingPrice: Number(startingPrice),
      reservePrice: reservePrice ? Number(reservePrice) : undefined,
      quantity: Number(quantity),
      unit: unit || product.unit,
      startDate: start,
      endDate: end,
      images: images || product.images || [],
      location: {
        county: location.county,
        subCounty: location.subCounty,
      },
      minimumBidIncrement: minimumBidIncrement || 50,
      status: start <= now ? AuctionStatus.ACTIVE : AuctionStatus.DRAFT,
      currentHighestBid: Number(startingPrice),
    });

    res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      data: { auction },
    });
  } catch (error: any) {
    logger.error('Create auction error:', error);
    next(error);
  }
};

// Get all auctions
export const getAuctions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, county, category, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    } else {
      // Default to active auctions
      query.status = AuctionStatus.ACTIVE;
    }

    if (county) {
      query['location.county'] = county;
    }

    // Filter by product category if provided
    if (category) {
      const products = await Product.find({ category }).select('_id');
      query.product = { $in: products.map((p) => p._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const auctions = await Auction.find(query)
      .populate({ path: 'farmer', select: 'firstName lastName farmLocation' })
      .populate({ path: 'product', select: 'name category images' })
      .populate({ path: 'winningBid', populate: { path: 'buyer', select: 'firstName lastName' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Auction.countDocuments(query);

    res.json({
      success: true,
      data: {
        auctions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get auctions error:', error);
    next(error);
  }
};

// Get single auction with bids
export const getAuction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id)
      .populate({ path: 'farmer', select: 'firstName lastName farmLocation verificationStatus' })
      .populate({ path: 'product', select: 'name category description images' })
      .populate({
        path: 'bids',
        populate: { path: 'buyer', select: 'firstName lastName' },
        options: { sort: { amount: -1 } },
      })
      .populate({ path: 'winningBid', populate: { path: 'buyer', select: 'firstName lastName' } });

    if (!auction) {
      res.status(404).json({
        success: false,
        message: 'Auction not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { auction },
    });
  } catch (error: any) {
    logger.error('Get auction error:', error);
    next(error);
  }
};

// Place a bid
export const placeBid = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { auctionId, amount, quantity } = req.body;

    if (!auctionId || !amount || !quantity) {
      res.status(400).json({
        success: false,
        message: 'Please provide auctionId, amount, and quantity',
      });
      return;
    }

    // Verify user is a buyer
    if (req.user!.role !== UserRole.BUYER) {
      res.status(403).json({
        success: false,
        message: 'Only buyers can place bids',
      });
      return;
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      res.status(404).json({
        success: false,
        message: 'Auction not found',
      });
      return;
    }

    // Check auction status
    if (auction.status !== AuctionStatus.ACTIVE) {
      res.status(400).json({
        success: false,
        message: 'Auction is not active',
      });
      return;
    }

    // Check auction dates
    const now = new Date();
    if (now < auction.startDate) {
      res.status(400).json({
        success: false,
        message: 'Auction has not started yet',
      });
      return;
    }

    if (now > auction.endDate) {
      res.status(400).json({
        success: false,
        message: 'Auction has ended',
      });
      return;
    }

    // Check quantity
    if (quantity > auction.quantity) {
      res.status(400).json({
        success: false,
        message: 'Bid quantity exceeds available quantity',
      });
      return;
    }

    // Check bid amount
    const bidAmount = Number(amount);
    const currentHighest = auction.currentHighestBid || auction.startingPrice;
    const minBid = currentHighest + auction.minimumBidIncrement;

    if (bidAmount < minBid) {
      res.status(400).json({
        success: false,
        message: `Bid must be at least KES ${minBid} (current highest: KES ${currentHighest} + minimum increment: KES ${auction.minimumBidIncrement})`,
      });
      return;
    }

    // Check reserve price
    if (auction.reservePrice && bidAmount < auction.reservePrice) {
      res.status(400).json({
        success: false,
        message: `Bid must meet or exceed reserve price of KES ${auction.reservePrice}`,
      });
      return;
    }

    // Create bid
    const bid = await Bid.create({
      buyer: req.user!.id,
      auction: auctionId,
      amount: bidAmount,
      quantity: Number(quantity),
    });

    // Update auction
    auction.currentHighestBid = bidAmount;
    auction.bids.push(bid._id);
    
    // Mark previous winning bid as not winning
    if (auction.winningBid) {
      await Bid.findByIdAndUpdate(auction.winningBid, { isWinning: false });
    }
    
    auction.winningBid = bid._id;
    auction.winningBuyer = req.user!.id;
    await auction.save();

    // Mark new bid as winning
    await Bid.findByIdAndUpdate(bid._id, { isWinning: true });

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: { bid, auction },
    });
  } catch (error: any) {
    logger.error('Place bid error:', error);
    next(error);
  }
};

// Get farmer's auctions
export const getFarmerAuctions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;

    const query: any = { farmer: req.user!.id };
    if (status) {
      query.status = status;
    }

    const auctions = await Auction.find(query)
      .populate({ path: 'product', select: 'name category images' })
      .populate({ path: 'winningBid', populate: { path: 'buyer', select: 'firstName lastName' } })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { auctions },
    });
  } catch (error: any) {
    logger.error('Get farmer auctions error:', error);
    next(error);
  }
};

// Close auction (farmer only)
export const closeAuction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const auction = await Auction.findById(id);
    if (!auction) {
      res.status(404).json({
        success: false,
        message: 'Auction not found',
      });
      return;
    }

    if (auction.farmer.toString() !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'You can only close your own auctions',
      });
      return;
    }

    auction.status = AuctionStatus.CLOSED;
    await auction.save();

    res.json({
      success: true,
      message: 'Auction closed successfully',
      data: { auction },
    });
  } catch (error: any) {
    logger.error('Close auction error:', error);
    next(error);
  }
};

// Get buyer's bids
export const getBuyerBids = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bids = await Bid.find({ buyer: req.user!.id })
      .populate({
        path: 'auction',
        populate: [
          { path: 'farmer', select: 'firstName lastName' },
          { path: 'product', select: 'name category images' },
        ],
      })
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: { bids },
    });
  } catch (error: any) {
    logger.error('Get buyer bids error:', error);
    next(error);
  }
};


