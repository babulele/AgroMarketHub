import { Response, NextFunction } from 'express';
import { Delivery, DeliveryStatus, Order, OrderStatus, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import emailService from '../services/emailService';

export const assignRider = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, riderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    const rider = await User.findById(riderId);
    if (!rider || rider.role !== 'rider') {
      res.status(404).json({
        success: false,
        message: 'Rider not found',
      });
      return;
    }

    // Get farmer location from first product
    // Note: This would need to be populated or fetched separately
    // For now, using order delivery location

    const delivery = await Delivery.create({
      order: orderId,
      rider: riderId,
      status: DeliveryStatus.ASSIGNED,
      statusHistory: [
        {
          status: DeliveryStatus.ASSIGNED,
          updatedAt: new Date(),
        },
      ],
      pickupLocation: {
        address: 'Farm location', // Would come from farmer profile
        county: order.delivery.county,
        subCounty: order.delivery.subCounty,
      },
      deliveryLocation: {
        address: order.delivery.address,
        county: order.delivery.county,
        subCounty: order.delivery.subCounty,
      },
    });

    order.delivery.rider = riderId as any;
    order.delivery.assignedAt = new Date();
    order.status = OrderStatus.ASSIGNED;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Rider assigned successfully',
      data: { delivery },
    });
  } catch (error: any) {
    logger.error('Assign rider error:', error);
    next(error);
  }
};

export const updateDeliveryStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!Object.values(DeliveryStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid delivery status',
      });
      return;
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      res.status(404).json({
        success: false,
        message: 'Delivery not found',
      });
      return;
    }

    // Check authorization
    if (delivery.rider.toString() !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this delivery',
      });
      return;
    }

    delivery.status = status;
    delivery.statusHistory.push({
      status,
      updatedAt: new Date(),
      notes,
    });

    // Update timestamps based on status
    if (status === DeliveryStatus.PICKING) {
      delivery.actualPickupTime = new Date();
    } else if (status === DeliveryStatus.DELIVERED) {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    // Update order status
    const order = await Order.findById(delivery.order).populate('buyer');
    if (order) {
      if (status === DeliveryStatus.PICKING) {
        order.status = OrderStatus.PICKING;
      } else if (status === DeliveryStatus.IN_TRANSIT) {
        order.status = OrderStatus.IN_TRANSIT;
      } else if (status === DeliveryStatus.DELIVERED) {
        order.status = OrderStatus.DELIVERED;
      }
      await order.save();

      // Send delivery update email to buyer
      if (order.buyer && 'email' in order.buyer) {
        try {
          await emailService.sendDeliveryUpdate(
            order.buyer.email as string,
            order._id.toString(),
            status
          );
        } catch (error: any) {
          logger.error('Failed to send delivery update email:', error);
        }
      }
    }

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: { delivery },
    });
  } catch (error: any) {
    logger.error('Update delivery status error:', error);
    next(error);
  }
};

export const getDeliveries = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (req.user!.role === 'rider') {
      query.rider = req.user!.id;
    } else if (req.user!.role === 'admin') {
      // Admins can see all
    } else {
      res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const deliveries = await Delivery.find(query)
      .populate('order')
      .populate('rider', 'firstName lastName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Delivery.countDocuments(query);

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get deliveries error:', error);
    next(error);
  }
};

