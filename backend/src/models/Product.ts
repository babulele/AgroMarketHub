import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  farmer: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string; // kg, piece, bunch, etc.
  images: string[];
  inventory: {
    quantity: number;
    available: boolean;
  };
  location: {
    county: string;
    subCounty: string;
  };
  isActive: boolean;
  views: number;
  cartAdditions: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      default: 'kg',
    },
    images: [
      {
        type: String,
      },
    ],
    inventory: {
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
      available: {
        type: Boolean,
        default: true,
      },
    },
    location: {
      county: {
        type: String,
        required: true,
      },
      subCounty: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    cartAdditions: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProductSchema.index({ farmer: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ 'location.county': 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isActive: 1, 'inventory.available': 1 });
ProductSchema.index({ views: -1 });
ProductSchema.index({ cartAdditions: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

