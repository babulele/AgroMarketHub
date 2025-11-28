import { Response, NextFunction } from 'express';
import { Order, OrderStatus, Product } from '../models';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, delivery } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide order items',
      });
      return;
    }

    if (!delivery || !delivery.address || !delivery.county || !delivery.phone) {
      res.status(400).json({
        success: false,
        message: 'Please provide delivery information',
      });
      return;
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
        return;
      }

      if (!product.inventory.available || product.inventory.quantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${product.name}`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        unit: product.unit,
      });
    }

    // Create order
    const order = await Order.create({
      buyer: req.user!.id,
      items: orderItems,
      totalAmount,
      status: OrderStatus.PENDING,
      delivery: {
        address: delivery.address,
        county: delivery.county,
        subCounty: delivery.subCounty || '',
        phone: delivery.phone,
      },
    });

    // Update product inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 
          'inventory.quantity': -item.quantity,
          cartAdditions: 1,
        },
      });

      const product = await Product.findById(item.productId);
      if (product && product.inventory.quantity <= 0) {
        product.inventory.available = false;
        await product.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order },
    });
  } catch (error: any) {
    logger.error('Create order error:', error);
    next(error);
  }
};

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};

    // Filter by user role
    if (req.user!.role === 'buyer') {
      query.buyer = req.user!.id;
    } else if (req.user!.role === 'farmer') {
      // Get orders for farmer's products
      const farmerProducts = await Product.find({ farmer: req.user!.id }).select('_id');
      const productIds = farmerProducts.map((p) => p._id);
      query['items.product'] = { $in: productIds };
    } else if (req.user!.role === 'rider') {
      query['delivery.rider'] = req.user!.id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('buyer', 'firstName lastName phone')
      .populate('items.product', 'name images')
      .populate('delivery.rider', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get orders error:', error);
    next(error);
  }
};

export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('buyer', 'firstName lastName email phone')
      .populate('items.product')
      .populate('delivery.rider', 'firstName lastName phone');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Check authorization
    const isAuthorized =
      order.buyer._id.toString() === req.user!.id ||
      req.user!.role === 'admin' ||
      (req.user!.role === 'rider' && order.delivery.rider?._id.toString() === req.user!.id);

    if (!isAuthorized) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
      return;
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    logger.error('Get order error:', error);
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order },
    });
  } catch (error: any) {
    logger.error('Update order status error:', error);
    next(error);
  }
};

export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Check authorization
    if (order.buyer.toString() !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
      return;
    }

    // Can only cancel pending or confirmed orders
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
      return;
    }

    // Restore inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.quantity': item.quantity },
      });

      const product = await Product.findById(item.product);
      if (product && product.inventory.quantity > 0) {
        product.inventory.available = true;
        await product.save();
      }
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error: any) {
    logger.error('Cancel order error:', error);
    next(error);
  }
};

