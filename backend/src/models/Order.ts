import mongoose, { Document, Schema } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  ASSIGNED = 'assigned',
  PICKING = 'picking',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface IOrder extends Document {
  buyer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  payment: {
    method: string;
    mpesaTransactionId?: string;
    paidAt?: Date;
    status: 'pending' | 'completed' | 'failed';
  };
  delivery: {
    address: string;
    county: string;
    subCounty: string;
    phone: string;
    rider?: mongoose.Types.ObjectId;
    assignedAt?: Date;
    estimatedDelivery?: Date;
    deliveredAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    payment: {
      method: {
        type: String,
        default: 'mpesa',
      },
      mpesaTransactionId: String,
      paidAt: Date,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
      },
    },
    delivery: {
      address: {
        type: String,
        required: true,
      },
      county: {
        type: String,
        required: true,
      },
      subCounty: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      rider: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      assignedAt: Date,
      estimatedDelivery: Date,
      deliveredAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OrderSchema.index({ buyer: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'delivery.rider': 1 });
OrderSchema.index({ 'payment.mpesaTransactionId': 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

