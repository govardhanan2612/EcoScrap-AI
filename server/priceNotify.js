// Shared price-list SMS logic — used on registration, manual resend, and the daily broadcast.
const { db } = require('./db');
const { sendSms, buildPriceListMessage } = require('./sms');

async function sendPriceListSms(kabadiId, phone) {
  const materialRows = await db.prepare('SELECT * FROM materials').all();
  const message = buildPriceListMessage(materialRows);
  const result = await sendSms(phone, message);

  await db.prepare(`
    INSERT INTO sms_log (phone, kabadi_id, message, sent, reason, created_at)
    VALUES (@phone, @kabadiId, @message, @sent, @reason, @createdAt)
  `).run({
    phone, kabadiId, message, sent: result.sent ? 1 : 0,
    reason: result.reason || null, createdAt: new Date().toISOString()
  });

  return result;
}

async function broadcastDailyPriceList() {
  const kabadiwalas = await db.prepare('SELECT kabadi_id, phone FROM kabadiwalas').all();
  const results = [];
  for (const k of kabadiwalas) {
    const result = await sendPriceListSms(k.kabadi_id, k.phone);
    results.push({ kabadiId: k.kabadi_id, phone: k.phone, ...result });
  }
  return results;
}

module.exports = { sendPriceListSms, broadcastDailyPriceList };
