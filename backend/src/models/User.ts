import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  FARMER = 'farmer',
  BUYER = 'buyer',
  RIDER = 'rider',
  ADMIN = 'admin',
  COUNTY_OFFICER = 'county_officer',
  NGO = 'ngo',
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Farmer specific fields
  farmLocation?: {
    county: string;
    subCounty: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  idDocument?: {
    url: string;
    uploadedAt: Date;
  };
  verificationStatus?: VerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  
  // Rider specific fields
  vehicleType?: string;
  licenseNumber?: string;
  isAvailable?: boolean;
  
  // Organization fields (NGO, County Officer)
  organizationName?: string;
  organizationType?: string;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    farmLocation: {
      county: String,
      subCounty: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    idDocument: {
      url: String,
      uploadedAt: Date,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    vehicleType: String,
    licenseNumber: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    organizationName: String,
    organizationType: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true }); // Email must be unique
UserSchema.index({ role: 1 });
UserSchema.index({ verificationStatus: 1 });
UserSchema.index({ 'farmLocation.county': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);

