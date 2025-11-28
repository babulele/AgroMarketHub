import mongoose, { Document, Schema } from 'mongoose';

export enum DeliveryStatus {
  ASSIGNED = 'assigned',
  PICKING = 'picking',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export interface IDelivery extends Document {
  order: mongoose.Types.ObjectId;
  rider: mongoose.Types.ObjectId;
  status: DeliveryStatus;
  statusHistory: Array<{
    status: DeliveryStatus;
    updatedAt: Date;
    notes?: string;
  }>;
  pickupLocation: {
    address: string;
    county: string;
    subCounty: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  deliveryLocation: {
    address: string;
    county: string;
    subCounty: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  estimatedPickupTime?: Date;
  actualPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.ASSIGNED,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(DeliveryStatus),
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
    pickupLocation: {
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
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    deliveryLocation: {
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
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    estimatedPickupTime: Date,
    actualPickupTime: Date,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
DeliverySchema.index({ order: 1 }, { unique: true }); // One delivery per order
DeliverySchema.index({ rider: 1 });
DeliverySchema.index({ status: 1 });
DeliverySchema.index({ createdAt: -1 });

export const Delivery = mongoose.model<IDelivery>('Delivery', DeliverySchema);

