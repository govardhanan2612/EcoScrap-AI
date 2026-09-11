# EcoScrap AI – Smart E-Waste Collection & Recycling Platform

♻️ A comprehensive web platform connecting informal scrap dealers (Kabadiwalas) and households to government-authorized CPCB e-waste recyclers in India.

## 🌟 Features

- **3-Role Secure Login Dashboard** – Customer, Kabadiwala (Scrap Dealer), Authorized Recycler
- **Live 10-Second Scrap Commodity Ticker** – Real-time price fluctuation with SVG charts
- **100g+ Micro-Weight Cash Calculator** – Instant doorstep pricing from just 100 grams
- **Google Maps Integration** – Live facility locations & dealer tracking with ETA
- **7 Indian Languages** – English, Hindi, Marathi, Tamil, Telugu, Kannada, Malayalam + Voice TTS
- **CPCB Form-6 EPR Compliance** – Digital recycling certificates with QR codes
- **Anti-Snoop Marketplace** – Wholesale rates hidden from public; role-based access control

## 🚀 How to Run

This is now a real full-stack app: a Node/Express backend backed by a persistent SQLite database (via Node's built-in `node:sqlite`), serving the existing frontend.

```
npm install
npm start
# Then visit http://localhost:3000
```

Data (materials & rates, registered kabadiwalas/recyclers, lots/transactions, safety guides) lives in `data/esetu.db` and survives server restarts. The database is seeded once from `server/seed-data.js` the first time it's created.

## 🔑 Demo Credentials

| Role | Credential | PIN |
|------|-----------|-----|
| Customer | Any name & phone | – |
| Kabadiwala (Raju Shinde) | `9820144521` | `4452` |
| Kabadiwala (Mohammed Bhai) | `9763218990` | `1899` |
| Recycler (MahaGreen) | `CPCB/EPR-REC/2023/MH-0842` | `8420` |

## 📁 Project Structure

```
EcoScrap AI/
├── index.html          # Main entry point
├── css/style.css       # Full responsive stylesheet
├── js/
│   ├── api.js           # Fetch client for the backend REST API
│   ├── app.js            # Application controller & all views
│   └── i18n.js           # 7-language translation engine
├── server/
│   ├── server.js         # Express app: serves the API + the static frontend
│   ├── api.js             # REST API routes (/api/*)
│   ├── db.js               # SQLite schema + one-time seed (node:sqlite)
│   └── seed-data.js        # Initial data used to seed the database
├── data/esetu.db        # Persistent SQLite database (created on first run)
└── docs/
    ├── unit_economics.md
    ├── field_research.md
    └── datasets_schema.md
```

## 👥 Team

Built for Smart India Hackathon / E-Waste Innovation Challenge.

## 📜 License

MIT License
