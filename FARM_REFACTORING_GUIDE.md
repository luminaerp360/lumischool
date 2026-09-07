# Lumifarm Backend - Property Management to Farm Management System Refactoring

## Overview

This document details the complete refactoring of the Lumifarm backend from a **Property Rental Management System** to a **Farm Management System**. The new farm-centric modules provide comprehensive functionality for managing agricultural operations, crop cycles, farm workers, and farming finances.

## Architecture Changes

### OLD Structure (Property Rental)

```
Properties → Units → Leases → Payments/Damages
(buildings) (rooms) (rental agreements) (rent/repairs)
```

### NEW Structure (Farm Management)

```
Farms → Plots → Crop Cycles → Farm Finance
(farmlands) (fields) (growing seasons) (expenses/income)
         → Farm Workers → Crop Issues
         (staff) (pests/diseases)
```

---

## Module Mapping & Changes

### 1. **Properties → Farms**

**Path**: `/src/modules/farms/`

**Key Changes**:

- `PropertyType` → `FarmType`: vegetable_farm, dairy_farm, grain_farm, coffee_farm, orchard, poultry_farm, mixed_farming, aquaculture, greenhouse
- `PropertyStatus` → `FarmStatus`: under_cultivation, fallow, maintenance, inactive
- Added new fields:
  - `totalAcreage` (number) - Total farm size
  - `soilType` enum - sandy, clayey, loamy, silty, peat
  - `irrationType` enum - drip, sprinkler, flood, rainwater, well, none
  - `dominantCrops` array - Main crops grown
  - `ownerName`, `ownerPhone`, `ownerEmail` - Owner info
  - `latitude`, `longitude` - Geolocation

**API Endpoints**:

```
POST   /api/farms                 - Create farm
GET    /api/farms                 - List all farms
GET    /api/farms/:id             - Get farm details
PUT    /api/farms/:id             - Update farm
DELETE /api/farms/:id             - Delete farm
GET    /api/farms/stats           - Farm statistics
```

**DTO**: `CreateFarmDto`, `UpdateFarmDto`

---

### 2. **Units → Plots**

**Path**: `/src/modules/plots/`

**Key Changes**:

- `UnitStatus` → `PlotStatus`: planted, vacant, fallow, under_preparation, harvested, maintenance
- `rentAmount` → `costToOperatePerCycle` - Cost to manage plot per growing season
- Added new fields:
  - `areaInAcres` (number) - Plot size in acres
  - `cropType` (string) - Current or main crop
  - `currentCropCycleId` - Link to active crop cycle
  - `lastPlantedDate` - When crop was last planted
  - `lastHarvestedDate` - Last harvest date
  - `soilQuality` - Soil condition assessment

**API Endpoints**:

```
POST   /api/plots                 - Create plot
GET    /api/plots                 - List all plots
GET    /api/plots/farm/:farmId    - Get plots by farm
PUT    /api/plots/:id             - Update plot
DELETE /api/plots/:id             - Delete plot
GET    /api/plots/stats/:farmId   - Plot statistics for farm
```

**DTO**: `CreatePlotDto`, `UpdatePlotDto`

---

### 3. **Leases → Crop Cycles**

**Path**: `/src/modules/crop-cycles/`

**Key Changes**:

- `LeaseStatus` → `CropCycleStatus`: draft, active, growing, harvesting, completed, abandoned
- `startDate` → `plantingDate` - When crop is planted
- `endDate` → `expectedHarvestDate` - Expected harvest date
- `rentAmount` → `projectedYield` - Expected crop output (kg/units)
- Added new fields:
  - `seedSupplier` - Seed source
  - `seedVariety` - Crop variety planted
  - `expectedCropValue` - Projected income
  - `actualYield` - Actual harvest quantity
  - `actualCropValue` - Actual income from harvest
  - `fertilizer` - Fertilizer used
  - `pesticides` - Pest control products
  - `waterConsumption` - Water used (liters)
  - `laborCost` - Labor expenses
  - `farmingPractices` - Practices documentation
  - `pestManagementMethod` - How pests are managed

**API Endpoints**:

```
POST   /api/crop-cycles           - Create crop cycle
GET    /api/crop-cycles           - List all cycles
GET    /api/crop-cycles/active    - Get active cycles
GET    /api/crop-cycles/farm/:id  - Cycles for farm
PUT    /api/crop-cycles/:id       - Update cycle
DELETE /api/crop-cycles/:id       - Delete cycle
GET    /api/crop-cycles/stats     - Cycle statistics
```

**DTO**: `CreateCropCycleDto`, `UpdateCropCycleDto`

---

### 4. **PropertyTenants → Farm Workers**

**Path**: `/src/modules/farm-workers/`

**Key Changes**:

- Renamed from renters to farm staff/operations team
- Added new fields:
  - `role` enum: owner, manager, worker, specialist, contractor
  - `specialization` enum: general, crop_expert, soil_expert, pest_control, irrigation, equipment_operator, veterinary
  - `isActive` - Whether worker is currently employed
  - `monthlyWage` - Salary/compensation
  - `availability` - full_time, part_time, seasonal
  - `healthInsuranceNumber` - Insurance info
  - `leaveDate` - When worker left

**API Endpoints**:

```
POST   /api/farm-workers          - Create worker
GET    /api/farm-workers          - List all workers
GET    /api/farm-workers/active   - Get active workers
PUT    /api/farm-workers/:id      - Update worker
DELETE /api/farm-workers/:id      - Remove worker
GET    /api/farm-workers/stats    - Worker statistics
```

**DTO**: `CreateFarmWorkerDto`, `UpdateFarmWorkerDto`

---

### 5. **Damages → Crop Issues**

**Path**: `/src/modules/crop-issues/`

**Key Changes**:

- Tracks crop problems instead of property damage
- `IssueType` enum: pest_infestation, disease, weather_damage, soil_deficiency, water_stress, flood, drought, equipment_failure, labor_shortage, other
- `IssueSeverity` enum: low, medium, high, critical
- `IssueStatus` enum: reported, in_treatment, resolved, closed
- Added new fields:
  - `pestName` - Type of pest if applicable
  - `diseaseName` - Disease name if applicable
  - `affectedArea` - Percentage/area affected
  - `diagnosis` - Problem assessment
  - `remedialMeasure` - Solution applied
  - `costToFix` - Treatment cost
  - `treatedDate` - When treatment started
  - `resolvedDate` - When issue resolved
  - `treatedBy` - Worker who treated issue
  - `chemicalUsed` - Any chemicals applied

**API Endpoints**:

```
POST   /api/crop-issues           - Report issue
GET    /api/crop-issues           - List all issues
GET    /api/crop-issues/unresolved - Get unresolved issues
GET    /api/crop-issues/critical  - Get critical issues
PUT    /api/crop-issues/:id       - Update issue status
DELETE /api/crop-issues/:id       - Delete issue
GET    /api/crop-issues/stats     - Issue statistics
```

**DTO**: `CreateCropIssueDto`, `UpdateCropIssueDto`

---

### 6. **Payments → Farm Finance**

**Path**: `/src/modules/farm-finance/`

**Key Changes**:

- Split into Expenses and Income tracking
- `TransactionType` enum: expense, income
- `ExpenseCategory` enum: seed, fertilizer, pesticides, labor, water, equipment, transport, storage, utilities, maintenance, other
- `IncomeCategory` enum: crop_sale, livestock_sale, subsidy, grant, other
- `PaymentStatus` enum: pending, paid, overdue, partially_paid
- Added new fields:
  - `vendor` - For expenses (supplier)
  - `buyer` - For income (customer)
  - `quantitySold` - Quantity in sale transactions
  - `pricePerUnit` - Unit price
  - `paymentMethod` - How payment made (cash, mobile_money, bank_transfer)
  - `reference` - Receipt/invoice number
  - `recordedBy` - User who recorded transaction

**API Endpoints**:

```
POST   /api/farm-finance          - Record transaction
GET    /api/farm-finance          - List all transactions
GET    /api/farm-finance/summary  - Financial summary
GET    /api/farm-finance/expenses - Get all expenses
GET    /api/farm-finance/income   - Get all income
GET    /api/farm-finance/pending  - Pending payments
GET    /api/farm-finance/overdue  - Overdue payments
PUT    /api/farm-finance/:id      - Update transaction
DELETE /api/farm-finance/:id      - Delete transaction
```

**DTO**: `CreateFarmFinanceDto`, `UpdateFarmFinanceDto`

---

## Database Migration Strategy

### Option 1: Gradual Migration (Recommended)

1. **Phase 1**: Keep old modules operational
2. **Phase 2**: Migrate data from old collections to new ones
3. **Phase 3**: Update frontend to use new APIs
4. **Phase 4**: Deprecate old modules after confirmation

### Option 2: Fresh Start

- Start with new farm modules
- Old property rental modules available for backward compatibility

### Collections Created

```
farms              (replaces properties)
plots              (replaces units)
crop_cycles        (replaces leases)
farm_workers       (replaces property_tenants)
crop_issues        (replaces damages)
farm_finance       (replaces payments)
```

---

## Data Type Conversions

| Property Module | Farm Module                  | Conversion                                |
| --------------- | ---------------------------- | ----------------------------------------- |
| Property        | Farm                         | Rename, add farm-specific fields          |
| Unit            | Plot                         | Rename, adjust status enums               |
| Lease           | CropCycle                    | Rename, convert dates, add farming fields |
| PropertyTenant  | FarmWorker                   | Rename, add role/specialization           |
| Damage          | CropIssue                    | Rename, add agricultural specific issues  |
| Payment (rent)  | FarmFinance (expense/income) | Split into two directions                 |

---

## New Features by Module

### Farms

- ✅ Farm type categorization
- ✅ Soil type and irrigation tracking
- ✅ Geolocation support (latitude/longitude)
- ✅ Owner information management
- ✅ Dominant crops tracking

### Plots

- ✅ Area measurements in acres
- ✅ Crop type tracking
- ✅ Planting and harvest date tracking
- ✅ Soil quality assessment
- ✅ Operating cost per cycle

### Crop Cycles

- ✅ Complete growing season tracking
- ✅ Seed supplier and variety documentation
- ✅ Yield projections and actuals
- ✅ Resource tracking (water, fertilizer, pesticides)
- ✅ Labor cost recording
- ✅ Farming practices documentation
- ✅ Cycle renewal tracking

### Farm Workers

- ✅ Role-based access (owner, manager, worker, specialist, contractor)
- ✅ Specialization tracking
- ✅ Employment status and dates
- ✅ Wage management
- ✅ Health insurance tracking
- ✅ Skills documentation

### Crop Issues

- ✅ Automated severity tracking
- ✅ Problem diagnosis and treatment
- ✅ Cost tracking for solutions
- ✅ Critical issue alerts
- ✅ Resolution status tracking
- ✅ Image documentation

### Farm Finance

- ✅ Dual-direction tracking (income/expenses)
- ✅ Multiple expense categories
- ✅ Multiple income sources
- ✅ Financial summaries and KPIs
- ✅ Payment status tracking
- ✅ Overdue payment alerts

---

## API Usage Examples

### Create a Farm

```bash
POST /api/farms
{
  "name": "Green Acres Farm",
  "type": "vegetable_farm",
  "address": "123 Farm Lane",
  "city": "Nairobi",
  "county": "Nairobi",
  "totalAcreage": 50,
  "soilType": "loamy",
  "irrationType": "drip",
  "dominantCrops": ["tomatoes", "onions", "cabbage"],
  "ownerName": "John Doe",
  "ownerPhone": "+254721234567"
}
```

### Create a Plot in Farm

```bash
POST /api/plots
{
  "farmId": "farm_id_here",
  "plotNumber": "A1",
  "areaInAcres": 2.5,
  "cropType": "tomatoes",
  "soilQuality": "good",
  "costToOperatePerCycle": 5000
}
```

### Start a Crop Cycle

```bash
POST /api/crop-cycles
{
  "farmId": "farm_id",
  "plotId": "plot_id",
  "farmWorkerId": "worker_id",
  "cropType": "tomatoes",
  "plantingDate": "2024-03-01",
  "expectedHarvestDate": "2024-06-30",
  "seedSupplier": "Seeds Ltd",
  "projectedYield": 5000,
  "expectedCropValue": 50000
}
```

### Record Farm Expense

```bash
POST /api/farm-finance
{
  "farmId": "farm_id",
  "cropCycleId": "cycle_id",
  "transactionType": "expense",
  "category": "seed",
  "description": "Tomato seeds from Seeds Ltd",
  "amount": 2000,
  "vendor": "Seeds Ltd",
  "transactionDate": "2024-03-01"
}
```

### Report Crop Issue

```bash
POST /api/crop-issues
{
  "farmId": "farm_id",
  "plotId": "plot_id",
  "issueType": "pest_infestation",
  "severity": "high",
  "description": "Armyworm infestation detected",
  "pestName": "Armyworm",
  "affectedArea": "30%",
  "reportedBy": "worker_id"
}
```

---

## File Structure

```
src/modules/
├── farms/
│   ├── farms.controller.ts
│   ├── farms.module.ts
│   ├── farms.service.ts
│   ├── dto/
│   │   └── farm.dto.ts
│   ├── schemas/
│   │   └── farm.schema.ts
│   └── repositories/
│       └── farm.repository.ts
├── plots/
│   ├── plots.controller.ts
│   ├── plots.module.ts
│   ├── plots.service.ts
│   ├── dto/
│   │   └── plot.dto.ts
│   ├── schemas/
│   │   └── plot.schema.ts
│   └── repositories/
│       └── plot.repository.ts
├── crop-cycles/
│   ├── crop-cycles.controller.ts
│   ├── crop-cycles.module.ts
│   ├── crop-cycles.service.ts
│   ├── dto/
│   │   └── crop-cycle.dto.ts
│   ├── schemas/
│   │   └── crop-cycle.schema.ts
│   └── repositories/
│       └── crop-cycle.repository.ts
├── farm-workers/
│   ├── farm-workers.controller.ts
│   ├── farm-workers.module.ts
│   ├── farm-workers.service.ts
│   ├── dto/
│   │   └── farm-worker.dto.ts
│   ├── schemas/
│   │   └── farm-worker.schema.ts
│   └── repositories/
│       └── farm-worker.repository.ts
├── crop-issues/
│   ├── crop-issues.controller.ts
│   ├── crop-issues.module.ts
│   ├── crop-issues.service.ts
│   ├── dto/
│   │   └── crop-issue.dto.ts
│   ├── schemas/
│   │   └── crop-issue.schema.ts
│   └── repositories/
│       └── crop-issue.repository.ts
└── farm-finance/
    ├── farm-finance.controller.ts
    ├── farm-finance.module.ts
    ├── farm-finance.service.ts
    ├── dto/
    │   └── farm-finance.dto.ts
    ├── schemas/
    │   └── farm-finance.schema.ts
    └── repositories/
        └── farm-finance.repository.ts
```

---

## Next Steps

1. **Frontend Update** - Replace property management UI with farm management UI
2. **Database Migration** - Migrate data from old collections if needed
3. **Testing** - Comprehensive testing of all new endpoints
4. **Documentation** - Update API documentation and user guides
5. **Deprecation** - Phase out old property management modules
6. **Training** - Train users on farm management features

---

## Support

For questions or issues during migration, refer to the official NestJS and MongoDB documentation or contact the development team.

**Refactoring Date**: March 27, 2026
**Status**: ✅ Complete - All modules created and integrated
