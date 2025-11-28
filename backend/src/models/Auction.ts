import mongoose, { Document, Schema } from 'mongoose';

export enum AuctionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export interface IBid extends Document {
  buyer: mongoose.Types.ObjectId;
  auction: mongoose.Types.ObjectId;
  amount: number;
  quantity: number;
  submittedAt: Date;
  isWinning: boolean;
}

export interface IAuction extends Document {
  farmer: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  title: string;
  description: string;
  startingPrice: number;
  reservePrice?: number; // Minimum price farmer will accept
  currentHighestBid?: number;
  quantity: number; // Total quantity available for auction
  unit: string;
  status: AuctionStatus;
  startDate: Date;
  endDate: Date;
  bids: mongoose.Types.ObjectId[];
  winningBid?: mongoose.Types.ObjectId;
  winningBuyer?: mongoose.Types.ObjectId;
  images: string[];
  location: {
    county: string;
    subCounty: string;
  };
  minimumBidIncrement: number; // Minimum amount by which a bid must exceed the current highest bid
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    auction: {
      type: Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isWinning: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const AuctionSchema = new Schema<IAuction>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    reservePrice: {
      type: Number,
      min: 0,
    },
    currentHighestBid: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
      default: 'kg',
    },
    status: {
      type: String,
      enum: Object.values(AuctionStatus),
      default: AuctionStatus.DRAFT,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    bids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Bid',
      },
    ],
    winningBid: {
      type: Schema.Types.ObjectId,
      ref: 'Bid',
    },
    winningBuyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    images: [
      {
        type: String,
      },
    ],
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
    minimumBidIncrement: {
      type: Number,
      default: 50, // KES 50 minimum increment
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AuctionSchema.index({ farmer: 1 });
AuctionSchema.index({ product: 1 });
AuctionSchema.index({ status: 1 });
AuctionSchema.index({ startDate: 1, endDate: 1 });
AuctionSchema.index({ 'location.county': 1 });
AuctionSchema.index({ createdAt: -1 });

BidSchema.index({ auction: 1 });
BidSchema.index({ buyer: 1 });
BidSchema.index({ submittedAt: -1 });

export const Bid = mongoose.model<IBid>('Bid', BidSchema);
export const Auction = mongoose.model<IAuction>('Auction', AuctionSchema);


