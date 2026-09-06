# E-Setu Structured Datasets Schema & Data Governance

## 1. Overview
The platform operationalizes 6 structured datasets adhering to India's **E-Waste (Management) Rules, 2022** and the **Central Pollution Control Board (CPCB) EPR Portal Data Exchange Guidelines**.

---

## 2. Dataset Schemas & Dictionaries

### 1. Material & Commodity Dataset (`materials.json`)
* **Purpose**: Classifies electronic scrap streams, baseline metal composition, and standard pricing units.
* **Fields**:
  - `id` (string, primary key): e.g., `mat-pcb-high`
  - `symbol` (string): Trading symbol e.g., `PCB-HI`, `CU-WIRE`
  - `name` / `nameMr` / `nameHi` (multilingual strings)
  - `customerRate` (number): Retail doorstep buyback price (₹/kg)
  - `recyclerRate` (number): Wholesale recycler buying price (₹/kg)
  - `rate6hrAgo` (number): Historical 6-hour reference price for volatility comparison
  - `unit` (string): Standard measurement (`kg` or `piece`)
  - `metals` (string): Assay breakdown (Au, Ag, Cu, Li, Nd, etc.)
  - `hazardLevel` (enum): `Low` | `Medium` | `High` | `Critical`
  - `properProcess` (string): Authorized recovery protocol vs prohibited backyard practice

### 2. Live & Historical Price Dataset (`price_trends.json`)
* **Purpose**: Tracks commodity price fluctuations, MCX/LME spot correlations, and provides the stock-market style ticker.
* **Fields**:
  - `materialSymbol` (string, foreign key)
  - `timestamp` (ISO 8601 DateTime)
  - `city` (string): e.g., `Pune`, `Mumbai`, `Nagpur`, `Delhi`
  - `cpcbBenchmarkFloor` (number): Statutory minimum fair baseline (₹/kg)
  - `prevailingRecyclerBid` (number): Highest active recycler bid (₹/kg)
  - `dayHigh` / `dayLow` (numbers)
  - `volumeKg` (number): Cumulative 24-hour traded volume

### 3. Authorized Recycler Dataset (`authorized_recyclers.json`)
* **Purpose**: Registry of verified recyclers with CPCB/SPCB accreditation to prevent fake recyclers.
* **Fields**:
  - `id` (string, primary key): e.g., `rec-01`
  - `name` (string): Industrial facility name
  - `cpcbRegNo` (string, unique verified): e.g., `CPCB/EPR-REC/2023/MH-0842`
  - `facilityLocation` (string & GeoJSON coordinates)
  - `licensedCapacityMTA` (number): Annual recycling quota (Metric Tonnes)
  - `acceptedCategories` (array of material IDs)
  - `doorstepPickupRadiusKm` (number)
  - `minLotKg` (number): Minimum batch weight accepted
  - `paymentTerms` (string): e.g., `Cash at Gate`, `T+0 RTGS`
  - `kabadiwalaRating` (float): Aggregated score from informal collectors (1.0 to 5.0)

### 4. Aggregated Scrap Inventory Dataset (`collector_inventory.json`)
* **Purpose**: Real-time stockpile ledger tracking materials held in the Kabadiwala's Godown.
* **Fields**:
  - `collectorId` (string, foreign key)
  - `materialId` (string, foreign key)
  - `weightKg` (number)
  - `avgPurchaseCost` (number): Cost basis per kg
  - `currentMarketValue` (number): Live valuation
  - `unrealizedMargin` (number): Projected gross profit

### 5. Transaction & Traceability Manifest Dataset (`traceable_lots.json`)
* **Purpose**: Tamper-proof digital custody chain from informal collector to authorized recycling autoclave/furnace.
* **Fields**:
  - `lotId` (string, primary key): e.g., `ESETU-LOT-2026-9812`
  - `cpcbManifestNo` (string): Official Form-6 manifest tracking number
  - `kabadiwalaId` & `recyclerId` (foreign keys)
  - `grossWeightKg` & `tareWeightKg` (numbers)
  - `gpsCoordinates` (string): Geotagged handover point
  - `qrVerificationToken` (string): Cryptographic hash for instant scan confirmation
  - `paymentMethod` (enum): `Cash on Handover` | `RTGS` | `UPI`
  - `paymentStatus` (enum): `Pending Inspection` | `Paid`
  - `eprCertificateIssued` (boolean)

### 6. AI/ML Training & Classification Dataset Metadata (`ai_training_spec.json`)
* **Purpose**: Dataset of 12,400 annotated field images of electronic scrap across Indian conditions (dusty, partially disassembled, damaged).
* **Labels**:
  - Multi-layer Server Motherboards (Gold/Palladium rich)
  - Consumer TV PCBs (Phenolic/Single-sided)
  - Smartphone Logic Boards
  - Unstripped PVC Copper Wires vs Burnt Copper
  - Cylindrical 18650 vs Pouch Li-ion Batteries
  - Leaded CRT picture tube funnels vs flat LCD monitors
