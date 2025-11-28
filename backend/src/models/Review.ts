import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  buyer: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  farmer: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId; // Reference to the order this review is for
  rating: number; // 1-5 stars
  comment: string;
  images?: string[]; // Optional review images
  isVerified: boolean; // Whether the buyer actually purchased this product
  helpful: number; // Number of helpful votes
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: [
      {
        type: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: true, // Reviews are only allowed for completed orders
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ product: 1 });
ReviewSchema.index({ farmer: 1 });
ReviewSchema.index({ buyer: 1 });
ReviewSchema.index({ order: 1 }, { unique: true }); // One review per order
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

