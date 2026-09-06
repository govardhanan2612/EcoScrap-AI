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

Simply open `index.html` in any modern browser (Chrome, Edge, Firefox). No server or installation needed.

```
# Or serve locally:
python -m http.server 8080
# Then visit http://localhost:8080
```

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
│   ├── app.js          # Application controller & all views
│   ├── datasets.js     # Predefined data, credentials & recycler info
│   └── i18n.js         # 7-language translation engine
└── docs/
    ├── unit_economics.md
    ├── field_research.md
    └── datasets_schema.md
```

## 👥 Team

Built for Smart India Hackathon / E-Waste Innovation Challenge.

## 📜 License

MIT License
