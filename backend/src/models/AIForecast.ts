import mongoose, { Document, Schema } from 'mongoose';

export interface IForecastData {
  crop: string;
  demand: number;
  confidence: number;
  priceRecommendation?: number;
  region?: string;
}

export interface IAIForecast extends Document {
  forecastDate: Date;
  forecastType: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  scope: 'nationwide' | 'county' | 'subcounty';
  region?: {
    county?: string;
    subCounty?: string;
  };
  forecasts: IForecastData[];
  modelVersion: string;
  dataSources: string[];
  isOverridden: boolean;
  overrideBy?: mongoose.Types.ObjectId;
  overrideAt?: Date;
  overrideReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIForecastSchema = new Schema<IAIForecast>(
  {
    forecastDate: {
      type: Date,
      required: true,
    },
    forecastType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'seasonal'],
      required: true,
    },
    scope: {
      type: String,
      enum: ['nationwide', 'county', 'subcounty'],
      default: 'nationwide',
    },
    region: {
      county: String,
      subCounty: String,
    },
    forecasts: [
      {
        crop: {
          type: String,
          required: true,
        },
        demand: {
          type: Number,
          required: true,
        },
        confidence: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        priceRecommendation: Number,
        region: String,
      },
    ],
    modelVersion: {
      type: String,
      required: true,
    },
    dataSources: [String],
    isOverridden: {
      type: Boolean,
      default: false,
    },
    overrideBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    overrideAt: Date,
    overrideReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
AIForecastSchema.index({ forecastDate: -1 });
AIForecastSchema.index({ forecastType: 1 });
AIForecastSchema.index({ scope: 1 });
AIForecastSchema.index({ 'region.county': 1 });
AIForecastSchema.index({ isOverridden: 1 });

export const AIForecast = mongoose.model<IAIForecast>('AIForecast', AIForecastSchema);

