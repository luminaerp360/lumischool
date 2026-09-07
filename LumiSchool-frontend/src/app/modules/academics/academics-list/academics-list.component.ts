import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AcademicsService } from "../../../shared/services/academics/academics.service";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import { UsersService } from "../../../shared/services/users/users.service";
import {
  Subject,
  SubjectAssignment,
  SubjectCategory,
  SchoolLevel,
  SchoolClass,
  Stream,
  LumiSchoolUser,
} from "../../../shared/interfaces/models";

@Component({
  selector: "app-academics-list",
  templateUrl: "./academics-list.component.html",
  styleUrls: ["./academics-list.component.scss"],
})
export class AcademicsListComponent implements OnInit {
  tab: "subjects" | "assignments" = "subjects";

  // ── Subjects ──
  subjects: Subject[] = [];
  subjectsLoading = false;
  search = "";
  filterCategory = "";
  filterLevel = "";

  // ── Assignments ──
  assignments: SubjectAssignment[] = [];
  assignmentsLoading = false;
  filterAssignClass = "";
  filterAssignTeacher = "";
  filterAssignYear = "";

  // ── Create Assignment Modal ──
  showAssignModal = false;
  assignForm!: FormGroup;
  savingAssign = false;
  assignError = "";
  classes: SchoolClass[] = [];
  classesLoading = false;
  streams: Stream[] = [];
  streamsLoading = false;
  teachers: LumiSchoolUser[] = [];
  teachersLoading = false;
  allSubjects: Subject[] = [];

  readonly currentYear = new Date().getFullYear().toString();

  readonly categories: { value: SubjectCategory | ""; label: string }[] = [
    { value: "", label: "All Categories" },
    { value: "CORE", label: "Core" },
    { value: "ELECTIVE", label: "Elective" },
    { value: "OPTIONAL", label: "Optional" },
    { value: "CO_CURRICULAR", label: "Co-curricular" },
  ];

  readonly levels: { value: SchoolLevel | ""; label: string }[] = [
    { value: "", label: "All Levels" },
    { value: "PRE_PRIMARY", label: "Pre-Primary (PP1–PP2)" },
    { value: "PRIMARY", label: "Primary (Grade 1–6)" },
    { value: "JSS", label: "Junior Secondary (Grade 7–9)" },
    { value: "SENIOR", label: "Senior Secondary (Grade 10–12)" },
  ];

  constructor(
    private academicsService: AcademicsService,
    private classesService: ClassesService,
    private usersService: UsersService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.assignForm = this.fb.group({
      teacherId: ["", Validators.required],
      subjectId: ["", Validators.required],
      classId: ["", Validators.required],
      streamId: [""],
      academicYear: [this.currentYear, Validators.required],
    });
    this.assignForm.get("classId")!.valueChanges.subscribe((cid) => {
      this.assignForm.get("streamId")!.setValue("");
      this.streams = [];
      if (cid) this.loadStreams(cid);
    });
    this.loadSubjects();
  }

  switchTab(t: "subjects" | "assignments"): void {
    this.tab = t;
    if (t === "assignments") this.loadAssignments();
  }

  // ── Subjects ──
  loadSubjects(): void {
    this.subjectsLoading = true;
    const params: Record<string, any> = {};
    if (this.search) params["search"] = this.search;
    if (this.filterCategory) params["category"] = this.filterCategory;
    if (this.filterLevel) params["level"] = this.filterLevel;
    this.academicsService.getSubjects(params).subscribe({
      next: (res) => {
        const raw = (res.data as any).data ?? res.data;
        this.subjects = Array.isArray(raw) ? raw : [];
        this.subjectsLoading = false;
      },
      error: () => {
        this.subjectsLoading = false;
      },
    });
  }

  addSubject(): void {
    this.router.navigate(["/academics/new"]);
  }

  editSubject(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(["/academics", id, "edit"]);
  }

  // ── Assignments ──
  loadAssignments(): void {
    this.assignmentsLoading = true;
    const params: Record<string, any> = {};
    if (this.filterAssignClass) params["classId"] = this.filterAssignClass;
    if (this.filterAssignTeacher)
      params["teacherId"] = this.filterAssignTeacher;
    if (this.filterAssignYear) params["academicYear"] = this.filterAssignYear;
    this.academicsService.getAssignments(params).subscribe({
      next: (res) => {
        const raw = (res.data as any).data ?? res.data;
        this.assignments = Array.isArray(raw) ? raw : [];
        this.assignmentsLoading = false;
      },
      error: () => {
        this.assignmentsLoading = false;
      },
    });
  }

  openAssignModal(): void {
    this.assignForm.reset({ academicYear: this.currentYear });
    this.assignError = "";
    this.streams = [];
    this.showAssignModal = true;

    // Load lookup data (parallelize)
    if (!this.classes.length) {
      this.classesLoading = true;
      this.classesService.getAll({ limit: 200 }).subscribe({
        next: (r) => {
          const raw = (r.data as any).data ?? r.data;
          this.classes = Array.isArray(raw) ? raw : [];
          this.classesLoading = false;
        },
        error: () => {
          this.classesLoading = false;
        },
      });
    }
    if (!this.teachers.length) {
      this.teachersLoading = true;
      this.usersService.getAll({ role: "TEACHER", limit: 200 }).subscribe({
        next: (r) => {
          const raw = (r.data as any).data ?? r.data;
          this.teachers = Array.isArray(raw) ? raw : [];
          this.teachersLoading = false;
        },
        error: () => {
          this.teachersLoading = false;
        },
      });
    }
    if (!this.allSubjects.length) {
      this.academicsService.getSubjects({ limit: 200 }).subscribe({
        next: (r) => {
          const raw = (r.data as any).data ?? r.data;
          this.allSubjects = Array.isArray(raw) ? raw : [];
        },
      });
    }
  }

  loadStreams(classId: string): void {
    this.streamsLoading = true;
    this.classesService.getStreams(classId).subscribe({
      next: (r) => {
        const raw = (r.data as any).data ?? r.data;
        this.streams = Array.isArray(raw) ? raw : [];
        this.streamsLoading = false;
      },
      error: () => {
        this.streamsLoading = false;
      },
    });
  }

  submitAssignment(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }
    this.savingAssign = true;
    this.assignError = "";
    const v = this.assignForm.value;
    const payload: any = {
      teacherId: v.teacherId,
      subjectId: v.subjectId,
      classId: v.classId,
      academicYear: v.academicYear,
    };
    if (v.streamId) payload.streamId = v.streamId;
    this.academicsService.createAssignment(payload).subscribe({
      next: () => {
        this.showAssignModal = false;
        this.savingAssign = false;
        this.loadAssignments();
      },
      error: (err) => {
        this.assignError = err?.error?.message ?? "Failed to save assignment.";
        this.savingAssign = false;
      },
    });
  }

  deleteAssignment(a: SubjectAssignment): void {
    const subjectName = this.subjectName(a);
    const teacherN = this.teacherName(a);
    if (!confirm(`Remove "${subjectName}" assignment from ${teacherN}?`))
      return;
    this.academicsService.deleteAssignment(a._id).subscribe({
      next: () => this.loadAssignments(),
    });
  }

  // ── Display helpers ──
  subjectName(a: SubjectAssignment): string {
    const s = a.subjectId as any;
    return s && typeof s === "object" ? s.name : String(s ?? "—");
  }

  subjectCode(a: SubjectAssignment): string {
    const s = a.subjectId as any;
    return s && typeof s === "object" ? s.code : "";
  }

  teacherName(a: SubjectAssignment): string {
    const t = a.teacherId as any;
    if (t && typeof t === "object")
      return `${t.firstName} ${t.lastName}`.trim();
    return String(t ?? "—");
  }

  className(a: SubjectAssignment): string {
    const c = a.classId as any;
    return c && typeof c === "object" ? c.name : String(c ?? "—");
  }

  streamName(a: SubjectAssignment): string {
    const s = a.streamId as any;
    if (!s) return "All streams";
    return s && typeof s === "object" ? s.name : String(s);
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      CORE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      ELECTIVE:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      OPTIONAL:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      CO_CURRICULAR:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return map[category] || "";
  }

  levelLabel(level: string): string {
    const map: Record<string, string> = {
      PRE_PRIMARY: "Pre-Primary",
      PRIMARY: "Primary",
      JSS: "JSS (7–9)",
      SENIOR: "Senior (10–12)",
    };
    return map[level] || level;
  }

  // Kept for backward compat alias
  load(): void {
    this.loadSubjects();
  }
}
