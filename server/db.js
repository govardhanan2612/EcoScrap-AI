// E-Setu real persistence layer — libSQL (SQLite-compatible).
// Locally this talks to a plain file (data/esetu.db) with zero setup, just like before.
// In production it points at Turso (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN) — same client,
// same SQL, same code path either way, so nothing behaves differently between the two.
const path = require('node:path');
const fs = require('node:fs');
const { createClient } = require('@libsql/client');
const SEED_DATA = require('./seed-data');

const usingTurso = !!process.env.TURSO_DATABASE_URL;
console.log('[db] TURSO_DATABASE_URL present:', usingTurso);

// Only touch the local filesystem when actually falling back to a local file —
// serverless platforms (Vercel) have a read-only filesystem and would crash
// on this mkdir even though they never use the path (they always set Turso vars).
// Wrapped defensively too: a failure here should never be fatal on its own.
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!usingTurso) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('[db] Could not create local data dir (non-fatal):', err.message);
  }
}

const url = usingTurso ? process.env.TURSO_DATABASE_URL : `file:${path.join(DATA_DIR, 'esetu.db')}`;
const client = createClient(usingTurso ? { url, authToken: process.env.TURSO_AUTH_TOKEN } : { url });

// Call-site compatibility shim: every existing call is either
//   db.prepare(sql).get/all/run({ named: 'params' })   — used for INSERT/UPDATE
//   db.prepare(sql).get/all/run(pos1, pos2, ...)        — used for '?' SELECT filters
// libSQL's execute() accepts either shape as `args`, so this just routes to it async.
function toLibsqlArgs(args) {
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    return args[0];
  }
  return args;
}

const db = {
  async exec(sql) {
    await client.executeMultiple(sql);
  },
  prepare(sql) {
    return {
      async get(...args) {
        const result = await client.execute({ sql, args: toLibsqlArgs(args) });
        return result.rows[0] ? { ...result.rows[0] } : undefined;
      },
      async all(...args) {
        const result = await client.execute({ sql, args: toLibsqlArgs(args) });
        return result.rows.map((r) => ({ ...r }));
      },
      async run(...args) {
        const result = await client.execute({ sql, args: toLibsqlArgs(args) });
        return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
      }
    };
  }
};

async function createSchema() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      symbol TEXT UNIQUE,
      name TEXT, name_mr TEXT, name_hi TEXT, name_ta TEXT, name_te TEXT, name_kn TEXT, name_ml TEXT,
      icon TEXT, unit TEXT,
      customer_rate REAL, recycler_rate REAL, rate_6hr_ago REAL, recycler_rate_6hr_ago REAL,
      day_high REAL, day_low REAL, volume TEXT, change_pct TEXT, is_positive INTEGER,
      sparkline_json TEXT, description TEXT, metals TEXT, hazard_level TEXT, proper_process TEXT
    );

    CREATE TABLE IF NOT EXISTS kabadiwalas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kabadi_id TEXT UNIQUE,
      name TEXT, phone TEXT UNIQUE, pin TEXT, yard TEXT, location TEXT,
      vehicle TEXT, photo TEXT, rating REAL, total_reviews INTEGER, badge TEXT,
      reviews_json TEXT, extra_json TEXT, created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS recyclers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cpcb_reg_no TEXT UNIQUE,
      name TEXT, phone TEXT, facility TEXT, location TEXT,
      rates_json TEXT, rating REAL, reviews_json TEXT, extra_json TEXT, created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lot_id TEXT UNIQUE,
      kabadiwala_id TEXT, kabadiwala_name TEXT,
      recycler_id TEXT, recycler_name TEXT,
      material TEXT, symbol TEXT, weight_kg REAL, agreed_rate REAL, total_amount REAL,
      payment_method TEXT, payment_status TEXT, status TEXT,
      gps_location TEXT, cpcb_manifest_no TEXT, epr_cert_issued INTEGER,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS safety_guides (
      id TEXT PRIMARY KEY,
      title TEXT, title_mr TEXT, title_hi TEXT, icon TEXT, color TEXT,
      hazard TEXT, health_risk TEXT, safe_method TEXT,
      audio_script_en TEXT, audio_script_mr TEXT, audio_script_hi TEXT
    );

    CREATE TABLE IF NOT EXISTS sms_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT, kabadi_id TEXT, message TEXT,
      sent INTEGER, reason TEXT, created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kabadiwala_id TEXT NOT NULL,
      recycler_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(kabadiwala_id, recycler_id);
  `);
}

async function seedIfEmpty() {
  const countRow = await db.prepare('SELECT COUNT(*) AS c FROM materials').get();
  if (Number(countRow.c) > 0) return; // already seeded on a previous run

  const insertMaterial = db.prepare(`
    INSERT INTO materials (id, symbol, name, name_mr, name_hi, name_ta, name_te, name_kn, name_ml,
      icon, unit, customer_rate, recycler_rate, rate_6hr_ago, recycler_rate_6hr_ago,
      day_high, day_low, volume, change_pct, is_positive, sparkline_json, description, metals, hazard_level, proper_process)
    VALUES (@id, @symbol, @name, @nameMr, @nameHi, @nameTa, @nameTe, @nameKn, @nameMl,
      @icon, @unit, @customerRate, @recyclerRate, @rate6hrAgo, @recyclerRate6hrAgo,
      @dayHigh, @dayLow, @volume, @changePct, @isPositive, @sparklineJson, @description, @metals, @hazardLevel, @properProcess)
  `);
  for (const m of SEED_DATA.materials) {
    await insertMaterial.run({
      id: m.id, symbol: m.symbol, name: m.name, nameMr: m.nameMr, nameHi: m.nameHi,
      nameTa: m.nameTa, nameTe: m.nameTe, nameKn: m.nameKn, nameMl: m.nameMl,
      icon: m.icon, unit: m.unit, customerRate: m.customerRate, recyclerRate: m.recyclerRate,
      rate6hrAgo: m.rate6hrAgo, recyclerRate6hrAgo: m.recyclerRate6hrAgo,
      dayHigh: m.dayHigh, dayLow: m.dayLow, volume: m.volume, changePct: m.changePct,
      isPositive: m.isPositive ? 1 : 0, sparklineJson: JSON.stringify(m.sparkline),
      description: m.description, metals: m.metals, hazardLevel: m.hazardLevel, properProcess: m.properProcess
    });
  }

  const insertKabadiwala = db.prepare(`
    INSERT INTO kabadiwalas (kabadi_id, name, phone, pin, yard, location, vehicle, photo, rating, total_reviews, badge, reviews_json, extra_json, created_at)
    VALUES (@kabadiId, @name, @phone, @pin, @yard, @location, @vehicle, @photo, @rating, @totalReviews, @badge, @reviewsJson, @extraJson, @createdAt)
  `);
  const KABADIWALA_CORE_FIELDS = new Set(['id', 'name', 'phone', 'location', 'vehicle', 'photo', 'rating', 'totalReviews', 'badge', 'reviews']);
  for (const auth of SEED_DATA.predefinedKabadiwalas) {
    const idx = SEED_DATA.predefinedKabadiwalas.indexOf(auth);
    const display = SEED_DATA.kabadiwalas[idx] || {};
    const extra = {};
    for (const key of Object.keys(display)) {
      if (!KABADIWALA_CORE_FIELDS.has(key)) extra[key] = display[key];
    }
    await insertKabadiwala.run({
      kabadiId: auth.kabadiId, name: auth.name, phone: auth.phone, pin: auth.pin,
      yard: auth.yard, location: auth.location,
      vehicle: display.vehicle || 'Scrap Collection Vehicle', photo: display.photo || '👨🏽‍💼',
      rating: display.rating || 4.5, totalReviews: display.totalReviews || 0,
      badge: display.badge || 'Verified E-Setu Partner',
      reviewsJson: JSON.stringify(display.reviews || []),
      extraJson: JSON.stringify(extra),
      createdAt: new Date().toISOString()
    });
  }

  const insertRecycler = db.prepare(`
    INSERT INTO recyclers (cpcb_reg_no, name, phone, facility, location, rates_json, rating, reviews_json, extra_json, created_at)
    VALUES (@cpcbRegNo, @name, @phone, @facility, @location, @ratesJson, @rating, @reviewsJson, @extraJson, @createdAt)
  `);
  const RECYCLER_CORE_FIELDS = new Set(['id', 'name', 'cpcbRegNo', 'location', 'rates', 'rating', 'kabadiwalaReviews']);
  for (const auth of SEED_DATA.predefinedRecyclers) {
    const display = SEED_DATA.recyclers.find(r => r.cpcbRegNo === auth.cpcbRegNo) || {};
    const extra = {};
    for (const key of Object.keys(display)) {
      if (!RECYCLER_CORE_FIELDS.has(key)) extra[key] = display[key];
    }
    await insertRecycler.run({
      cpcbRegNo: auth.cpcbRegNo, name: auth.name, phone: auth.phone, facility: auth.facility,
      location: display.location || auth.facility,
      ratesJson: JSON.stringify(display.rates || {}),
      rating: display.rating || 4.5,
      reviewsJson: JSON.stringify(display.kabadiwalaReviews || []),
      extraJson: JSON.stringify(extra),
      createdAt: new Date().toISOString()
    });
  }
  const extraValid = SEED_DATA.validCpcbRegistrations.filter(
    no => !SEED_DATA.predefinedRecyclers.some(r => r.cpcbRegNo === no)
  );
  for (const cpcbRegNo of extraValid) {
    await insertRecycler.run({
      cpcbRegNo, name: 'Authorized Recycler (Not Yet Onboarded)', phone: '', facility: '',
      location: '', ratesJson: '{}', rating: 0, reviewsJson: '[]', extraJson: '{}', createdAt: new Date().toISOString()
    });
  }

  const insertLot = db.prepare(`
    INSERT INTO lots (lot_id, kabadiwala_id, kabadiwala_name, recycler_id, recycler_name, material, symbol,
      weight_kg, agreed_rate, total_amount, payment_method, payment_status, status, gps_location,
      cpcb_manifest_no, epr_cert_issued, created_at)
    VALUES (@lotId, @kabadiwalaId, @kabadiwalaName, @recyclerId, @recyclerName, @material, @symbol,
      @weightKg, @agreedRate, @totalAmount, @paymentMethod, @paymentStatus, @status, @gpsLocation,
      @cpcbManifestNo, @eprCertIssued, @createdAt)
  `);
  for (const lot of SEED_DATA.lots) {
    await insertLot.run({
      lotId: lot.lotId, kabadiwalaId: lot.kabadiwalaId, kabadiwalaName: lot.kabadiwalaName,
      recyclerId: lot.recyclerId, recyclerName: lot.recyclerName, material: lot.material, symbol: lot.symbol,
      weightKg: lot.weightKg, agreedRate: lot.agreedRate, totalAmount: lot.totalAmount,
      paymentMethod: lot.paymentMethod, paymentStatus: lot.paymentStatus, status: lot.status,
      gpsLocation: lot.gpsLocation, cpcbManifestNo: lot.cpcbManifestNo,
      eprCertIssued: lot.eprCertIssued ? 1 : 0, createdAt: lot.date
    });
  }

  const insertSafety = db.prepare(`
    INSERT INTO safety_guides (id, title, title_mr, title_hi, icon, color, hazard, health_risk, safe_method,
      audio_script_en, audio_script_mr, audio_script_hi)
    VALUES (@id, @title, @titleMr, @titleHi, @icon, @color, @hazard, @healthRisk, @safeMethod,
      @audioScriptEn, @audioScriptMr, @audioScriptHi)
  `);
  for (const g of SEED_DATA.safetyGuides) {
    await insertSafety.run(g);
  }
}

let initPromise = null;
function initDb() {
  if (!initPromise) {
    initPromise = (async () => {
      await createSchema();
      await seedIfEmpty();
    })();
  }
  return initPromise;
}

module.exports = { db, initDb };
