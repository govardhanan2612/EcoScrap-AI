require('./env').loadEnv();

const path = require('node:path');
const express = require('express');
const { initDb } = require('./db');
const apiRouter = require('./api');
const { startDailyPriceListScheduler } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', apiRouter);

const PROJECT_ROOT = path.join(__dirname, '..');
app.use(express.static(PROJECT_ROOT));

app.get('*', (req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'index.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`EcoScrap AI server running at http://localhost:${PORT}`);
      console.log(`  [db] ${process.env.TURSO_DATABASE_URL ? 'Turso (remote)' : 'local file (data/esetu.db)'}`);
      if (!process.env.FAST2SMS_API_KEY) {
        console.log('  [sms] FAST2SMS_API_KEY not set in .env — price-list SMS will be skipped (logged, not sent).');
      }
      startDailyPriceListScheduler();
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
