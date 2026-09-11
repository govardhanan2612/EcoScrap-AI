// Fast2SMS integration — "q" (Quick SMS) route: custom text, no DLT template
// pre-approval needed, works for demo/testing without waiting days for approval.
const FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

async function sendSms(phone, message) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'FAST2SMS_API_KEY is not set on the server — SMS skipped.' };
  }

  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return { sent: false, reason: `Invalid 10-digit phone number: "${phone}"` };
  }

  const params = new URLSearchParams({
    route: 'q',
    message,
    language: 'english',
    flash: '0',
    numbers: cleanPhone
  });

  try {
    const res = await fetch(`${FAST2SMS_URL}?${params.toString()}`, {
      method: 'GET',
      headers: { authorization: apiKey }
    });
    const data = await res.json();
    if (data && data.return === true) {
      return { sent: true, requestId: data.request_id };
    }
    return { sent: false, reason: (data && data.message) ? [].concat(data.message).join(', ') : 'Fast2SMS rejected the request.' };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}

function buildPriceListMessage(materialRows) {
  const lines = materialRows.map(m => `${m.symbol} Rs${m.recycler_rate}/kg`);
  return `EcoScrap AI - Today's Scrap Buying Rates: ${lines.join(', ')}. Open the app for details.`;
}

module.exports = { sendSms, buildPriceListMessage };
