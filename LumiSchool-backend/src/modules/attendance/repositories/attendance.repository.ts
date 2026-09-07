import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import { Attendance, AttendanceDocument } from "../schemas/attendance.schema";

@Injectable()
export class AttendanceRepository {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
  ) {}

  async bulkUpsert(records: Partial<Attendance>[]): Promise<number> {
    const ops = records.map((r) => ({
      updateOne: {
        filter: {
          tenantId: r.tenantId,
          studentId: r.studentId,
          date: r.date,
          session: r.session,
        },
        update: { $set: r },
        upsert: true,
      },
    }));
    const result = await this.attendanceModel.bulkWrite(ops);
    return result.upsertedCount + result.modifiedCount;
  }

  async findAll(
    filter: FilterQuery<AttendanceDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ data: AttendanceDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      this.attendanceModel
        .find(filter)
        .populate("studentId", "firstName lastName admissionNumber")
        .populate("markedById", "firstName lastName")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.attendanceModel.countDocuments(filter).exec(),
    ]);
    return { data, total };
  }

  async findByClassAndDate(
    tenantId: string,
    classId: string,
    date: Date,
    session?: string,
  ): Promise<AttendanceDocument[]> {
    const filter: FilterQuery<AttendanceDocument> = {
      tenantId,
      classId,
      date,
    };
    if (session) filter.session = session;

    return this.attendanceModel
      .find(filter)
      .populate("studentId", "firstName lastName admissionNumber")
      .sort({ "studentId.lastName": 1 })
      .exec();
  }

  async getStudentAttendanceSummary(
    tenantId: string,
    studentId: string,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<any[]> {
    return this.attendanceModel.aggregate([
      {
        $match: {
          tenantId: { $eq: tenantId },
          studentId: { $eq: studentId },
          date: { $gte: dateFrom, $lte: dateTo },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getClassAttendanceSummary(
    tenantId: string,
    classId: string,
    date: Date,
  ): Promise<any[]> {
    return this.attendanceModel.aggregate([
      {
        $match: {
          tenantId: { $eq: tenantId },
          classId: { $eq: classId },
          date: { $eq: date },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
