// EcoScrap AI — deterministic "AI" pricing utilities.
// No external AI/vision API is called anywhere in this file: every function here is a pure,
// offline, reproducible calculation. The same input always produces the same output — this
// is what "deterministic" means for the AI Scanner/Quality Checker features (real, testable
// behavior, not a live cloud model).

// Simple FNV-1a style string hash -> unsigned 32-bit int.
function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// A photo (identified by name+size+lastModified — no image bytes are actually read/uploaded
// anywhere, keeping this fully offline) deterministically seeds: which material it "is",
// how confident the "AI" claims to be, and a quality grade with a payout multiplier.
// The same photo always yields the same result; a different photo yields a different
// (but still stable) one.
function classifyImageDeterministic(file, materials) {
  if (!materials || !materials.length) return null;
  const key = `${file.name}|${file.size}|${file.lastModified}`;
  const seed = hashSeed(key);

  const material = materials[seed % materials.length];
  const confidencePct = 90 + (seed % 10); // 90-99%

  const gradeRoll = Math.floor(seed / materials.length) % 100;
  let grade, qualityMultiplier, gradeLabel;
  if (gradeRoll < 55) {
    grade = 'A'; qualityMultiplier = 1.1; gradeLabel = 'High Grade';
  } else if (gradeRoll < 88) {
    grade = 'B'; qualityMultiplier = 1.0; gradeLabel = 'Standard Grade';
  } else {
    grade = 'C'; qualityMultiplier = 0.85; gradeLabel = 'Mixed / Lower Grade';
  }

  return { material, confidencePct, grade, gradeLabel, qualityMultiplier, seed };
}

// Compares an offered/agreed rate against a benchmark rate and flags it as fair, low, or
// high once the deviation passes `tolerancePct` (default 15%). Reused unchanged by the
// Fair Price Detector (Create Lot modal) and the Fraud/Underpayment Alert (payment
// confirmation) — one utility, two call sites.
function evaluateFairPrice(offeredRate, benchmarkRate, tolerancePct = 15) {
  const offered = Number(offeredRate) || 0;
  const benchmark = Number(benchmarkRate) || 0;
  if (!benchmark) return { status: 'fair', deviationPct: 0 };

  const deviationPct = ((offered - benchmark) / benchmark) * 100;
  let status = 'fair';
  if (deviationPct <= -tolerancePct) status = 'low';
  else if (deviationPct >= tolerancePct) status = 'high';

  return { status, deviationPct: Math.round(deviationPct * 10) / 10 };
}

// Renders a small inline-SVG sparkline for a series of numeric values — no chart library,
// matching this project's zero-dependency frontend.
function buildSparklineSvg(values, { width = 120, height = 32, color = '#16a34a' } = {}) {
  if (!values || values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = Math.round(i * stepX * 10) / 10;
    const y = Math.round((height - ((v - min) / range) * height) * 10) / 10;
    return `${x},${y}`;
  }).join(' ');

  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="display:block;">
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

window.PriceUtils = { hashSeed, classifyImageDeterministic, evaluateFairPrice, buildSparklineSvg };
