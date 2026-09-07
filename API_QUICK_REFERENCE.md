# Farm Management System - API Quick Reference

## Base URL

```
http://localhost:3400/api
```

## Authentication

All endpoints require JWT Bearer token in Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Farms Endpoints

### Create Farm

```
POST /farms
Content-Type: application/json

{
  "name": "Farm Name",
  "type": "vegetable_farm|dairy_farm|grain_farm|coffee_farm|orchard|poultry_farm|mixed_farming|aquaculture|greenhouse",
  "address": "Farm Address",
  "city": "City",
  "county": "County",
  "totalAcreage": 50,
  "soilType": "sandy|clayey|loamy|silty|peat",
  "irrationType": "drip|sprinkler|flood|rainwater|well|none",
  "dominantCrops": ["crop1", "crop2"],
  "ownerName": "Owner Name",
  "ownerPhone": "+2547...",
  "ownerEmail": "email@example.com",
  "latitude": 0.0,
  "longitude": 0.0
}
```

### List Farms

```
GET /farms?page=1&limit=20&search=query&status=under_cultivation&type=vegetable_farm
```

### Get Farm

```
GET /farms/:id
```

### Update Farm

```
PUT /farms/:id
Content-Type: application/json
{ ...fields to update }
```

### Delete Farm

```
DELETE /farms/:id
```

### Farm Stats

```
GET /farms/stats
```

---

## Plots Endpoints

### Create Plot

```
POST /plots
{
  "farmId": "farm_id",
  "plotNumber": "A1",
  "description": "Plot description",
  "areaInAcres": 2.5,
  "cropType": "tomatoes",
  "soilQuality": "good",
  "costToOperatePerCycle": 5000,
  "currency": "KES"
}
```

### List Plots

```
GET /plots?page=1&limit=20&farmId=farm_id&status=planted
```

### Get Plots by Farm

```
GET /plots/farm/:farmId
```

### Get Plot Stats

```
GET /plots/stats/:farmId
```

### Get Plot

```
GET /plots/:id
```

### Update Plot

```
PUT /plots/:id
```

### Delete Plot

```
DELETE /plots/:id
```

---

## Crop Cycles Endpoints

### Create Crop Cycle

```
POST /crop-cycles
{
  "farmId": "farm_id",
  "plotId": "plot_id",
  "farmWorkerId": "worker_id",
  "cycleNumber": "2024-01",
  "plantingDate": "2024-03-01T00:00:00Z",
  "expectedHarvestDate": "2024-06-30T00:00:00Z",
  "cropType": "tomatoes",
  "seedSupplier": "Seeds Ltd",
  "seedVariety": "Roma VF",
  "projectedYield": 5000,
  "expectedCropValue": 50000,
  "fertilizer": "NPK 15-15-15",
  "pesticides": "Cypermethrin",
  "waterConsumption": 100000,
  "laborCost": 20000,
  "harvestFrequency": "monthly|quarterly|semi_annually|annually",
  "farmingPractices": "Drip irrigation, mulching",
  "pestManagementMethod": "Integrated Pest Management"
}
```

### List Crop Cycles

```
GET /crop-cycles?page=1&limit=20&status=active&farmId=farm_id
```

### Get Active Cycles

```
GET /crop-cycles/active
```

### Get Cycles by Farm

```
GET /crop-cycles/farm/:farmId
```

### Get Cycle Stats

```
GET /crop-cycles/stats
```

### Get Cycle

```
GET /crop-cycles/:id
```

### Update Cycle

```
PUT /crop-cycles/:id
{
  "status": "growing|harvesting|completed|abandoned",
  "actualHarvestDate": "2024-06-30",
  "actualYield": 5200,
  "actualCropValue": 52000
}
```

### Delete Cycle

```
DELETE /crop-cycles/:id
```

---

## Farm Workers Endpoints

### Create Worker

```
POST /farm-workers
{
  "farmId": "farm_id",
  "fullName": "Worker Name",
  "role": "owner|manager|worker|specialist|contractor",
  "specialization": "general|crop_expert|soil_expert|pest_control|irrigation|equipment_operator|veterinary",
  "phone": "+254721234567",
  "email": "worker@example.com",
  "nationalId": "12345678",
  "joinDate": "2024-01-01",
  "availability": "full_time|part_time|seasonal",
  "address": "Worker Address",
  "monthlyWage": 15000,
  "skills": "Crop management, pest management",
  "healthInsuranceNumber": "INS123456"
}
```

### List Workers

```
GET /farm-workers?page=1&limit=20&role=manager&isActive=true
```

### Get Active Workers

```
GET /farm-workers/active
```

### Get Worker Stats

```
GET /farm-workers/stats
```

### Get Worker

```
GET /farm-workers/:id
```

### Update Worker

```
PUT /farm-workers/:id
{
  "isActive": false,
  "leaveDate": "2024-12-31"
}
```

### Delete Worker

```
DELETE /farm-workers/:id
```

---

## Crop Issues Endpoints

### Report Issue

```
POST /crop-issues
{
  "farmId": "farm_id",
  "plotId": "plot_id",
  "cropCycleId": "cycle_id",
  "issueType": "pest_infestation|disease|weather_damage|soil_deficiency|water_stress|flood|drought|equipment_failure|labor_shortage|other",
  "severity": "low|medium|high|critical",
  "description": "Issue description",
  "affectedArea": "30%",
  "diagnosis": "Armyworm infestation",
  "remedialMeasure": "Spray with Cypermethrin",
  "costToFix": 5000,
  "reportedBy": "worker_id",
  "pestName": "Armyworm",
  "diseaseName": "Late Blight",
  "chemicalUsed": "Cypermethrin"
}
```

### List Issues

```
GET /crop-issues?page=1&limit=20&status=reported&severity=high
```

### Get Unresolved Issues

```
GET /crop-issues/unresolved
```

### Get Critical Issues

```
GET /crop-issues/critical
```

### Get Issue Stats

```
GET /crop-issues/stats
```

### Get Issue

```
GET /crop-issues/:id
```

### Update Issue

```
PUT /crop-issues/:id
{
  "status": "in_treatment|resolved|closed",
  "treatedDate": "2024-03-02",
  "resolvedDate": "2024-03-05",
  "treatedBy": "worker_id"
}
```

### Delete Issue

```
DELETE /crop-issues/:id
```

---

## Farm Finance Endpoints

### Record Transaction

```
POST /farm-finance
{
  "farmId": "farm_id",
  "cropCycleId": "cycle_id",
  "transactionType": "expense|income",
  "category": "seed|fertilizer|pesticides|labor|water|equipment|transport|storage|utilities|maintenance|crop_sale|livestock_sale|subsidy|grant",
  "description": "Transaction description",
  "amount": 2000,
  "currency": "KES",
  "transactionDate": "2024-03-01",
  "paidDate": "2024-03-01",
  "paymentMethod": "cash|mobile_money|bank_transfer",
  "reference": "RECEIPT001",
  "vendor": "Vendor Name",
  "buyer": "Buyer Name",
  "quantitySold": 100,
  "pricePerUnit": 50
}
```

### List Transactions

```
GET /farm-finance?page=1&limit=20&transactionType=expense&category=seed
```

### Get Financial Summary

```
GET /farm-finance/summary
Returns: {
  "totalExpenses": 50000,
  "totalIncome": 100000,
  "netProfit": 50000,
  "profitMargin": "50.00"
}
```

### Get Expenses

```
GET /farm-finance/expenses
```

### Get Income

```
GET /farm-finance/income
```

### Get Pending Payments

```
GET /farm-finance/pending-payments
```

### Get Overdue Payments

```
GET /farm-finance/overdue-payments
```

### Get Transaction

```
GET /farm-finance/:id
```

### Update Transaction

```
PUT /farm-finance/:id
{
  "paymentStatus": "paid|pending|overdue|partially_paid",
  "paidDate": "2024-03-05"
}
```

### Delete Transaction

```
DELETE /farm-finance/:id
```

---

## Status & Enum Values

### Farm Status

- `under_cultivation` - Farm is actively being cultivated
- `fallow` - Farm is resting
- `maintenance` - Under maintenance
- `inactive` - Not in use

### Plot Status

- `planted` - Crop currently growing
- `vacant` - No crop
- `fallow` - Resting
- `under_preparation` - Preparing for planting
- `harvested` - Recently harvested
- `maintenance` - Under maintenance

### Crop Cycle Status

- `draft` - Planning phase
- `active` - Growing season started
- `growing` - Active growth
- `harvesting` - Harvest in progress
- `completed` - Cycle finished
- `abandoned` - Cycle cancelled

### Issue Severity

- `low` - Minor issue
- `medium` - Noteworthy issue
- `high` - Serious issue
- `critical` - Emergency situation

### Issue Status

- `reported` - Issue reported
- `in_treatment` - Actively treating
- `resolved` - Treatment complete
- `closed` - Issue resolved and closed

---

## Error Responses

```json
{
  "statusCode": 404,
  "message": "Farm not found",
  "error": "Not Found"
}
```

Common HTTP Status Codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Pagination

Most list endpoints support pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

Response format:

```json
{
  "data": [...],
  "page": 1,
  "limit": 20,
  "total": 150,
  "pages": 8
}
```

---

**Last Updated**: March 27, 2026
