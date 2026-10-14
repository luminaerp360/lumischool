import { Component, OnInit } from "@angular/core";
import { AttendanceService } from "../../../shared/services/attendance/attendance.service";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import { SchoolClass } from "../../../shared/interfaces/models";

@Component({
  selector: "app-attendance-list",
  templateUrl: "./attendance-list.component.html",
  styleUrls: ["./attendance-list.component.scss"],
})
export class AttendanceListComponent implements OnInit {
  records: any[] = [];
  classes: SchoolClass[] = [];
  loading = true;
  selectedClassId = "";
  selectedDate = new Date().toISOString().split("T")[0];

  constructor(
    private attendanceService: AttendanceService,
    private classesService: ClassesService,
  ) {}

  ngOnInit(): void {
    this.classesService.getAll().subscribe({
      next: (res: any) => {
        const data = res.data?.data ?? res.data ?? [];
        this.classes = Array.isArray(data) ? data : [];
      },
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    const params: any = { date: this.selectedDate };
    if (this.selectedClassId) params.classId = this.selectedClassId;
    this.attendanceService.getAll(params).subscribe({
      next: (res: any) => {
        const data = res.data?.data ?? res.data ?? [];
        this.records = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get countTotal(): number {
    return this.records.length;
  }

  get countPresent(): number {
    return this.records.filter((r) => r.status === "PRESENT").length;
  }

  get countAbsent(): number {
    return this.records.filter((r) => r.status === "ABSENT").length;
  }

  get countLate(): number {
    return this.records.filter(
      (r) => r.status === "LATE" || r.status === "EXCUSED",
    ).length;
  }

  get attendanceRate(): number {
    if (!this.records.length) return 0;
    return Math.round((this.countPresent / this.records.length) * 100);
  }

  getStudentName(val: any): string {
    if (!val) return "—";
    if (typeof val === "object") {
      if (val.firstName || val.lastName) {
        return `${val.firstName ?? ""} ${val.lastName ?? ""}`.trim();
      }
      return val.name ?? val._id ?? "—";
    }
    return String(val);
  }

  getStudentAdm(val: any): string {
    if (val && typeof val === "object" && val.admissionNumber) {
      return val.admissionNumber;
    }
    return "";
  }

  getClassName(val: any): string {
    if (!val) return "—";
    if (typeof val === "object") {
      return val.name ?? val._id ?? "—";
    }
    const found = this.classes.find((c) => c._id === val);
    return found ? found.name : String(val);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PRESENT:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
      ABSENT:
        "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
      LATE:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
      EXCUSED:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    };
    return map[status] || "bg-slate-100 text-slate-700";
  }
}
