import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionPlan {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface ISubscription extends Document {
  farmer: mongoose.Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  amount: number;
  payment: {
    mpesaTransactionId: string;
    paidAt: Date;
  };
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: {
      mpesaTransactionId: {
        type: String,
        required: true,
      },
      paidAt: {
        type: Date,
        required: true,
      },
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionSchema.index({ farmer: 1 }, { unique: true }); // One active subscription per farmer
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ endDate: 1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

