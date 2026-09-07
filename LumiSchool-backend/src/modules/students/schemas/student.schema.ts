import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { SchoolLevel } from "../../../common/enums/school-level.enum";
import { CbcTrack } from "../../../common/enums/cbc-track.enum";
import { SpecialNeedsCategory } from "../../../common/enums/special-needs.enum";

export type StudentDocument = Student & Document;

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  GRADUATED = "GRADUATED",
  TRANSFERRED = "TRANSFERRED",
  SUSPENDED = "SUSPENDED",
  EXPELLED = "EXPELLED",
  DROPPED_OUT = "DROPPED_OUT",
}

export enum BoardingStatus {
  DAY_SCHOLAR = "DAY_SCHOLAR",
  BOARDER = "BOARDER",
}

export enum FeedingProgram {
  NONE = "NONE",
  GOK_FEEDING = "GOK_FEEDING",
  WFP = "WFP",
  SCHOOL_FEEDING = "SCHOOL_FEEDING",
  OTHER = "OTHER",
}

export enum BursaryStatus {
  NOT_APPLICABLE = "NOT_APPLICABLE",
  APPLIED = "APPLIED",
  AWARDED = "AWARDED",
  NOT_AWARDED = "NOT_AWARDED",
}

@Schema({ timestamps: true })
export class Student {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true,
  })
  tenantId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: false, trim: true })
  admissionNumber: string;

  @Prop({ trim: true })
  upiNumber: string;

  @Prop({ trim: true })
  nemisNumber: string;

  @Prop({ trim: true })
  nhifNumber: string;

  @Prop({ trim: true })
  birthCertificateNumber: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  middleName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, type: Date })
  dateOfBirth: Date;

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender;

  @Prop({ type: String, enum: SchoolLevel, required: true })
  currentLevel: SchoolLevel;

  @Prop({ required: true })
  currentGrade: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Class" })
  currentClassId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Stream" })
  currentStreamId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: CbcTrack })
  cbcTrack: CbcTrack;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Subject" }],
    default: [],
  })
  subjectIds: MongooseSchema.Types.ObjectId[];

  @Prop({ type: String, enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Prop({
    type: String,
    enum: BoardingStatus,
    default: BoardingStatus.DAY_SCHOLAR,
  })
  boardingStatus: BoardingStatus;

  @Prop({ type: Date })
  admissionDate: Date;

  @Prop()
  previousSchool: string;

  @Prop()
  previousSchoolGrade: string;

  @Prop()
  previousSchoolLevel: string;

  @Prop()
  transferLetterRef: string;

  @Prop()
  nationality: string;

  @Prop()
  county: string;

  @Prop()
  subCounty: string;

  @Prop()
  constituency: string;

  @Prop()
  ward: string;

  @Prop()
  village: string;

  @Prop()
  postalAddress: string;

  @Prop()
  religion: string;

  @Prop({ type: Object })
  medicalInfo: {
    bloodGroup?: string;
    allergies?: string[];
    conditions?: string[];
    chronicIllness?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
    physicalFitnessRef?: string;
  };

  @Prop({ type: Object })
  immunization: {
    polio?: { status: boolean; date?: Date };
    measles?: { status: boolean; date?: Date };
    dpt?: { status: boolean; date?: Date };
    bcg?: { status: boolean; date?: Date };
    hepatitisB?: { status: boolean; date?: Date };
    hpv?: { status: boolean; date?: Date };
    covid19?: { status: boolean; date?: Date };
    yellowFever?: { status: boolean; date?: Date };
    tetanus?: { status: boolean; date?: Date };
  };

  @Prop()
  photo: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Guardian" }],
    default: [],
  })
  guardianIds: MongooseSchema.Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  linkedUserId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: SpecialNeedsCategory,
    default: SpecialNeedsCategory.NONE,
  })
  specialNeedsCategory: SpecialNeedsCategory;

  @Prop()
  specialNeeds: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  householdInfo: {
    siblingCount?: number;
    birthOrder?: number;
    isOrphan?: boolean;
    isPartialOrphan?: boolean;
    isSingleParent?: boolean;
    parentOccupation?: string;
    parentIncomeBracket?: string;
  };

  @Prop({
    type: String,
    enum: FeedingProgram,
    default: FeedingProgram.NONE,
  })
  feedingProgram: FeedingProgram;

  @Prop({
    type: String,
    enum: BursaryStatus,
    default: BursaryStatus.NOT_APPLICABLE,
  })
  bursaryStatus: BursaryStatus;

  @Prop()
  bursarySource: string;

  @Prop({ type: Object })
  transport: {
    needsTransport?: boolean;
    route?: string;
    pickupPoint?: string;
    transportFee?: number;
  };

  @Prop({
    type: [{ name: String, description: String, joinedDate: Date }],
    default: [],
  })
  extracurricular: { name: string; description?: string; joinedDate?: Date }[];

  @Prop()
  lastPromotionDate: Date;

  @Prop()
  lastPromotionAcademicYear: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);

StudentSchema.index({ tenantId: 1, admissionNumber: 1 }, { unique: true });
StudentSchema.index({ tenantId: 1, upiNumber: 1 }, { sparse: true });
StudentSchema.index({ tenantId: 1, nemisNumber: 1 }, { sparse: true });
StudentSchema.index({ tenantId: 1, nhifNumber: 1 }, { sparse: true });
StudentSchema.index({ tenantId: 1, birthCertificateNumber: 1 }, { sparse: true });
StudentSchema.index({ tenantId: 1, currentClassId: 1 });
StudentSchema.index({ tenantId: 1, status: 1 });
StudentSchema.index({ tenantId: 1, currentLevel: 1, currentGrade: 1 });
StudentSchema.index({ tenantId: 1, lastName: 1, firstName: 1 });
StudentSchema.index({ tenantId: 1, createdAt: -1 });
StudentSchema.index({ tenantId: 1, cbcTrack: 1 });
StudentSchema.index({ tenantId: 1, specialNeedsCategory: 1 });
StudentSchema.index({ tenantId: 1, feedingProgram: 1 });
StudentSchema.index({ tenantId: 1, bursaryStatus: 1 });
