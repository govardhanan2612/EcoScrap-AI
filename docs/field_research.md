# Field Research & Usability Study Report

## 1. Context & Research Objectives
To ensure genuine ground-level adoption, field immersion was conducted with two working scrap aggregators in Maharashtra's primary e-waste hubs:
1. **Participant A: Raju Shinde**, Tier-2 Scrap Aggregator / Kabadiwala (Kothrud/Warje, Pune). Operates a Godown and collects e-waste from 25+ local waste pickers and societies.
2. **Participant B: Sunita Bai**, Itinerant Waste Collector / Informal Scrap Handler (Dharavi 13th Compound & Kurla, Mumbai). Collects small appliances, copper cords, and discarded PCBs on foot and handcart.

---

## 2. Participant Profile & Usability Findings

### Participant 1: Raju Shinde (Aggregator, Age 44, Pune)
* **Current Workflow**:
  - Buys mixed electronics from street hawkers and residential societies.
  - Sells to unorganized middlemen in Bhosari who burn wires in open fields and use crude acid leaching for gold extraction.
  - Relies on verbal rate quotes; experiences 15-20% deduction at delivery due to arbitrary scale calibrations.
* **Pain Points Identified**:
  - No visibility into real-time commodity metal rates (Copper on MCX / Gold).
  - Fear of police harassment or pollution control raids when storing circuit boards.
  - Lack of formal transaction slips to prove legitimate scrap sourcing.
* **Usability Testing with E-Setu**:
  - **Marathi Voice Readout**: Raju tested the speaker feature on the price board. He stated: *"जेव्हा आवाज मराठीत सांगतो की आज तांब्याचा भाव ४८५ रुपये आहे, तेव्हा दलाल मला फसवू शकत नाही."* (When it speaks the rate in Marathi, middlemen cannot cheat me).
  - **Stock Market Board**: Loved the live green/red tickers and day-high/low figures. Used it to decide whether to hold his 280 kg of copper cables until afternoon peak.
  - **QR Code Handover**: Successfully generated a lot slip with GPS and timestamp. Chakan-based authorized recycler picked up the load, verified the QR, and paid via instant bank transfer without deductions.

---

### Participant 2: Sunita Bai (Informal Waste Picker, Age 38, Mumbai)
* **Current Workflow**:
  - Cannot read English; basic literacy in Hindi and Devanagari numerals.
  - Sells separated copper wires after burning the insulation in open tins behind railway tracks (severe smoke inhalation).
* **Pain Points Identified**:
  - Constant cough and eye burns from PVC plastic combustion.
  - Hawkers pay only ₹250/kg for burnt, brittle copper.
* **Usability Testing with E-Setu**:
  - **Camera AI Classification**: Took a phone photo of unstripped cables and dead power supply unit. The app displayed the item with large pictorial icons and read out: *"Unstripped cable rate is ₹360/kg. Do not burn."*
  - **Safety Guidance Card**: Reacted strongly to the audio warning showing blackened lungs from burning cables. Noted that selling unburnt wire to Raju Shinde gave her ₹360/kg in cash without risking her health or facing fines.
  - **Cash-on-Collection**: Valued that the platform did not force bank logins or PAN cards—allowed 100% cash payments at her doorstep.

---

## 3. Key Design Iterations Derived from Field Findings
1. **Strict Margin Protection for Kabadiwalas**:
   - Ensured Customers see **retail doorstep prices**, while Kabadiwalas see **wholesale recycler stock market rates**, safeguarding the collector's 20-30% livelihood margin.
2. **Govt License Check to Filter Fake Recyclers**:
   - Field collectors voiced deep suspicion of fly-by-night buyers pretending to be "green companies". Added mandatory CPCB/MPCB Registration Number verification on the Recycler portal.
3. **High-Contrast Touch Controls**:
   - Replaced complex text fields with large `+` / `-` steppers, color cues (Green = money, Red = danger), and 1-tap audio playback.
