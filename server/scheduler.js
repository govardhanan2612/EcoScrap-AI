// Fires the daily price-list SMS broadcast automatically every morning.
// Uses a plain setTimeout/reschedule loop — no external cron needed, but only
// runs while this Node process stays alive (fine for a dev/demo server; a real
// deployment would use a persistent job scheduler instead).
const { broadcastDailyPriceList } = require('./priceNotify');

const DAILY_HOUR = 8; // 8:00 AM server-local time

function msUntilNextRun(hour) {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next - now;
}

function startDailyPriceListScheduler() {
  function scheduleNext() {
    const delay = msUntilNextRun(DAILY_HOUR);
    console.log(`[scheduler] Next daily price-list SMS broadcast in ${Math.round(delay / 60000)} minutes.`);

    setTimeout(async () => {
      console.log('[scheduler] Sending daily price-list SMS to all registered kabadiwalas...');
      try {
        const results = await broadcastDailyPriceList();
        const sentCount = results.filter(r => r.sent).length;
        console.log(`[scheduler] Daily price-list SMS sent to ${sentCount}/${results.length} kabadiwalas.`);
      } catch (err) {
        console.error('[scheduler] Daily price-list broadcast failed:', err);
      }
      scheduleNext();
    }, delay);
  }

  scheduleNext();
}

module.exports = { startDailyPriceListScheduler };
