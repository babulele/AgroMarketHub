import { Response, NextFunction } from 'express';
import { Dispute, DisputeStatus, Order, Product, User, UserRole } from '../models';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const getDisputes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const disputes = await Dispute.find(query)
      .populate('order')
      .populate('buyer', 'firstName lastName email')
      .populate('farmer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Dispute.countDocuments(query);

    res.json({
      success: true,
      data: {
        disputes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get disputes error:', error);
    next(error);
  }
};

export const resolveDispute = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, refundAmount, notes } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({
        success: false,
        message: 'Dispute not found',
      });
      return;
    }

    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolution = {
      resolvedBy: req.user!.id as any,
      resolvedAt: new Date(),
      action: action as 'refund' | 'replacement' | 'partial_refund' | 'rejected',
      refundAmount,
      notes: notes || '',
    };

    await dispute.save();

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: { dispute },
    });
  } catch (error: any) {
    logger.error('Resolve dispute error:', error);
    next(error);
  }
};

export const getMarketplaceStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalFarmers,
          totalBuyers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get marketplace stats error:', error);
    next(error);
  }
};

export const getRegionalData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { county } = req.query;

    const query: any = {};
    if (county) {
      query['location.county'] = county;
    }

    const products = await Product.find(query).select('location price inventory');
    // TODO: Use orders to calculate totalOrders and totalRevenue
    // const orders = await Order.find(query).select('delivery totalAmount');

    // Aggregate data by region
    const regionalData = products.reduce((acc: any, product: any) => {
      const county = product.location.county;
      if (!acc[county]) {
        acc[county] = {
          county,
          productCount: 0,
          totalInventory: 0,
          averagePrice: 0,
          totalOrders: 0,
          totalRevenue: 0,
          prices: [] as number[],
        };
      }
      acc[county].productCount += 1;
      acc[county].totalInventory += product.inventory.quantity;
      acc[county].prices.push(product.price);
      return acc;
    }, {});

    // Calculate average prices
    Object.keys(regionalData).forEach((county) => {
      const prices = regionalData[county].prices;
      regionalData[county].averagePrice = prices.length > 0
        ? prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length
        : 0;
      delete regionalData[county].prices;
    });

    res.json({
      success: true,
      data: { regionalData: Object.values(regionalData) },
    });
  } catch (error: any) {
    logger.error('Get regional data error:', error);
    next(error);
  }
};

export const getMarketPrices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { days = 30, category } = req.query;
    const daysNum = Number(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get orders from the last N days
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      'payment.status': 'completed',
    })
      .select('items createdAt totalAmount')
      .sort({ createdAt: 1 })
      .lean();

    // Aggregate prices by date and category
    const priceData: Record<string, any> = {};

    // Get product details for items
    const productIds = new Set<string>();
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (item.product) {
          productIds.add(item.product.toString());
        }
      });
    });

    const products = await Product.find({
      _id: { $in: Array.from(productIds) },
    }).select('_id category price').lean();

    const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

    orders.forEach((order: any) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!priceData[date]) {
        priceData[date] = {};
      }

      order.items.forEach((item: any) => {
        const productId = item.product?.toString() || item.productId?.toString();
        const product = productId ? productMap.get(productId) : null;
        if (!product) return;

        const cat = category ? product.category : 'all';
        if (!priceData[date][cat]) {
          priceData[date][cat] = { total: 0, count: 0, prices: [] as number[] };
        }

        // Use item price or product price
        const itemPrice = item.price || product.price;
        priceData[date][cat].total += itemPrice;
        priceData[date][cat].count += 1;
        priceData[date][cat].prices.push(itemPrice);
      });
    });

    // Format for chart
    const chartData = Object.keys(priceData)
      .sort()
      .map((date) => {
        const dayData: any = { date };
        Object.keys(priceData[date]).forEach((cat) => {
          const data = priceData[date][cat];
          dayData[cat] = data.prices.length > 0
            ? data.prices.reduce((sum: number, p: number) => sum + p, 0) / data.prices.length
            : 0;
        });
        return dayData;
      });

    res.json({
      success: true,
      data: { priceData: chartData },
    });
  } catch (error: any) {
    logger.error('Get market prices error:', error);
    next(error);
  }
};

export const getFoodScarcityTrends = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const daysNum = Number(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get products and their inventory history (using createdAt as proxy for now)
    const products = await Product.find({
      createdAt: { $gte: startDate },
    }).select('name category inventory location createdAt');

    // Aggregate by date and category
    const scarcityData: Record<string, any> = {};

    products.forEach((product: any) => {
      const date = new Date(product.createdAt).toISOString().split('T')[0];
      if (!scarcityData[date]) {
        scarcityData[date] = {};
      }

      const category = product.category || 'other';
      if (!scarcityData[date][category]) {
        scarcityData[date][category] = {
          totalInventory: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
          productCount: 0,
        };
      }

      scarcityData[date][category].totalInventory += product.inventory.quantity;
      scarcityData[date][category].productCount += 1;

      if (product.inventory.quantity === 0) {
        scarcityData[date][category].outOfStockCount += 1;
      } else if (product.inventory.quantity < 10) {
        scarcityData[date][category].lowStockCount += 1;
      }
    });

    // Format for chart
    const chartData = Object.keys(scarcityData)
      .sort()
      .map((date) => {
        const dayData: any = { date };
        Object.keys(scarcityData[date]).forEach((category) => {
          const data = scarcityData[date][category];
          dayData[category] = data.totalInventory;
          dayData[`${category}_lowStock`] = data.lowStockCount;
          dayData[`${category}_outOfStock`] = data.outOfStockCount;
        });
        return dayData;
      });

    res.json({
      success: true,
      data: { scarcityData: chartData },
    });
  } catch (error: any) {
    logger.error('Get food scarcity trends error:', error);
    next(error);
  }
};

export const getBuyerActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const daysNum = Number(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get orders with delivery locations
    const orders = await Order.find({
      createdAt: { $gte: startDate },
    }).select('delivery createdAt totalAmount items');

    // Aggregate buyer activity by county
    const activityData: Record<string, any> = {};

    orders.forEach((order: any) => {
      const county = order.delivery?.county || 'Unknown';
      if (!activityData[county]) {
        activityData[county] = {
          county,
          orderCount: 0,
          totalRevenue: 0,
          totalItems: 0,
          uniqueBuyers: new Set(),
        };
      }

      activityData[county].orderCount += 1;
      activityData[county].totalRevenue += order.totalAmount;
      activityData[county].totalItems += order.items.length;
    });

    // Convert to array and calculate activity score
    const heatmapData = Object.values(activityData).map((region: any) => ({
      county: region.county,
      orderCount: region.orderCount,
      totalRevenue: region.totalRevenue,
      totalItems: region.totalItems,
      activityScore: region.orderCount * 10 + region.totalRevenue / 100, // Weighted score
    }));

    // Sort by activity score
    heatmapData.sort((a, b) => b.activityScore - a.activityScore);

    res.json({
      success: true,
      data: { buyerActivity: heatmapData },
    });
  } catch (error: any) {
    logger.error('Get buyer activity error:', error);
    next(error);
  }
};

export const getSupplyDemandAnalysis = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { county } = req.query;

    const productQuery: any = { isActive: true };
    if (county) {
      productQuery['location.county'] = county;
    }

    // Get products and orders
    const products = await Product.find(productQuery).select('name category inventory location price').lean();
    const orders = await Order.find({
      'payment.status': 'completed',
    })
      .select('items createdAt')
      .lean();

    // Get product details for order items
    const orderProductIds = new Set<string>();
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (item.product) {
          orderProductIds.add(item.product.toString());
        }
      });
    });

    const orderProducts = await Product.find({
      _id: { $in: Array.from(orderProductIds) },
    }).select('_id category').lean();

    const orderProductMap = new Map(orderProducts.map((p: any) => [p._id.toString(), p]));

    // Aggregate supply by category
    const supplyData: Record<string, any> = {};
    const demandData: Record<string, any> = {};

    products.forEach((product: any) => {
      const category = product.category || 'other';
      if (!supplyData[category]) {
        supplyData[category] = {
          category,
          totalInventory: 0,
          productCount: 0,
          averagePrice: 0,
          prices: [] as number[],
        };
      }
      supplyData[category].totalInventory += product.inventory.quantity;
      supplyData[category].productCount += 1;
      supplyData[category].prices.push(product.price);
    });

    // Calculate average prices
    Object.keys(supplyData).forEach((category) => {
      const prices = supplyData[category].prices;
      supplyData[category].averagePrice = prices.length > 0
        ? prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length
        : 0;
      delete supplyData[category].prices;
    });

    // Aggregate demand by category (from orders)
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const productId = item.product?.toString() || item.productId?.toString();
        const product = productId ? orderProductMap.get(productId) : null;
        if (!product) return;

        const category = product.category || 'other';
        if (!demandData[category]) {
          demandData[category] = {
            category,
            totalQuantity: 0,
            orderCount: 0,
          };
        }
        demandData[category].totalQuantity += item.quantity || 0;
        demandData[category].orderCount += 1;
      });
    });

    // Combine supply and demand
    const analysis = Object.keys(supplyData).map((category) => ({
      category,
      supply: supplyData[category].totalInventory,
      demand: demandData[category]?.totalQuantity || 0,
      supplyDemandRatio: demandData[category]?.totalQuantity
        ? supplyData[category].totalInventory / demandData[category].totalQuantity
        : 0,
      averagePrice: supplyData[category].averagePrice,
      productCount: supplyData[category].productCount,
    }));

    res.json({
      success: true,
      data: { analysis },
    });
  } catch (error: any) {
    logger.error('Get supply demand analysis error:', error);
    next(error);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role, organizationName, organizationType } = req.body;

    // Validate role
    if (role !== UserRole.NGO && role !== UserRole.COUNTY_OFFICER) {
      res.status(400).json({
        success: false,
        message: 'Role must be either "ngo" or "county_officer"',
      });
      return;
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !organizationName || !organizationType) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Import bcrypt here to avoid circular dependency
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      organizationName,
      organizationType,
      isEmailVerified: true, // Admin-created accounts are pre-verified
    });

    res.status(201).json({
      success: true,
      message: `${role === UserRole.NGO ? 'NGO' : 'County Officer'} account created successfully`,
      data: { user },
    });
  } catch (error: any) {
    logger.error('Create user error:', error);
    next(error);
  }
};

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roles } = req.query;
    const roleFilter = roles ? (roles as string).split(',') : [UserRole.NGO, UserRole.COUNTY_OFFICER];

    const users = await User.find({
      role: { $in: roleFilter },
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error: any) {
    logger.error('Get users error:', error);
    next(error);
  }
};

