// ─── Enums ─── //
export type Role =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "PRINCIPAL"
  | "BURSAR"
  | "TEACHER"
  | "PARENT"
  | "STUDENT";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type StudentStatus =
  | "ACTIVE"
  | "GRADUATED"
  | "TRANSFERRED"
  | "SUSPENDED"
  | "EXPELLED"
  | "DROPPED_OUT";
export type BoardingStatus = "DAY_SCHOLAR" | "BOARDER";
export type SchoolLevel = "PRE_PRIMARY" | "PRIMARY" | "JSS" | "SENIOR";
export type Relationship =
  | "FATHER"
  | "MOTHER"
  | "GRANDFATHER"
  | "GRANDMOTHER"
  | "UNCLE"
  | "AUNT"
  | "BROTHER"
  | "SISTER"
  | "GUARDIAN"
  | "SPONSOR"
  | "OTHER";
export type SubjectCategory =
  | "CORE"
  | "ELECTIVE"
  | "OPTIONAL"
  | "CO_CURRICULAR";
export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "EXCUSED"
  | "HALF_DAY";
export type AttendanceSession = "MORNING" | "AFTERNOON" | "FULL_DAY";
export type FeeCategory =
  | "TUITION"
  | "BOARDING"
  | "TRANSPORT"
  | "UNIFORM"
  | "BOOKS"
  | "EXAM"
  | "ACTIVITY"
  | "LUNCH"
  | "DEVELOPMENT"
  | "OTHER";
export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
export type PaymentMethod =
  | "MPESA"
  | "BANK_TRANSFER"
  | "CASH"
  | "CHEQUE"
  | "BURSARY"
  | "SCHOLARSHIP";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
export type ExamType =
  | "CAT"
  | "MID_TERM"
  | "END_TERM"
  | "MOCK"
  | "NATIONAL"
  | "ASSIGNMENT";
export type AnnouncementAudience =
  | "ALL"
  | "STAFF"
  | "TEACHERS"
  | "PARENTS"
  | "STUDENTS"
  | "CLASS";
export type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type CbcTrack = "STEM" | "SOCIAL_SCIENCES" | "ARTS_AND_SPORTS";
export type SpecialNeedsCategory =
  | "NONE"
  | "PHYSICAL_DISABILITY"
  | "VISUAL_IMPAIRMENT"
  | "HEARING_IMPAIRMENT"
  | "INTELLECTUAL_DISABILITY"
  | "LEARNING_DISABILITY"
  | "SPEECH_AND_LANGUAGE"
  | "AUTISM"
  | "MULTIPLE_DISABILITIES"
  | "OTHER";
export type FeedingProgram = "NONE" | "GOK_FEEDING" | "WFP" | "SCHOOL_FEEDING" | "OTHER";
export type BursaryStatus = "NOT_APPLICABLE" | "APPLIED" | "AWARDED" | "NOT_AWARDED";

// ─── Students ─── //
export interface Student {
  _id: string;
  tenantId: string;
  admissionNumber: string;
  upiNumber?: string;
  nemisNumber?: string;
  nhifNumber?: string;
  birthCertificateNumber?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  currentLevel: SchoolLevel;
  currentGrade: number;
  currentClassId?: string;
  currentStreamId?: string;
  cbcTrack?: CbcTrack;
  subjectIds?: string[];
  status: StudentStatus;
  boardingStatus: BoardingStatus;
  admissionDate?: string;
  previousSchool?: string;
  previousSchoolGrade?: string;
  previousSchoolLevel?: string;
  transferLetterRef?: string;
  nationality?: string;
  county?: string;
  subCounty?: string;
  constituency?: string;
  ward?: string;
  village?: string;
  postalAddress?: string;
  religion?: string;
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string[];
    conditions?: string[];
    chronicIllness?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
    physicalFitnessRef?: string;
  };
  immunization?: {
    polio?: { status: boolean; date?: string };
    measles?: { status: boolean; date?: string };
    dpt?: { status: boolean; date?: string };
    bcg?: { status: boolean; date?: string };
    hepatitisB?: { status: boolean; date?: string };
    hpv?: { status: boolean; date?: string };
    covid19?: { status: boolean; date?: string };
    yellowFever?: { status: boolean; date?: string };
    tetanus?: { status: boolean; date?: string };
  };
  photo?: string;
  guardianIds: string[];
  specialNeedsCategory?: SpecialNeedsCategory;
  specialNeeds?: string;
  isActive: boolean;
  householdInfo?: {
    siblingCount?: number;
    birthOrder?: number;
    isOrphan?: boolean;
    isPartialOrphan?: boolean;
    isSingleParent?: boolean;
    parentOccupation?: string;
    parentIncomeBracket?: string;
  };
  feedingProgram?: FeedingProgram;
  bursaryStatus?: BursaryStatus;
  bursarySource?: string;
  transport?: {
    needsTransport?: boolean;
    route?: string;
    pickupPoint?: string;
    transportFee?: number;
  };
  extracurricular?: { name: string; description?: string; joinedDate?: string }[];
  lastPromotionDate?: string;
  lastPromotionAcademicYear?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Guardians ─── //
export interface PopulatedStudent {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  admissionNumber?: string;
}

export interface Guardian {
  _id: string;
  tenantId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  idNumber?: string;
  relationship: Relationship;
  occupation?: string;
  address?: string;
  county?: string;
  studentIds: string[] | PopulatedStudent[];
  isPrimaryGuardian: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// New class types
export type ClassCategory = "REGULAR" | "SPECIAL_NEEDS_UNIT" | "MULTI_GRADE" | "ADULT_EDUCATION";
export type ClassStatus = "ACTIVE" | "FULL" | "MERGED" | "ARCHIVED" | "PROVISIONAL";

// ─── Classes & Streams ─── //
export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface SchoolClass {
  _id: string;
  tenantId: string;
  name: string;
  level: SchoolLevel;
  grade: number;
  academicYear: string;
  classTeacherId?: string | PopulatedUser;
  assistantTeacherId?: string | PopulatedUser;
  capacity: number;
  room?: string;
  block?: string;
  category: ClassCategory;
  status: ClassStatus;
  isExamCenter: boolean;
  cbcTrack?: CbcTrack;
  isMultiGrade: boolean;
  streamIds: string[] | Stream[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stream {
  _id: string;
  tenantId: string;
  classId: string;
  name: string;
  code?: string;
  streamTeacherId?: string;
  capacity: number;
  room?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Academics ─── //
export interface Subject {
  _id: string;
  tenantId: string;
  name: string;
  code: string;
  category: SubjectCategory;
  applicableLevels: SchoolLevel[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectAssignment {
  _id: string;
  tenantId: string;
  subjectId: string | { _id: string; name: string; code: string };
  teacherId: string | { _id: string; firstName: string; lastName: string };
  classId:
    | string
    | { _id: string; name: string; level: SchoolLevel; grade: number };
  streamId?: string | { _id: string; name: string };
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Staff / Teachers ─── //
export interface StaffUser {
  _id: string;
  tenantId?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Attendance ─── //
export interface Attendance {
  _id: string;
  tenantId: string;
  studentId: string;
  classId: string;
  streamId?: string;
  date: string;
  status: AttendanceStatus;
  session: AttendanceSession;
  reason?: string;
  markedById?: string;
  academicYear?: string;
  term?: string;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Finance ─── //
export interface FeeStructure {
  _id: string;
  tenantId: string;
  name: string;
  academicYear: string;
  term: string;
  level: SchoolLevel;
  grade?: number;
  items: {
    category: FeeCategory;
    description: string;
    amount: number;
    isOptional: boolean;
  }[];
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeInvoice {
  _id: string;
  tenantId: string;
  invoiceNumber: string;
  studentId: string;
  feeStructureId?: string;
  academicYear: string;
  term: string;
  items: {
    category: FeeCategory;
    description: string;
    amount: number;
    isOptional?: boolean;
  }[];
  totalAmount: number;
  paidAmount: number;
  balance: number;
  discount: number;
  discountReason?: string;
  dueDate?: string;
  status: InvoiceStatus;
  generatedById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeePayment {
  _id: string;
  tenantId: string;
  receiptNumber: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  mpesaTransactionId?: string;
  mpesaPhoneNumber?: string;
  bankReference?: string;
  chequeNumber?: string;
  paymentDate: string;
  description?: string;
  receivedById?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Exams ─── //
export interface Exam {
  _id: string;
  tenantId: string;
  name: string;
  type: ExamType;
  academicYear: string;
  term: string;
  startDate?: string;
  endDate?: string;
  classIds: string[];
  subjectIds: string[];
  totalMarks: number;
  isPublished: boolean;
  isActive: boolean;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamResult {
  _id: string;
  tenantId: string;
  examId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  marksObtained: number;
  totalMarks: number;
  percentage?: number;
  grade?: string;
  points?: number;
  remarks?: string;
  teacherComments?: string;
  gradedById?: string;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Communication ─── //
export interface Announcement {
  _id: string;
  tenantId: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  classId?: string;
  priority: AnnouncementPriority;
  sendSms: boolean;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  tenantId: string;
  senderId:
    | string
    | { _id: string; firstName: string; lastName: string; email?: string };
  recipientId:
    | string
    | { _id: string; firstName: string; lastName: string; email?: string };
  subject: string;
  body: string;
  status: "SENT" | "DELIVERED" | "READ";
  readAt?: string;
  parentMessageId?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth & Users ─── //
export interface LumiSchoolUser {
  _id: string;
  firstName: string;
  lastName: string;
  /** @deprecated use firstName + lastName */
  name?: string;
  email: string;
  role: Role;
  isActive: boolean;
  phone?: string;
  tenantId?: string;
  tenantIds?: string[];
  activeTenantId?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: LumiSchoolUser;
  };
  message: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── System Tenants (Schools) ─── //
export type TenantPlan = "free" | "basic" | "pro" | "enterprise";

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  isActive: boolean;
  plan: TenantPlan;
  settings: Record<string, any>;
  ownerUserId: string;
  contactEmail: string;
  maxUsers: number;
  maxStudents?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard / Reports ─── //
export interface DashboardStats {
  students: {
    total: number;
    active: number;
    byGender: { male: number; female: number };
  };
  classes: { total: number; streams: number };
  staff: { total: number; teachers: number };
  attendance: { todayRate: number; weeklyRate: number };
  finance: {
    totalFees: number;
    collected: number;
    outstanding: number;
    collectionRate: number;
  };
  guardians: { total: number };
}
