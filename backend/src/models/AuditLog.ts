import mongoose, { Document, Schema } from 'mongoose';

export enum AuditAction {
  AI_FORECAST_OVERRIDE = 'ai_forecast_override',
  AI_CONFIDENCE_ADJUST = 'ai_confidence_adjust',
  FARMER_VERIFICATION = 'farmer_verification',
  DISPUTE_RESOLUTION = 'dispute_resolution',
  PRODUCT_MODERATION = 'product_moderation',
  USER_MODERATION = 'user_moderation',
}

export interface IAuditLog extends Document {
  action: AuditAction;
  performedBy: mongoose.Types.ObjectId;
  targetType: string; // 'forecast', 'user', 'product', 'dispute', etc.
  targetId: mongoose.Types.ObjectId;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    reason: String,
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

