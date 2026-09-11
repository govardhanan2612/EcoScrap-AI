const express = require('express');
const { db } = require('./db');
const SEED_DATA = require('./seed-data');
const { sendPriceListSms, broadcastDailyPriceList } = require('./priceNotify');

const router = express.Router();

// ---------------------------------------------------------------
// Row <-> frontend-shape mappers
// ---------------------------------------------------------------
function rowToMaterial(row) {
  return {
    id: row.id, symbol: row.symbol, name: row.name,
    nameMr: row.name_mr, nameHi: row.name_hi, nameTa: row.name_ta,
    nameTe: row.name_te, nameKn: row.name_kn, nameMl: row.name_ml,
    icon: row.icon, unit: row.unit,
    customerRate: row.customer_rate, recyclerRate: row.recycler_rate,
    rate6hrAgo: row.rate_6hr_ago, recyclerRate6hrAgo: row.recycler_rate_6hr_ago,
    dayHigh: row.day_high, dayLow: row.day_low, volume: row.volume,
    changePct: row.change_pct, isPositive: !!row.is_positive,
    sparkline: JSON.parse(row.sparkline_json || '[]'),
    description: row.description, metals: row.metals,
    hazardLevel: row.hazard_level, properProcess: row.proper_process
  };
}

function rowToKabadiwalaAuth(row) {
  return { kabadiId: row.kabadi_id, phone: row.phone, pin: row.pin, name: row.name, yard: row.yard, location: row.location };
}

function rowToKabadiwalaDisplay(row) {
  const extra = JSON.parse(row.extra_json || '{}');
  return {
    id: `kab-${row.id}`, name: row.name, phone: row.phone, location: row.location,
    vehicle: row.vehicle, photo: row.photo, rating: row.rating, totalReviews: row.total_reviews,
    badge: row.badge, reviews: JSON.parse(row.reviews_json || '[]'),
    ...extra
  };
}

function rowToRecyclerAuth(row) {
  return { cpcbRegNo: row.cpcb_reg_no, phone: row.phone, name: row.name, facility: row.facility };
}

function rowToRecyclerDisplay(row) {
  const extra = JSON.parse(row.extra_json || '{}');
  return {
    id: `rec-${row.id}`, name: row.name, cpcbRegNo: row.cpcb_reg_no, location: row.location,
    rates: JSON.parse(row.rates_json || '{}'), rating: row.rating,
    kabadiwalaReviews: JSON.parse(row.reviews_json || '[]'),
    ...extra
  };
}

function rowToLot(row) {
  return {
    lotId: row.lot_id, date: row.created_at,
    kabadiwalaId: row.kabadiwala_id, kabadiwalaName: row.kabadiwala_name,
    recyclerId: row.recycler_id, recyclerName: row.recycler_name,
    material: row.material, symbol: row.symbol, weightKg: row.weight_kg,
    agreedRate: row.agreed_rate, totalAmount: row.total_amount,
    paymentMethod: row.payment_method, paymentStatus: row.payment_status, status: row.status,
    gpsLocation: row.gps_location, cpcbManifestNo: row.cpcb_manifest_no,
    eprCertIssued: !!row.epr_cert_issued
  };
}

function rowToSafetyGuide(row) {
  return {
    id: row.id, title: row.title, titleMr: row.title_mr, titleHi: row.title_hi,
    icon: row.icon, color: row.color, hazard: row.hazard, healthRisk: row.health_risk,
    safeMethod: row.safe_method, audioScriptEn: row.audio_script_en,
    audioScriptMr: row.audio_script_mr, audioScriptHi: row.audio_script_hi
  };
}

// ---------------------------------------------------------------
// GET /api/bootstrap — everything the frontend needs on load
// ---------------------------------------------------------------
router.get('/bootstrap', async (req, res) => {
  const [materialRows, kabadiwalaRows, recyclerRows, lotRows, safetyRows] = await Promise.all([
    db.prepare('SELECT * FROM materials').all(),
    db.prepare('SELECT * FROM kabadiwalas ORDER BY id ASC').all(),
    db.prepare('SELECT * FROM recyclers ORDER BY id ASC').all(),
    db.prepare('SELECT * FROM lots ORDER BY id DESC').all(),
    db.prepare('SELECT * FROM safety_guides').all()
  ]);

  res.json({
    materials: materialRows.map(rowToMaterial),
    predefinedKabadiwalas: kabadiwalaRows.map(rowToKabadiwalaAuth),
    kabadiwalas: kabadiwalaRows.map(rowToKabadiwalaDisplay),
    predefinedRecyclers: recyclerRows.filter(r => r.phone).map(rowToRecyclerAuth),
    recyclers: recyclerRows.filter(r => r.phone).map(rowToRecyclerDisplay),
    validCpcbRegistrations: recyclerRows.map(r => r.cpcb_reg_no),
    lots: lotRows.map(rowToLot),
    safetyGuides: safetyRows.map(rowToSafetyGuide),
    inventory: SEED_DATA.inventory,
    dailyCollectionHistory: SEED_DATA.dailyCollectionHistory,
    customerSalesHistory: SEED_DATA.customerSalesHistory,
    customerSalesSummary: SEED_DATA.customerSalesSummary,
    customerMonthlyComparison: SEED_DATA.customerMonthlyComparison
  });
});

// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------
router.post('/auth/kabadiwala-login', async (req, res) => {
  const { phone, pin } = req.body || {};
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const row = await db.prepare('SELECT * FROM kabadiwalas WHERE phone = ? AND pin = ?').get(cleanPhone, String(pin || ''));
  if (!row) return res.status(401).json({ error: 'Mobile number or Dealer PIN is not authorized.' });
  res.json({ role: 'kabadiwala', ...rowToKabadiwalaAuth(row) });
});

router.post('/auth/kabadiwala-register', async (req, res) => {
  const { name, phone, yard, vehicleType, location, latitude, longitude } = req.body || {};
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (!cleanPhone || !name) return res.status(400).json({ error: 'Name and phone are required.' });

  const existing = await db.prepare('SELECT id FROM kabadiwalas WHERE phone = ?').get(cleanPhone);
  if (existing) return res.status(409).json({ error: 'A dealer with this phone number is already registered.' });

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const kabadiId = `KAB-REG-${Math.floor(1000 + Math.random() * 9000)}`;
  const extra = {
    shopName: yard || 'My Scrap Yard',
    fullAddress: location || '',
    coordinates: hasCoords ? `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E` : '',
    googleMapsUrl: hasCoords ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : '#',
    distanceKm: 0.6, vehiclePlate: '—', status: 'Online • Verified Partner',
    etaMinutes: 20, etaDistanceKm: 0.6, transitState: 'Available for instant scheduling',
    licenseNo: '—', weighingEquipment: 'Certified digital weighing scale',
    operatingHours: '8:00 AM – 8:00 PM', materialsAccepted: 'General E-Waste & Scrap',
    cashOnCollection: true
  };

  const result = await db.prepare(`
    INSERT INTO kabadiwalas (kabadi_id, name, phone, pin, yard, location, vehicle, photo, rating, total_reviews, badge, reviews_json, extra_json, created_at)
    VALUES (@kabadiId, @name, @phone, @pin, @yard, @location, @vehicle, @photo, @rating, @totalReviews, @badge, @reviewsJson, @extraJson, @createdAt)
  `).run({
    kabadiId, name, phone: cleanPhone, pin: '1234', yard: yard || 'My Scrap Yard', location: location || '',
    vehicle: `${vehicleType || 'Tata Ace'} & Certified Scales`, photo: '👨🏽‍💼',
    rating: 5.0, totalReviews: 1, badge: 'Verified Partner',
    reviewsJson: JSON.stringify([{ customer: 'System Verification', rating: 5, date: 'Today', text: 'Digital weighing scale verified.' }]),
    extraJson: JSON.stringify(extra), createdAt: new Date().toISOString()
  });

  const row = await db.prepare('SELECT * FROM kabadiwalas WHERE id = ?').get(result.lastInsertRowid);
  const smsResult = await sendPriceListSms(row.kabadi_id, row.phone);
  res.status(201).json({ role: 'kabadiwala', ...rowToKabadiwalaAuth(row), sms: smsResult });
});

// Recycler access is a self-registration model (like kabadiwala): the first time a
// CPCB/SPCB registration number logs in, it's registered for real; every login after
// that authenticates against that same real row. There's no pre-seeded "valid" list —
// nothing is faked, so nothing needs to be pre-approved.
router.post('/auth/recycler-login', async (req, res) => {
  const { govRegNo, name, phone, location, latitude, longitude } = req.body || {};
  const cleanReg = String(govRegNo || '').trim().toUpperCase();
  if (!cleanReg) return res.status(400).json({ error: 'CPCB/SPCB registration number is required.' });

  let row = await db.prepare('SELECT * FROM recyclers WHERE UPPER(cpcb_reg_no) = ?').get(cleanReg);

  if (!row) {
    if (!name || !phone) {
      return res.status(400).json({ error: 'First-time registration needs a facility name and phone number.' });
    }

    const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
    const extra = {
      mpcbAuthDate: 'Registered via EcoScrap AI',
      fullAddress: location || '',
      coordinates: hasCoords ? `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E` : '',
      googleMapsUrl: hasCoords ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : '#',
      distanceKm: 0, capacity: '—', kabadiwalaReviewsCount: 0,
      doorstepPickup: 'Contact facility to confirm', minLotKg: 0,
      paymentTerms: 'To be confirmed with facility', verifiedBadge: 'Registered Facility',
      operatingHours: 'Contact facility', weighbridgeTech: '—',
      collectionTruckETA: 0, collectionTruckStatus: 'Contact facility to arrange pickup'
    };

    const result = await db.prepare(`
      INSERT INTO recyclers (cpcb_reg_no, name, phone, facility, location, rates_json, rating, reviews_json, extra_json, created_at)
      VALUES (@cpcbRegNo, @name, @phone, @facility, @location, '{}', 0, '[]', @extraJson, @createdAt)
    `).run({
      cpcbRegNo: cleanReg, name, phone, facility: location || '', location: location || '',
      extraJson: JSON.stringify(extra), createdAt: new Date().toISOString()
    });

    row = await db.prepare('SELECT * FROM recyclers WHERE id = ?').get(result.lastInsertRowid);
  }

  res.json({
    role: 'recycler',
    govRegNo: row.cpcb_reg_no,
    name: row.name,
    phone: row.phone,
    location: row.facility || row.location
  });
});

// ---------------------------------------------------------------
// Lots
// ---------------------------------------------------------------
router.get('/lots', async (req, res) => {
  const { recyclerId, kabadiwalaId } = req.query;
  let rows;
  if (recyclerId) rows = await db.prepare('SELECT * FROM lots WHERE recycler_id = ? ORDER BY id DESC').all(recyclerId);
  else if (kabadiwalaId) rows = await db.prepare('SELECT * FROM lots WHERE kabadiwala_id = ? ORDER BY id DESC').all(kabadiwalaId);
  else rows = await db.prepare('SELECT * FROM lots ORDER BY id DESC').all();
  res.json(rows.map(rowToLot));
});

router.post('/lots', async (req, res) => {
  const { kabadiwalaId, kabadiwalaName, recyclerId, recyclerName, materialId, weightKg, paymentMethod } = req.body || {};
  const material = await db.prepare('SELECT * FROM materials WHERE id = ?').get(materialId);
  if (!material) return res.status(400).json({ error: 'Unknown material.' });

  const weight = Number(weightKg) || 0;
  if (weight <= 0) return res.status(400).json({ error: 'Weight must be greater than zero.' });

  const lotId = `LOT-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const cpcbManifestNo = `MH-EPR-MAN-${Math.floor(100000 + Math.random() * 900000)}`;
  const totalAmount = weight * material.recycler_rate;

  await db.prepare(`
    INSERT INTO lots (lot_id, kabadiwala_id, kabadiwala_name, recycler_id, recycler_name, material, symbol,
      weight_kg, agreed_rate, total_amount, payment_method, payment_status, status, gps_location,
      cpcb_manifest_no, epr_cert_issued, created_at)
    VALUES (@lotId, @kabadiwalaId, @kabadiwalaName, @recyclerId, @recyclerName, @material, @symbol,
      @weightKg, @agreedRate, @totalAmount, @paymentMethod, 'Pending Inspection', 'In Transit / Gate Handover Booked',
      @gpsLocation, @cpcbManifestNo, 0, @createdAt)
  `).run({
    lotId, kabadiwalaId: kabadiwalaId || '', kabadiwalaName: kabadiwalaName || 'Unknown Collector',
    recyclerId: recyclerId || '', recyclerName: recyclerName || 'Unknown Recycler',
    material: material.name, symbol: material.symbol, weightKg: weight,
    agreedRate: material.recycler_rate, totalAmount,
    paymentMethod: paymentMethod || 'Cash at Gate', gpsLocation: '18.5074° N, 73.8077° E',
    cpcbManifestNo, createdAt: new Date().toLocaleString()
  });

  const row = await db.prepare('SELECT * FROM lots WHERE lot_id = ?').get(lotId);
  res.status(201).json(rowToLot(row));
});

router.patch('/lots/:lotId/confirm-payment', async (req, res) => {
  const row = await db.prepare('SELECT * FROM lots WHERE lot_id = ?').get(req.params.lotId);
  if (!row) return res.status(404).json({ error: 'Lot not found.' });

  await db.prepare(`UPDATE lots SET payment_status = 'Paid', status = 'Recycled & Verified', epr_cert_issued = 1 WHERE lot_id = ?`)
    .run(req.params.lotId);

  const updated = await db.prepare('SELECT * FROM lots WHERE lot_id = ?').get(req.params.lotId);
  res.json(rowToLot(updated));
});

// ---------------------------------------------------------------
// Materials — recycler rate updates
// ---------------------------------------------------------------
router.patch('/materials/:id/rate', async (req, res) => {
  const material = await db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  if (!material) return res.status(404).json({ error: 'Material not found.' });

  const newRate = Number(req.body && req.body.recyclerRate);
  if (!newRate || newRate <= 0) return res.status(400).json({ error: 'recyclerRate must be a positive number.' });

  await db.prepare('UPDATE materials SET recycler_rate_6hr_ago = recycler_rate, recycler_rate = ? WHERE id = ?')
    .run(newRate, req.params.id);

  const updated = await db.prepare('SELECT * FROM materials WHERE id = ?').get(req.params.id);
  res.json(rowToMaterial(updated));
});

// ---------------------------------------------------------------
// Price-list SMS — resend on demand, or trigger the daily broadcast now
// (the real broadcast also fires automatically every morning; see server/scheduler.js)
// ---------------------------------------------------------------
router.post('/kabadiwalas/:kabadiId/send-price-sms', async (req, res) => {
  const row = await db.prepare('SELECT * FROM kabadiwalas WHERE kabadi_id = ?').get(req.params.kabadiId);
  if (!row) return res.status(404).json({ error: 'Kabadiwala not found.' });

  const result = await sendPriceListSms(row.kabadi_id, row.phone);
  res.json(result);
});

router.post('/notifications/send-daily-price-list', async (req, res) => {
  const results = await broadcastDailyPriceList();
  res.json({ sentCount: results.filter(r => r.sent).length, total: results.length, results });
});

// ---------------------------------------------------------------
// Direct In-App Connect — one chat thread per (kabadiwala, recycler) pair
// ---------------------------------------------------------------
function rowToMessage(row) {
  return {
    id: row.id, kabadiwalaId: row.kabadiwala_id, recyclerId: row.recycler_id,
    senderRole: row.sender_role, senderName: row.sender_name,
    body: row.body, createdAt: row.created_at
  };
}

router.get('/messages', async (req, res) => {
  const { kabadiwalaId, recyclerId } = req.query;
  if (!kabadiwalaId || !recyclerId) return res.status(400).json({ error: 'kabadiwalaId and recyclerId are required.' });

  const rows = await db.prepare('SELECT * FROM messages WHERE kabadiwala_id = ? AND recycler_id = ? ORDER BY id ASC')
    .all(kabadiwalaId, recyclerId);
  res.json(rows.map(rowToMessage));
});

router.post('/messages', async (req, res) => {
  const { kabadiwalaId, recyclerId, senderRole, senderName, body } = req.body || {};
  if (!kabadiwalaId || !recyclerId || !senderRole || !body || !body.trim()) {
    return res.status(400).json({ error: 'kabadiwalaId, recyclerId, senderRole, and body are required.' });
  }

  const result = await db.prepare(`
    INSERT INTO messages (kabadiwala_id, recycler_id, sender_role, sender_name, body, created_at)
    VALUES (@kabadiwalaId, @recyclerId, @senderRole, @senderName, @body, @createdAt)
  `).run({
    kabadiwalaId, recyclerId, senderRole, senderName: senderName || 'User',
    body: body.trim(), createdAt: new Date().toISOString()
  });

  const row = await db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToMessage(row));
});

module.exports = router;
