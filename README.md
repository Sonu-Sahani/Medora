# 🏥 Medora — Healthcare Management Platform

<p align="center">
  <strong>A modern, full-stack healthcare management SaaS platform connecting Patients, Doctors, and Admins — powered by AI.</strong>
</p>

<p align="center">
  <a href="https://medora-liard-xi.vercel.app/"><strong>🔗 Live Demo</strong></a>
</p>

<p align="center">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white" />
  <img alt="Express.js" src="https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" />
</p>

---

## 📖 About

**Medora** is a full-featured healthcare management platform built on the MERN stack. It brings patients, doctors, and administrators together in one seamless system — enabling patients to discover specialists, book appointments, and receive AI-simplified medical reports, while doctors manage consultations and generate professional AI-assisted reports, and admins oversee the entire platform through a powerful analytics dashboard.

## ✨ Features

### 👤 Patient
- Register/login with email OTP verification
- Browse doctors by medical specialty (Cardiology, Dermatology, Gynecology, ENT, and more)
- View detailed doctor profiles — experience, qualifications, fees, availability, ratings & reviews
- Book appointments with real-time slot availability
- Secure payments via **Razorpay**
- View & download AI-generated medical reports (PDF)
- Get **AI-simplified summaries** of medical reports with precautions & health recommendations
- Rate and review doctors after completed consultations
- Manage personal profile & account settings
- Forgot password flow with email OTP

### 🩺 Doctor
- Dedicated dashboard with appointment stats & analytics
- Manage appointments (confirm, complete, cancel)
- View patient details and medical history
- **Rich text report editor** (Tiptap) with formatting tools
- Create & reuse custom **report templates** with quick-insert phrases
- **AI-assisted report generation** (Google Gemini) — specialty-aware medical reports
- Auto-generate professional **PDF reports** with doctor's uploaded signature
- Save reports as drafts or finalize & auto-send to patients
- Set weekly availability & consultation fee
- Upload digital signature for auto-embedding in reports

### 🛡️ Admin
- Platform-wide analytics dashboard (revenue, trends, specialty distribution)
- Create doctor accounts — auto-generated credentials emailed instantly
- Manage doctors (edit, activate/deactivate, delete)
- Manage patients (activate/deactivate, delete)
- Monitor all appointments across the platform
- Full role-based access control

### 🤖 AI Integration
- **Google Gemini API** powers specialty-specific medical report generation
- Doctor notes + patient symptoms → structured, professional draft reports
- Patient-facing reports get an AI-generated plain-language summary with precautions & recommendations

### 📄 Reports & Documents
- Auto-generated PDF reports via Puppeteer, branded and signed
- Reports stored on Cloudinary with **30-day auto-expiry**
- Manual delete option available to both doctor and patient

### 🔐 Security
- JWT-based authentication with httpOnly cookies
- Role-based authorization (Patient / Doctor / Admin)
- Email verification & OTP-based password reset
- Rate limiting, Helmet security headers, input validation

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Redux Toolkit
- React Router
- React Hook Form + Zod
- Tiptap (rich text editor)
- Recharts (analytics)
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer + Cloudinary (file storage)
- Puppeteer (PDF generation)
- Nodemailer (transactional emails)
- Razorpay (payments)
- Google Gemini API (AI reports)

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## 📂 Project Structure

```
medora/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/             # Axios API service functions
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/            # Route-level pages (patient/doctor/admin/public)
│   │   ├── routes/           # Route guards & route definitions
│   │   ├── store/            # Redux slices
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Helper functions
│   └── ...
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/            # DB, Cloudinary, AI config
│   │   ├── controllers/       # Route handlers
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   ├── middlewares/       # Auth, error handling, uploads
│   │   ├── services/           # Email, AI, PDF, token services
│   │   ├── utils/               # Helpers & seed scripts
│   │   └── validators/         # Request validation
│   └── ...
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account
- Razorpay account (test mode)
- Google Gemini API key
- Gmail account (for SMTP/App Password)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/medora.git
cd medora
```

### 2. Setup the backend
```bash
cd server
npm install
```

Create a `.env` file in `server/` (see `.env.example` for reference):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail
SMTP_PASS=your_gmail_app_password
FROM_EMAIL=your_gmail
FROM_NAME=Medora Healthcare
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

Seed initial data:
```bash
node src/utils/seedSpecialties.js
node src/utils/seedAdmin.js
```

Run the server:
```bash
npm run dev
```

### 3. Setup the frontend
```bash
cd client
npm install
```

Create a `.env` file in `client/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Run the client:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🌐 Live Demo

**Frontend:** [https://medora-liard-xi.vercel.app/](https://medora-liard-xi.vercel.app/)

> ⚠️ Note: The backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30–60 seconds to respond while the server wakes up.

---

## 🗺️ Roadmap

- [ ] Live payment mode (Razorpay KYC activation)
- [ ] Push/SMS notifications
- [ ] Video consultation integration
- [ ] Multi-language support
- [ ] Doctor availability calendar sync

---

## 📄 License

This project is for educational/portfolio purposes.

---

<p align="center">Built with ❤️ using the MERN stack</p>
