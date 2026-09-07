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
      next: (res) => {
        this.classes = res.data;
      },
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    const params: any = { date: this.selectedDate };
    if (this.selectedClassId) params.classId = this.selectedClassId;
    this.attendanceService.getAll(params).subscribe({
      next: (res) => {
        this.records = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PRESENT:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      ABSENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      LATE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      EXCUSED:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return map[status] || "";
  }
}
