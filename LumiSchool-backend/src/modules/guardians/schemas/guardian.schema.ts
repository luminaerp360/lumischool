import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type GuardianDocument = Guardian & Document;

export enum Relationship {
  FATHER = "FATHER",
  MOTHER = "MOTHER",
  GRANDFATHER = "GRANDFATHER",
  GRANDMOTHER = "GRANDMOTHER",
  UNCLE = "UNCLE",
  AUNT = "AUNT",
  BROTHER = "BROTHER",
  SISTER = "SISTER",
  GUARDIAN = "GUARDIAN",
  SPONSOR = "SPONSOR",
  OTHER = "OTHER",
}

@Schema({ timestamps: true })
export class Guardian {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  middleName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  alternatePhone: string;

  @Prop()
  email: string;

  @Prop({ trim: true })
  idNumber: string; // National ID / Passport

  @Prop({ type: String, enum: Relationship, default: Relationship.GUARDIAN })
  relationship: Relationship;

  @Prop()
  occupation: string;

  @Prop()
  address: string;

  @Prop()
  county: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Student" }],
    default: [],
  })
  studentIds: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  linkedUserId: MongooseSchema.Types.ObjectId; // Optional parent portal login

  @Prop({ default: true })
  isPrimaryGuardian: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const GuardianSchema = SchemaFactory.createForClass(Guardian);

GuardianSchema.index({ tenantId: 1, phone: 1 });
GuardianSchema.index({ tenantId: 1, idNumber: 1 }, { sparse: true });
GuardianSchema.index({ tenantId: 1, studentIds: 1 });
GuardianSchema.index({ tenantId: 1, lastName: 1, firstName: 1 });
GuardianSchema.index({ tenantId: 1, createdAt: -1 });
