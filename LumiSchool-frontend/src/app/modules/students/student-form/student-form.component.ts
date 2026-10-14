import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { StudentsService } from "../../../shared/services/students/students.service";
import { ClassesService } from "../../../shared/services/classes/classes.service";
import { SchoolClass } from "../../../shared/interfaces/models";

@Component({
  selector: "app-student-form",
  templateUrl: "./student-form.component.html",
  styleUrls: ["./student-form.component.scss"],
})
export class StudentFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  studentId: string | null = null;
  loading = false;
  loadingStudent = false;
  error = "";
  classes: SchoolClass[] = [];
  activeTab:
    | "basic"
    | "academic"
    | "location"
    | "medical"
    | "household"
    | "other" = "basic";

  readonly tabList: Array<{
    key: "basic" | "academic" | "location" | "medical" | "household" | "other";
    label: string;
    sublabel: string;
    icon: string;
  }> = [
    { key: "basic", label: "Identity & Bio", sublabel: "Names & Identity", icon: "fa-user" },
    { key: "academic", label: "Academic & CBC", sublabel: "Grade & Level", icon: "fa-graduation-cap" },
    { key: "location", label: "Location & SNE", sublabel: "Address & Needs", icon: "fa-map-marker-alt" },
    { key: "medical", label: "Medical & Health", sublabel: "Vitals & Vaccines", icon: "fa-heartbeat" },
    { key: "household", label: "Household", sublabel: "Family Status", icon: "fa-home" },
    { key: "other", label: "Services & Welfare", sublabel: "Meals & Transit", icon: "fa-bus" },
  ];

  get activeTabIndex(): number {
    return this.tabList.findIndex((t) => t.key === this.activeTab);
  }

  get isFirstTab(): boolean {
    return this.activeTabIndex === 0;
  }

  get isLastTab(): boolean {
    return this.activeTabIndex === this.tabList.length - 1;
  }

  nextTab(): void {
    const idx = this.activeTabIndex;
    if (idx < this.tabList.length - 1) {
      this.activeTab = this.tabList[idx + 1].key;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevTab(): void {
    const idx = this.activeTabIndex;
    if (idx > 0) {
      this.activeTab = this.tabList[idx - 1].key;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isTabValid(key: string): boolean {
    if (key === 'basic') {
      const fn = this.form?.get('firstName');
      const ln = this.form?.get('lastName');
      const dob = this.form?.get('dateOfBirth');
      const gen = this.form?.get('gender');
      return !!(fn?.valid && ln?.valid && dob?.valid && gen?.valid);
    }
    if (key === 'academic') {
      const lvl = this.form?.get('currentLevel');
      const grd = this.form?.get('currentGrade');
      return !!(lvl?.valid && grd?.valid);
    }
    return true;
  }

  readonly levels = [
    { value: "PRE_PRIMARY", label: "Pre-Primary", grades: [1, 2] },
    { value: "PRIMARY", label: "Primary", grades: [1, 2, 3, 4, 5, 6] },
    { value: "JSS", label: "Junior Secondary", grades: [7, 8, 9] },
    { value: "SENIOR", label: "Senior Secondary", grades: [10, 11, 12] },
  ];

  readonly cbcTracks = [
    { value: "", label: "Not applicable" },
    { value: "STEM", label: "STEM" },
    { value: "SOCIAL_SCIENCES", label: "Social Sciences" },
    { value: "ARTS_AND_SPORTS", label: "Arts & Sports" },
  ];

  readonly specialNeedsCategories = [
    { value: "NONE", label: "None" },
    { value: "PHYSICAL_DISABILITY", label: "Physical Disability" },
    { value: "VISUAL_IMPAIRMENT", label: "Visual Impairment" },
    { value: "HEARING_IMPAIRMENT", label: "Hearing Impairment" },
    { value: "INTELLECTUAL_DISABILITY", label: "Intellectual Disability" },
    { value: "LEARNING_DISABILITY", label: "Learning Disability" },
    { value: "SPEECH_AND_LANGUAGE", label: "Speech & Language" },
    { value: "AUTISM", label: "Autism" },
    { value: "MULTIPLE_DISABILITIES", label: "Multiple Disabilities" },
    { value: "OTHER", label: "Other" },
  ];

  readonly feedingPrograms = [
    { value: "NONE", label: "None" },
    { value: "GOK_FEEDING", label: "GoK Feeding" },
    { value: "WFP", label: "WFP" },
    { value: "SCHOOL_FEEDING", label: "School Feeding" },
    { value: "OTHER", label: "Other" },
  ];

  readonly bursaryStatuses = [
    { value: "NOT_APPLICABLE", label: "Not Applicable" },
    { value: "APPLIED", label: "Applied" },
    { value: "AWARDED", label: "Awarded" },
    { value: "NOT_AWARDED", label: "Not Awarded" },
  ];

  gradesForLevel: number[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentsService: StudentsService,
    private classesService: ClassesService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadClasses();

    this.studentId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.studentId;

    if (this.isEditMode && this.studentId) {
      this.loadStudent(this.studentId);
    }

    this.form.get("currentLevel")!.valueChanges.subscribe((level) => {
      this.updateGradesForLevel(level);
      this.form.get("currentGrade")!.reset();
      this.form.get("currentClassId")!.reset();
      this.loadClassesForLevel(level);
    });
  }

  buildForm(): void {
    this.form = this.fb.group({
      // Basic
      admissionNumber: [""],
      upiNumber: [""],
      nemisNumber: [""],
      nhifNumber: [""],
      birthCertificateNumber: [""],
      firstName: ["", Validators.required],
      middleName: [""],
      lastName: ["", Validators.required],
      dateOfBirth: ["", Validators.required],
      gender: ["", Validators.required],
      nationality: [""],
      photo: [""],
      // Academic
      currentLevel: ["", Validators.required],
      currentGrade: ["", Validators.required],
      currentClassId: [""],
      boardingStatus: ["DAY_SCHOLAR"],
      cbcTrack: [""],
      admissionDate: [""],
      previousSchool: [""],
      previousSchoolGrade: [""],
      previousSchoolLevel: [""],
      transferLetterRef: [""],
      status: ["ACTIVE"],
      // Location
      county: [""],
      subCounty: [""],
      constituency: [""],
      ward: [""],
      village: [""],
      postalAddress: [""],
      religion: [""],
      specialNeedsCategory: ["NONE"],
      specialNeeds: [""],
      // Medical
      bloodGroup: [""],
      allergies: [""],
      conditions: [""],
      chronicIllness: [""],
      emergencyContact: [""],
      emergencyContactName: [""],
      physicalFitnessRef: [""],
      // Immunization
      polioStatus: [false],
      polioDate: [""],
      measlesStatus: [false],
      measlesDate: [""],
      dptStatus: [false],
      dptDate: [""],
      bcgStatus: [false],
      bcgDate: [""],
      hepatitisBStatus: [false],
      hepatitisBDate: [""],
      hpvStatus: [false],
      hpvDate: [""],
      covid19Status: [false],
      covid19Date: [""],
      yellowFeverStatus: [false],
      yellowFeverDate: [""],
      tetanusStatus: [false],
      tetanusDate: [""],
      // Household
      siblingCount: [""],
      birthOrder: [""],
      isOrphan: [false],
      isPartialOrphan: [false],
      isSingleParent: [false],
      parentOccupation: [""],
      parentIncomeBracket: [""],
      // Other
      feedingProgram: ["NONE"],
      bursaryStatus: ["NOT_APPLICABLE"],
      bursarySource: [""],
      needsTransport: [false],
      transportRoute: [""],
      pickupPoint: [""],
      transportFee: [""],
    });
  }

  loadClasses(): void {
    this.classesService.getAll({ limit: 100 }).subscribe({
      next: (res) => (this.classes = res.data || []),
    });
  }

  loadClassesForLevel(level: string): void {
    if (!level) return;
    this.classesService.getAll({ level, limit: 100 }).subscribe({
      next: (res) => (this.classes = res.data || []),
    });
  }

  updateGradesForLevel(level: string): void {
    const found = this.levels.find((l) => l.value === level);
    this.gradesForLevel = found ? found.grades : [];
  }

  loadStudent(id: string): void {
    this.loadingStudent = true;
    this.studentsService.getById(id).subscribe({
      next: (res) => {
        const s = res.data;
        this.updateGradesForLevel(s.currentLevel);
        const dob = s.dateOfBirth ? s.dateOfBirth.substring(0, 10) : "";
        const admDate = s.admissionDate
          ? s.admissionDate.substring(0, 10)
          : "";

        const immunizationData: any = {};
        if (s.immunization) {
          for (const key of [
            "polio",
            "measles",
            "dpt",
            "bcg",
            "hepatitisB",
            "hpv",
            "covid19",
            "yellowFever",
            "tetanus",
          ]) {
            const v = (s.immunization as any)[key];
            if (v) {
              immunizationData[`${key}Status`] = v.status;
              immunizationData[`${key}Date`] = v.date
                ? v.date.substring(0, 10)
                : "";
            }
          }
        }

        this.form.patchValue({
          admissionNumber: s.admissionNumber,
          upiNumber: s.upiNumber || "",
          nemisNumber: s.nemisNumber || "",
          nhifNumber: s.nhifNumber || "",
          birthCertificateNumber: s.birthCertificateNumber || "",
          firstName: s.firstName,
          middleName: s.middleName || "",
          lastName: s.lastName,
          dateOfBirth: dob,
          gender: s.gender,
          nationality: s.nationality || "",
          photo: s.photo || "",
          currentLevel: s.currentLevel,
          currentGrade: s.currentGrade,
          currentClassId: s.currentClassId || "",
          boardingStatus: s.boardingStatus,
          cbcTrack: s.cbcTrack || "",
          admissionDate: admDate,
          previousSchool: s.previousSchool || "",
          previousSchoolGrade: s.previousSchoolGrade || "",
          previousSchoolLevel: s.previousSchoolLevel || "",
          transferLetterRef: s.transferLetterRef || "",
          status: s.status,
          county: s.county || "",
          subCounty: s.subCounty || "",
          constituency: s.constituency || "",
          ward: s.ward || "",
          village: s.village || "",
          postalAddress: s.postalAddress || "",
          religion: s.religion || "",
          specialNeedsCategory: s.specialNeedsCategory || "NONE",
          specialNeeds: s.specialNeeds || "",
          bloodGroup: s.medicalInfo?.bloodGroup || "",
          allergies: (s.medicalInfo?.allergies || []).join(", "),
          conditions: (s.medicalInfo?.conditions || []).join(", "),
          chronicIllness: s.medicalInfo?.chronicIllness || "",
          emergencyContact: s.medicalInfo?.emergencyContact || "",
          emergencyContactName: s.medicalInfo?.emergencyContactName || "",
          physicalFitnessRef: s.medicalInfo?.physicalFitnessRef || "",
          ...immunizationData,
          siblingCount: s.householdInfo?.siblingCount ?? "",
          birthOrder: s.householdInfo?.birthOrder ?? "",
          isOrphan: s.householdInfo?.isOrphan ?? false,
          isPartialOrphan: s.householdInfo?.isPartialOrphan ?? false,
          isSingleParent: s.householdInfo?.isSingleParent ?? false,
          parentOccupation: s.householdInfo?.parentOccupation || "",
          parentIncomeBracket: s.householdInfo?.parentIncomeBracket || "",
          feedingProgram: s.feedingProgram || "NONE",
          bursaryStatus: s.bursaryStatus || "NOT_APPLICABLE",
          bursarySource: s.bursarySource || "",
          needsTransport: s.transport?.needsTransport ?? false,
          transportRoute: s.transport?.route || "",
          pickupPoint: s.transport?.pickupPoint || "",
          transportFee: s.transport?.transportFee ?? "",
        });
        this.loadingStudent = false;
      },
      error: () => {
        this.loadingStudent = false;
        this.router.navigate(["/students"]);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.activeTab = "basic";
      return;
    }
    this.loading = true;
    this.error = "";

    const raw = this.form.value;
    const payload: any = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      dateOfBirth: raw.dateOfBirth,
      gender: raw.gender,
      currentLevel: raw.currentLevel,
      currentGrade: Number(raw.currentGrade),
      boardingStatus: raw.boardingStatus || "DAY_SCHOLAR",
    };

    if (raw.admissionNumber) payload.admissionNumber = raw.admissionNumber;

    if (this.isEditMode && raw.status) payload.status = raw.status;

    const optionalStrings = [
      "upiNumber",
      "nemisNumber",
      "nhifNumber",
      "birthCertificateNumber",
      "middleName",
      "nationality",
      "photo",
      "currentClassId",
      "previousSchool",
      "previousSchoolGrade",
      "previousSchoolLevel",
      "transferLetterRef",
      "county",
      "subCounty",
      "constituency",
      "ward",
      "village",
      "postalAddress",
      "religion",
      "specialNeeds",
      "bursarySource",
    ];
    for (const key of optionalStrings) {
      if (raw[key]) payload[key] = raw[key];
    }

    if (raw.cbcTrack) payload.cbcTrack = raw.cbcTrack;
    if (raw.admissionDate) payload.admissionDate = raw.admissionDate;
    if (raw.specialNeedsCategory && raw.specialNeedsCategory !== "NONE")
      payload.specialNeedsCategory = raw.specialNeedsCategory;

    const medicalInfo: any = {};
    if (raw.bloodGroup) medicalInfo.bloodGroup = raw.bloodGroup;
    if (raw.emergencyContact) medicalInfo.emergencyContact = raw.emergencyContact;
    if (raw.emergencyContactName) medicalInfo.emergencyContactName = raw.emergencyContactName;
    if (raw.chronicIllness) medicalInfo.chronicIllness = raw.chronicIllness;
    if (raw.physicalFitnessRef) medicalInfo.physicalFitnessRef = raw.physicalFitnessRef;
    if (raw.allergies)
      medicalInfo.allergies = raw.allergies
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    if (raw.conditions)
      medicalInfo.conditions = raw.conditions
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    if (Object.keys(medicalInfo).length) payload.medicalInfo = medicalInfo;

    const immunization: any = {};
    for (const key of [
      "polio",
      "measles",
      "dpt",
      "bcg",
      "hepatitisB",
      "hpv",
      "covid19",
      "yellowFever",
      "tetanus",
    ]) {
      if (raw[`${key}Status`] || raw[`${key}Date`]) {
        immunization[key] = {
          status: raw[`${key}Status`] || false,
          date: raw[`${key}Date`] || undefined,
        };
      }
    }
    if (Object.keys(immunization).length) payload.immunization = immunization;

    const householdInfo: any = {};
    if (raw.siblingCount !== "")
      householdInfo.siblingCount = Number(raw.siblingCount);
    if (raw.birthOrder !== "")
      householdInfo.birthOrder = Number(raw.birthOrder);
    if (raw.isOrphan) householdInfo.isOrphan = raw.isOrphan;
    if (raw.isPartialOrphan) householdInfo.isPartialOrphan = raw.isPartialOrphan;
    if (raw.isSingleParent) householdInfo.isSingleParent = raw.isSingleParent;
    if (raw.parentOccupation)
      householdInfo.parentOccupation = raw.parentOccupation;
    if (raw.parentIncomeBracket)
      householdInfo.parentIncomeBracket = raw.parentIncomeBracket;
    if (Object.keys(householdInfo).length) payload.householdInfo = householdInfo;

    if (raw.feedingProgram && raw.feedingProgram !== "NONE")
      payload.feedingProgram = raw.feedingProgram;
    if (raw.bursaryStatus && raw.bursaryStatus !== "NOT_APPLICABLE")
      payload.bursaryStatus = raw.bursaryStatus;
    if (raw.bursarySource) payload.bursarySource = raw.bursarySource;

    const transport: any = {};
    if (raw.needsTransport) transport.needsTransport = raw.needsTransport;
    if (raw.transportRoute) transport.route = raw.transportRoute;
    if (raw.pickupPoint) transport.pickupPoint = raw.pickupPoint;
    if (raw.transportFee !== "" && raw.transportFee !== null)
      transport.transportFee = Number(raw.transportFee);
    if (Object.keys(transport).length) payload.transport = transport;

    const action$ = this.isEditMode
      ? this.studentsService.update(this.studentId!, payload)
      : this.studentsService.create(payload);

    action$.subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(["/students", res.data._id]);
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message || "An error occurred. Please try again.";
      },
    });
  }

  cancel(): void {
    if (this.isEditMode && this.studentId) {
      this.router.navigate(["/students", this.studentId]);
    } else {
      this.router.navigate(["/students"]);
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
