import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export enum SchoolType {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
  COLLEGE = "COLLEGE",
  MIXED = "MIXED",
}

export enum SubscriptionPlan {
  FREE = "FREE",
  BASIC = "BASIC",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
}

export enum SmsProvider {
  AFRICASTALKING = "AFRICASTALKING",
  TWILIO = "TWILIO",
}

export enum Term {
  TERM_1 = "TERM_1",
  TERM_2 = "TERM_2",
  TERM_3 = "TERM_3",
}

export class TenantSettings {
  smsProvider: SmsProvider;
  enableRanking: boolean;
  enableBoarding: boolean;
  enableTransport: boolean;
  academicYear: string;
  currentTerm: Term;
  admissionNumberPrefix: string;
  admissionNumberNext: number;
}

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ type: String, enum: SchoolType, required: true })
  schoolType: SchoolType;

  @Prop({ required: true })
  county: string;

  @Prop()
  subCounty: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  logoUrl: string;

  @Prop({
    type: String,
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  subscriptionPlan: SubscriptionPlan;

  @Prop()
  subscriptionExpiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: {
      smsProvider: {
        type: String,
        enum: SmsProvider,
        default: SmsProvider.AFRICASTALKING,
      },
      enableRanking: { type: Boolean, default: false },
      enableBoarding: { type: Boolean, default: false },
      enableTransport: { type: Boolean, default: false },
      academicYear: { type: String },
      currentTerm: { type: String, enum: Term },
      admissionNumberPrefix: { type: String, default: "" },
      admissionNumberNext: { type: Number, default: 1000 },
    },
    default: {
      smsProvider: SmsProvider.AFRICASTALKING,
      enableRanking: false,
      enableBoarding: false,
      enableTransport: false,
      academicYear: new Date().getFullYear().toString(),
      currentTerm: Term.TERM_1,
      admissionNumberPrefix: "",
      admissionNumberNext: 1000,
    },
  })
  settings: TenantSettings;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Indexes
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ isActive: 1 });
TenantSchema.index({ subscriptionPlan: 1 });
TenantSchema.index({ county: 1 });
