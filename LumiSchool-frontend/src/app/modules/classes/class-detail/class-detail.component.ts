import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import {
  SchoolClass,
  Stream,
  PopulatedUser,
} from "../../../shared/interfaces/models";
import { ThemeService } from "../../../shared/services/theme/theme.service";

@Component({
  selector: "app-class-detail",
  templateUrl: "./class-detail.component.html",
  styleUrls: ["./class-detail.component.scss"],
})
export class ClassDetailComponent implements OnInit {
  schoolClass: SchoolClass | null = null;
  loading = true;

  streams: Stream[] = [];
  loadingStreams = false;
  showAddStream = false;
  newStreamName = "";
  newStreamCapacity: number | null = null;
  savingStream = false;
  streamError = "";

  constructor(
    private classesService: ClassesService,
    private route: ActivatedRoute,
    private router: Router,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.classesService.getById(id).subscribe({
        next: (res) => {
          this.schoolClass = res.data;
          this.loading = false;
          this.loadStreams(id);
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  loadStreams(classId: string): void {
    this.loadingStreams = true;
    this.classesService.getStreams(classId).subscribe({
      next: (res) => {
        this.streams = res.data || [];
        this.loadingStreams = false;
      },
      error: () => {
        this.loadingStreams = false;
      },
    });
  }

  toggleAddStream(): void {
    this.showAddStream = !this.showAddStream;
    this.newStreamName = "";
    this.newStreamCapacity = null;
    this.streamError = "";
  }

  saveStream(): void {
    if (!this.schoolClass || !this.newStreamName.trim()) {
      this.streamError = "Stream name is required.";
      return;
    }
    this.savingStream = true;
    this.streamError = "";
    const payload: { classId: string; name: string; capacity?: number } = {
      classId: this.schoolClass._id,
      name: this.newStreamName.trim(),
    };
    if (this.newStreamCapacity) {
      payload.capacity = this.newStreamCapacity;
    }
    this.classesService.createStream(payload).subscribe({
      next: (res) => {
        this.streams.push(res.data);
        this.savingStream = false;
        this.showAddStream = false;
        this.newStreamName = "";
        this.newStreamCapacity = null;
      },
      error: (err) => {
        this.streamError =
          err?.error?.message || "Failed to create stream. Please try again.";
        this.savingStream = false;
      },
    });
  }

  deleteStream(streamId: string): void {
    if (!confirm("Delete this stream?")) return;
    this.classesService.deleteStream(streamId).subscribe({
      next: () => {
        this.streams = this.streams.filter((s) => s._id !== streamId);
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/classes"]);
  }

  editClass(): void {
    if (this.schoolClass) {
      this.router.navigate(["/classes", this.schoolClass._id, "edit"]);
    }
  }

  teacherName(val?: string | PopulatedUser): string {
    if (!val) return "Not assigned";
    if (typeof val === "object") return `${val.firstName} ${val.lastName}`;
    return val;
  }
}
