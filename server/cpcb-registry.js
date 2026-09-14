// A small, local, illustrative mirror of CPCB/SPCB-style e-waste authorization registration
// numbers, in the real-world format (e.g. "CPCB/EPR-REC/2023/MH-0842"). This is NOT a live
// connection to the actual Government of India CPCB registry — no such public API is
// available to this app — so it is documented honestly as a local reference list, not
// presented as a real-time government lookup.
const KNOWN_CPCB_REGISTRATIONS = new Set([
  'CPCB/EPR-REC/2023/MH-0842',
  'CPCB/EPR-REC/2022/DL-0117',
  'CPCB/EPR-REC/2023/KA-0356',
  'CPCB/EPR-REC/2021/TN-0289',
  'CPCB/EPR-REC/2024/GJ-0501',
  'CPCB/EPR-REC/2022/UP-0674',
  'CPCB/EPR-REC/2023/WB-0198',
  'CPCB/EPR-REC/2024/RJ-0733',
  'CPCB/EPR-REC/2021/PB-0245',
  'CPCB/EPR-REC/2023/AP-0412'
]);

// A CPCB/SPCB registration number generally looks like: CPCB/EPR-REC/<year>/<state>-<serial>
const CPCB_FORMAT_REGEX = /^CPCB\/EPR-REC\/\d{4}\/[A-Z]{2}-\d{3,5}$/;

function checkCpcbRegistration(regNo) {
  const clean = String(regNo || '').trim().toUpperCase();
  const formatValid = CPCB_FORMAT_REGEX.test(clean);
  const foundInMirror = KNOWN_CPCB_REGISTRATIONS.has(clean);
  return { formatValid, foundInMirror, verified: formatValid && foundInMirror };
}

module.exports = { checkCpcbRegistration, KNOWN_CPCB_REGISTRATIONS };
