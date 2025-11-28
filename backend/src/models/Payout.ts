import mongoose, { Document, Schema } from 'mongoose';

export enum PayoutStatus {
  REQUESTED = 'requested',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IPayout extends Document {
  farmer: mongoose.Types.ObjectId;
  phoneNumber: string;
  amount: number;
  remarks?: string;
  status: PayoutStatus;
  mpesaConversationId?: string;
  mpesaOriginatorConversationId?: string;
  mpesaTransactionId?: string;
  mpesaResponseDescription?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    remarks: {
      type: String,
      maxlength: 255,
    },
    status: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.REQUESTED,
    },
    mpesaConversationId: String,
    mpesaOriginatorConversationId: String,
    mpesaTransactionId: String,
    mpesaResponseDescription: String,
    failureReason: String,
  },
  {
    timestamps: true,
  }
);

PayoutSchema.index({ farmer: 1, createdAt: -1 });
PayoutSchema.index({ mpesaOriginatorConversationId: 1 });

export const Payout = mongoose.model<IPayout>('Payout', PayoutSchema);


