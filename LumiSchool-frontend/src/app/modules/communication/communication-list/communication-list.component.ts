import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommunicationService } from "../../../shared/services/communication/communication.service";
import { UsersService } from "../../../shared/services/users/users.service";
import {
  Announcement,
  Message,
  LumiSchoolUser,
} from "../../../shared/interfaces/models";

@Component({
  selector: "app-communication-list",
  templateUrl: "./communication-list.component.html",
  styleUrls: ["./communication-list.component.scss"],
})
export class CommunicationListComponent implements OnInit {
  tab: "announcements" | "messages" = "announcements";
  loading = false;

  // ── Announcements ──
  announcements: Announcement[] = [];
  filterAudience = "";
  filterPriority = "";
  filterPublished = "";

  showAnnouncementForm = false;
  editAnnouncementId: string | null = null;
  announcementForm!: FormGroup;
  savingAnnouncement = false;
  announcementError = "";

  // ── Messages ──
  messages: Message[] = [];
  messageFolder: "inbox" | "sent" = "inbox";
  unreadCount = 0;
  selectedMessage: Message | null = null;

  showComposeModal = false;
  composeForm!: FormGroup;
  sendingMessage = false;
  composeError = "";
  users: LumiSchoolUser[] = [];
  userSearch = "";
  loadingUsers = false;

  readonly audiences = [
    { value: "ALL", label: "Everyone" },
    { value: "STAFF", label: "Staff" },
    { value: "TEACHERS", label: "Teachers" },
    { value: "PARENTS", label: "Parents" },
    { value: "STUDENTS", label: "Students" },
    { value: "CLASS", label: "Specific Class" },
  ];

  readonly priorities = [
    { value: "LOW", label: "Low" },
    { value: "NORMAL", label: "Normal" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
  ];

  constructor(
    private communicationService: CommunicationService,
    private usersService: UsersService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.announcementForm = this.fb.group({
      title: ["", Validators.required],
      body: ["", Validators.required],
      audience: ["ALL", Validators.required],
      classId: [null],
      priority: ["NORMAL"],
      sendSms: [false],
      expiresAt: [null],
    });

    this.composeForm = this.fb.group({
      recipientId: ["", Validators.required],
      subject: ["", Validators.required],
      body: ["", Validators.required],
    });

    this.loadAnnouncements();
    this.loadUnreadCount();
  }

  // ── Announcement methods ──

  loadAnnouncements(): void {
    this.loading = true;
    const params: Record<string, any> = {};
    if (this.filterAudience) params["audience"] = this.filterAudience;
    if (this.filterPriority) params["priority"] = this.filterPriority;
    if (this.filterPublished !== "")
      params["isPublished"] = this.filterPublished === "true";
    this.communicationService.getAnnouncements(params).subscribe({
      next: (res) => {
        const raw = (res.data as any).data ?? res.data;
        this.announcements = Array.isArray(raw) ? raw : [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openCreateAnnouncement(): void {
    this.editAnnouncementId = null;
    this.announcementForm.reset({
      audience: "ALL",
      priority: "NORMAL",
      sendSms: false,
    });
    this.announcementError = "";
    this.showAnnouncementForm = true;
  }

  openEditAnnouncement(a: Announcement): void {
    this.editAnnouncementId = a._id;
    this.announcementForm.patchValue({
      title: a.title,
      body: a.body,
      audience: a.audience,
      classId: (a as any).classId ?? null,
      priority: a.priority,
      sendSms: a.sendSms,
      expiresAt: a.expiresAt ? a.expiresAt.split("T")[0] : null,
    });
    this.announcementError = "";
    this.showAnnouncementForm = true;
  }

  submitAnnouncement(): void {
    if (this.announcementForm.invalid) {
      this.announcementForm.markAllAsTouched();
      return;
    }
    this.savingAnnouncement = true;
    this.announcementError = "";
    const val = this.announcementForm.value;
    const payload: any = {
      title: val.title.trim(),
      body: val.body.trim(),
      audience: val.audience,
      priority: val.priority,
      sendSms: !!val.sendSms,
    };
    if (val.classId) payload.classId = val.classId;
    if (val.expiresAt) payload.expiresAt = val.expiresAt;

    const req$ = this.editAnnouncementId
      ? this.communicationService.updateAnnouncement(
          this.editAnnouncementId,
          payload,
        )
      : this.communicationService.createAnnouncement(payload);

    req$.subscribe({
      next: () => {
        this.showAnnouncementForm = false;
        this.savingAnnouncement = false;
        this.loadAnnouncements();
      },
      error: (err) => {
        this.announcementError =
          err?.error?.message ?? "Failed to save announcement.";
        this.savingAnnouncement = false;
      },
    });
  }

  publishAnnouncement(id: string): void {
    this.communicationService.publishAnnouncement(id).subscribe({
      next: () => this.loadAnnouncements(),
    });
  }

  deleteAnnouncement(a: Announcement): void {
    if (!confirm(`Delete "${a.title}"?`)) return;
    this.communicationService.deleteAnnouncement(a._id).subscribe({
      next: () => this.loadAnnouncements(),
    });
  }

  // ── Message methods ──

  loadMessages(): void {
    this.loading = true;
    this.communicationService
      .getMessages({ folder: this.messageFolder })
      .subscribe({
        next: (res) => {
          const raw = (res.data as any).data ?? res.data;
          this.messages = Array.isArray(raw) ? raw : [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  loadUnreadCount(): void {
    this.communicationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = (res.data as any) ?? 0;
      },
    });
  }

  switchFolder(f: "inbox" | "sent"): void {
    this.messageFolder = f;
    this.selectedMessage = null;
    this.loadMessages();
  }

  viewMessage(m: Message): void {
    this.selectedMessage = this.selectedMessage?._id === m._id ? null : m;
    if (m.status !== "READ" && this.messageFolder === "inbox") {
      this.communicationService.markAsRead(m._id).subscribe({
        next: () => {
          (m as any).status = "READ";
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
      });
    }
  }

  archiveMessage(m: Message): void {
    this.communicationService.archiveMessage(m._id).subscribe({
      next: () => {
        this.messages = this.messages.filter((x) => x._id !== m._id);
        if (this.selectedMessage?._id === m._id) this.selectedMessage = null;
      },
    });
  }

  openCompose(): void {
    this.composeForm.reset();
    this.composeError = "";
    this.userSearch = "";
    this.showComposeModal = true;
    this.loadingUsers = true;
    this.usersService.getAll().subscribe({
      next: (res) => {
        const raw = (res.data as any).data ?? res.data;
        this.users = Array.isArray(raw) ? raw : [];
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
      },
    });
  }

  get filteredUsers(): LumiSchoolUser[] {
    const q = this.userSearch.toLowerCase();
    if (!q) return this.users;
    return this.users.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q),
    );
  }

  sendMessage(): void {
    if (this.composeForm.invalid) {
      this.composeForm.markAllAsTouched();
      return;
    }
    this.sendingMessage = true;
    this.composeError = "";
    this.communicationService.sendMessage(this.composeForm.value).subscribe({
      next: () => {
        this.showComposeModal = false;
        this.sendingMessage = false;
        if (this.messageFolder === "sent") this.loadMessages();
      },
      error: (err) => {
        this.composeError = err?.error?.message ?? "Failed to send message.";
        this.sendingMessage = false;
      },
    });
  }

  // ── Tab switch ──
  switchTab(t: "announcements" | "messages"): void {
    this.tab = t;
    this.selectedMessage = null;
    if (t === "announcements") this.loadAnnouncements();
    else this.loadMessages();
  }

  // ── Display helpers ──

  createdByName(a: Announcement): string {
    const v = a.createdById as any;
    if (v && typeof v === "object")
      return `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim();
    return "";
  }

  senderName(m: Message): string {
    const v = m.senderId as any;
    if (v && typeof v === "object")
      return `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim();
    return String(v ?? "—");
  }

  recipientName(m: Message): string {
    const v = m.recipientId as any;
    if (v && typeof v === "object")
      return `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim();
    return String(v ?? "—");
  }

  priorityClass(priority: string): string {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "NORMAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "LOW":
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    }
  }

  audienceClass(audience: string): string {
    switch (audience) {
      case "ALL":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "PARENTS":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "TEACHERS":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400";
      case "STUDENTS":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "STAFF":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "CLASS":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    }
  }

  audienceLabel(audience: string): string {
    return this.audiences.find((a) => a.value === audience)?.label ?? audience;
  }

  // Backward compat
  getPriorityClass(priority: string): string {
    return this.priorityClass(priority);
  }
}
