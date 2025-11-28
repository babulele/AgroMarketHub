import mongoose, { Document, Schema } from 'mongoose';

export enum DisputeType {
  SPOILAGE = 'spoilage',
  WRONG_DELIVERY = 'wrong_delivery',
  MISSING_ITEMS = 'missing_items',
  QUALITY_ISSUE = 'quality_issue',
  OTHER = 'other',
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface IDispute extends Document {
  order: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  farmer?: mongoose.Types.ObjectId;
  type: DisputeType;
  status: DisputeStatus;
  description: string;
  evidence?: string[]; // URLs to images/documents
  resolution?: {
    resolvedBy: mongoose.Types.ObjectId;
    resolvedAt: Date;
    action: 'refund' | 'replacement' | 'partial_refund' | 'rejected';
    refundAmount?: number;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: Object.values(DisputeType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.OPEN,
    },
    description: {
      type: String,
      required: true,
    },
    evidence: [String],
    resolution: {
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      resolvedAt: Date,
      action: {
        type: String,
        enum: ['refund', 'replacement', 'partial_refund', 'rejected'],
      },
      refundAmount: Number,
      notes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DisputeSchema.index({ order: 1 });
DisputeSchema.index({ buyer: 1 });
DisputeSchema.index({ farmer: 1 });
DisputeSchema.index({ status: 1 });
DisputeSchema.index({ createdAt: -1 });

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);

