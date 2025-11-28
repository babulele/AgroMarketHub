export enum UserRole {
  FARMER = 'farmer',
  BUYER = 'buyer',
  RIDER = 'rider',
  ADMIN = 'admin',
  COUNTY_OFFICER = 'county_officer',
  NGO = 'ngo',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  farmLocation?: {
    county: string;
    subCounty: string;
  };
  verificationStatus?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  images: string[];
  inventory: {
    quantity: number;
    available: boolean;
  };
  location: {
    county: string;
    subCounty: string;
  };
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  averageRating?: number;
  totalReviews?: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  payment: {
    status: string;
    mpesaTransactionId?: string;
  };
  delivery: {
    address: string;
    county: string;
    subCounty: string;
  };
  createdAt: string;
}

export interface OrderItem {
  product: string;
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Review {
  _id: string;
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  product: string | Product;
  farmer: string;
  order: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface FarmerProfileStats {
  totalProducts: number;
  totalInventory: number;
  averagePrice: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface FarmerPublicProfile {
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    farmLocation?: {
      county: string;
      subCounty: string;
    };
    verificationStatus?: string;
    createdAt?: string;
  };
  stats: FarmerProfileStats;
  products: Product[];
  recentReviews: Array<{
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    buyer?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    product?: {
      _id?: string;
      name: string;
      images?: string[];
      price?: number;
      unit?: string;
    };
  }>;
}

export type PayoutStatus = 'requested' | 'processing' | 'completed' | 'failed';

export interface Payout {
  _id: string;
  farmer: string;
  phoneNumber: string;
  amount: number;
  remarks?: string;
  status: PayoutStatus;
  mpesaTransactionId?: string;
  mpesaResponseDescription?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AuctionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export interface Bid {
  _id: string;
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  auction: string | Auction;
  amount: number;
  quantity: number;
  submittedAt: string;
  isWinning: boolean;
}

export interface Auction {
  _id: string;
  farmer: {
    _id: string;
    firstName: string;
    lastName: string;
    farmLocation?: {
      county: string;
      subCounty: string;
    };
  };
  product: {
    _id: string;
    name: string;
    category: string;
    images: string[];
  } | string;
  title: string;
  description: string;
  startingPrice: number;
  reservePrice?: number;
  currentHighestBid?: number;
  quantity: number;
  unit: string;
  status: AuctionStatus;
  startDate: string;
  endDate: string;
  bids?: Bid[];
  winningBid?: Bid;
  winningBuyer?: string;
  images: string[];
  location: {
    county: string;
    subCounty: string;
  };
  minimumBidIncrement: number;
  createdAt: string;
  updatedAt: string;
}

