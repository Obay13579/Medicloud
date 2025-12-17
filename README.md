# 🏥 MediCloud - Clinic Management System

**MediCloud** is a Multi-tenant Cloud-based Clinic Practice Management System designed for small to medium clinics in Indonesia.
Built with a modern **Monorepo Architecture** for seamless full-stack development.

---

## 📖 Background & Solution Overview

### Problem Statement
**Masalah yang Dihadapi Klinik Kecil-Menengah di Indonesia:**

* **💰 Biaya Setup IT Tinggi:** Sistem tradisional butuh Rp 50-100 juta (setup) + maintenance bulanan. Klinik kecil tidak mampu.
* **📝 Operasional Manual & Inefisien:** Rekam medis kertas (80%), appointment via WhatsApp (chaos), dan stock opname manual.
* **🧩 Fragmentasi Data:** Pasien pindah klinik = history hilang. Hasil lab kertas sering rusak/hilang.
* **🕸️ Teknologi Tertinggal:** Software *on-premise*, tidak scalable, update ribet, dan akses hanya bisa dari lokasi klinik.

### Solution Overview
**MediCloud: Multi-tenant Cloud-based Practice Management System**

> **Core Value:** "Memungkinkan klinik kecil-menengah untuk beroperasi se-profesional rumah sakit besar, dengan biaya 90% lebih murah melalui shared cloud infrastructure."

**Key Features:**
1. **Multi-tenant Architecture:** 1 Platform melayani 100+ klinik dengan isolasi data ketat & cost sharing.
2. **Complete Practice Management:** EMR, Appointment, Pharmacy, Billing, & Analytics.
3. **Cloud-native:** Akses dari browser mana saja, auto-update (CI/CD), zero maintenance manual.
4. **Affordable:** Model langganan "Pay-as-you-grow" tanpa biaya di muka.

---

## 🛠️ Tech Stack

### **Frontend (`/frontend`)**
- **Framework:** React 18 + Vite (TypeScript)
- **UI Library:** Shadcn UI + Tailwind CSS v3
- **State Management:** Zustand
- **Form:** React Hook Form + Zod
- **Package Manager:** `pnpm`

### **Backend (`/backend`)**
- **Runtime:** Node.js v20 (Express.js + TypeScript)
- **Database ORM:** Prisma ORM v5 (Stable)
- **Auth:** JWT + Bcrypt
- **Architecture:** Controller-Service-Repository pattern

### **Infrastructure**
- **Database:** PostgreSQL 16 (Containerized via Docker)
- **DevOps:** Docker Compose, GitHub Actions (CI/CD)

---

## 📂 Project Structure
```text
medicloud/
├── docker-compose.yml      # 🗄️ Database Service Config (PostgreSQL)
├── setup_env.sh            # ⚡ Script Automasi Setup Linux Environment
├── package.json            # 🚀 Root scripts (Monorepo orchestration)
├── README.md               # 📖 Documentation
│
├── backend/                # 🧠 Server Side
│   ├── src/
│   │   ├── app.ts          # Express App Logic
│   │   ├── index.ts        # Server Entry Point
│   │   └── ...             # Controllers, Routes, Middlewares
│   ├── prisma/
│   │   └── schema.prisma   # Database Schema (Single Source of Truth)
│   └── .env                # Backend Config (DB Connection)
│
└── frontend/               # 💅 Client Side
    ├── src/
    │   ├── components/
    │   │   ├── ui/             # Shadcn Components
    │   │   ├── shared/         # Shared components (Logo, etc)
    │   │   └── layouts/        # Layout components
    │   │       ├── PublicLayout.tsx   # Marketing layout
    │   │       └── AppLayout.tsx      # Dashboard layout
    │   ├── features/           # Feature modules
    │   │   ├── auth/           # Authentication features
    │   │   ├── marketing/      # Landing page components
    │   │   ├── dashboard/      # Dashboard widgets
    │   │   ├── patient/        # Patient management
    │   │   ├── appointment/    # Appointment features
    │   │   └── emr/            # Medical records
    │   ├── pages/              # Page components
    │   │   ├── public/         # Marketing pages
    │   │   ├── app/            # Application pages
    │   │   └── auth/           # Auth pages
    │   ├── lib/
    │   │   ├── api.ts          # Axios instance
    │   │   └── utils.ts        # Tailwind utilities
    │   └── App.tsx             # Routing setup
    └── .env                    # Frontend Config
```

---

## 🗺️ Frontend Structure & API Mapping

### Frontend Directory Structure (Detailed)
```text
frontend/src/
├── components/
│   ├── ui/                     # Shadcn components (Button, Card, Input)
│   ├── shared/                 # Components shared across Public & App (Logo, etc)
│   ├── layouts/                # 👈 KEY: Layout Separation
│   │   ├── PublicLayout.tsx    # Marketing Layout (Transparent Navbar, Large Footer)
│   │   └── AppLayout.tsx       # Dashboard Layout (Left Sidebar, Top User Bar)
│
├── features/                   # Feature Logic (By Module)
│   ├── auth/                   # Login/Register forms
│   ├── marketing/              # Landing Page components (Hero, PricingCard)
│   ├── dashboard/              # Dashboard stats widgets
│   ├── patient/                # Patient tables & forms
│   ├── appointment/            # Calendar & Booking forms
│   └── emr/                    # Medical record forms
│
├── pages/                      # 👈 PAGE ORGANIZATION
│   ├── public/                 # Marketing Pages (Landing Site)
│   │   ├── LandingPage.tsx
│   │   ├── PricingPage.tsx
│   │   ├── FeaturesPage.tsx
│   │   └── SignupPage.tsx
│   │
│   ├── app/                    # Application Pages (After Login)
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── PatientList.tsx
│   │   ├── doctor/
│   │   │   └── DoctorDashboard.tsx
│   │   └── patient/
│   │       └── PatientPortal.tsx
│   │
│   └── auth/                   # Auth Pages (Login/Forgot Password)
│       └── LoginPage.tsx
│
├── lib/
│   ├── api.ts                  # Axios Instance
│   └── utils.ts                # Tailwind merge utility
│
└── App.tsx                     # Routing Setup
```

### Page UI to Backend API Mapping

Panduan untuk Frontend Developer: endpoint mana yang harus dipanggil di setiap halaman.

#### A. Marketing / Public Pages (No Auth / Tenant Creation)

| Page UI | Action | Backend Endpoint |
|---------|--------|------------------|
| Landing Page | - | (Static Content) |
| Pricing Page | - | (Static Content) |
| Login Page | Submit Login | `POST /api/auth/login` |
| Sign Up Page | 1. Submit Data Klinik<br>2. Auto-login (after signup) | `POST /api/tenants`<br>`POST /api/auth/login` |
| Onboarding | Update Settings | `PATCH /api/tenants/:slug` |

#### B. Patient Portal

| Page UI | Action | Backend Endpoint |
|---------|--------|------------------|
| Register/Login | Auth Pasien | `POST /api/auth/login` (Role: Patient) |
| Booking Appointment | 1. Get Clinic Info<br>2. List Doctors<br>3. Submit Booking | `GET /api/tenants/:slug`<br>`GET /api/:tenant/users` (Role: Doctor)<br>`POST /api/:tenant/appointments` |
| Dashboard | List Appointments | `GET /api/:tenant/appointments` (Filter: My ID) |
| Medical Records | View History | `GET /api/:tenant/patients/:id/records` |

#### C. Admin/Staff Dashboard

| Page UI | Action | Backend Endpoint |
|---------|--------|------------------|
| Dashboard | Load Stats | `GET /api/:tenant/analytics/dashboard` |
| Queue Management | 1. List Queue<br>2. Check-in Patient | `GET /api/:tenant/appointments` (Filter: Today)<br>`POST /api/:tenant/appointments/:id/checkin` |
| Patient Management | CRUD Patient | `GET, POST, PATCH, DELETE /api/:tenant/patients` |

#### D. Doctor Dashboard

| Page UI | Action | Backend Endpoint |
|---------|--------|------------------|
| Queue | Call Patient | `PATCH /api/:tenant/appointments/:id` (Status: In Progress) |
| EMR Page | 1. Input SOAP<br>2. Input Resep | `POST /api/:tenant/records`<br>`POST /api/:tenant/prescriptions` |

#### E. Pharmacy Dashboard

| Page UI | Action | Backend Endpoint |
|---------|--------|------------------|
| Prescription List | View Incoming | `GET /api/:tenant/prescriptions` (Status: Pending) |
| Process | Mark Done | `PATCH /api/:tenant/prescriptions/:id/status` |
| Inventory | Manage Stock | `GET, POST, PATCH /api/:tenant/inventory` |

---

## 🔌 Backend API Specification (Target 5 Days)

Berikut adalah daftar endpoint utama yang harus diimplementasikan.

### 1. Authentication
```http
POST   /api/auth/register          # Register new admin/user
POST   /api/auth/login             # Login & Get Token
POST   /api/auth/refresh-token     # Refresh JWT
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Get current user profile
```

### 2. Tenant Management (Clinic)
```http
POST   /api/tenants                # Create new clinic
GET    /api/tenants/:slug          # Get tenant info
PATCH  /api/tenants/:slug          # Update tenant settings
```

### 3. User Management
```http
GET    /api/:tenant/users          # List users (admin view)
POST   /api/:tenant/users          # Create user (staff/doctor)
GET    /api/:tenant/users/:id      # Get user detail
PATCH  /api/:tenant/users/:id      # Update user
DELETE /api/:tenant/users/:id      # Delete user
```

### 4. Patient Management
```http
GET    /api/:tenant/patients          # List patients
POST   /api/:tenant/patients          # Register new patient
GET    /api/:tenant/patients/:id      # Get patient detail
PATCH  /api/:tenant/patients/:id      # Update patient info
DELETE /api/:tenant/patients/:id      # Delete patient record
GET    /api/:tenant/patients/search   # Search patients
```

### 5. Appointment Management
```http
GET    /api/:tenant/appointments              # List appointments
POST   /api/:tenant/appointments              # Create appointment
GET    /api/:tenant/appointments/:id          # Get detail
PATCH  /api/:tenant/appointments/:id          # Update (Reschedule)
DELETE /api/:tenant/appointments/:id          # Cancel
POST   /api/:tenant/appointments/:id/checkin  # Check-in patient
```

### 6. Medical Records (EMR)
```http
GET    /api/:tenant/patients/:id/records      # List patient history
POST   /api/:tenant/records                   # Create new SOAP record
GET    /api/:tenant/records/:id               # Get record detail
PATCH  /api/:tenant/records/:id               # Update record
```

### 7. Prescriptions & Pharmacy
```http
GET    /api/:tenant/prescriptions             # List prescriptions
POST   /api/:tenant/prescriptions             # Create prescription
GET    /api/:tenant/prescriptions/:id         # Get detail
PATCH  /api/:tenant/prescriptions/:id/status  # Update status (pharmacy)
GET    /api/:tenant/inventory                 # List drugs inventory
POST   /api/:tenant/inventory                 # Add new drug
PATCH  /api/:tenant/inventory/:id             # Update stock/info
GET    /api/:tenant/inventory/low-stock       # Low stock alerts
POST   /api/:tenant/inventory/:id/restock     # Record restock
```

### 8. Billing & Analytics
```http
GET    /api/:tenant/invoices              # List invoices
POST   /api/:tenant/invoices              # Create invoice
GET    /api/:tenant/invoices/:id          # Get detail
PATCH  /api/:tenant/invoices/:id/pay      # Mark as paid
GET    /api/:tenant/analytics/dashboard   # Dashboard stats
GET    /api/:tenant/analytics/revenue     # Revenue report
GET    /api/:tenant/analytics/patients    # Patient stats
```

---

## 🚀 Getting Started (Development Guide)

Ikuti langkah ini secara berurutan untuk menjalankan aplikasi di local machine (Linux/WSL).

### 1. Prerequisites (Setup Environment)

Jika ini pertama kali setup di laptop/server baru, jalankan script automasi ini untuk menginstall Docker, Node.js v20, dan pnpm.
```bash
chmod +x setup_env.sh
./setup_env.sh
# ⚠️ PENTING: Logout dan Login kembali terminal setelah script selesai agar permission Docker aktif.
```

### 2. Installation

Install semua dependencies (Frontend & Backend) sekaligus dari root folder:
```bash
npm run install:all
```

### 3. Database Setup (Docker)

Nyalakan container database PostgreSQL. Pastikan Docker Desktop/Engine sudah jalan.
```bash
docker compose up -d
```

### 4. Environment Variables Configuration

**A. Backend Config**

Buat file `backend/.env` dan isi dengan kredensial development (sesuai docker-compose):
```ini
PORT=3000
NODE_ENV=development

# Credential HARUS sama dengan docker-compose.yml
DATABASE_URL="postgresql://medicloud:password123@localhost:5432/medicloud_db?schema=public"

JWT_SECRET="rahasia_development_saja"
```

**B. Frontend Config**

Buat file `frontend/.env` (Optional, default Vite akan handle, tapi good practice):
```ini
VITE_API_URL=http://localhost:3000
```

### 5. Database Migration

Sinkronisasi struktur tabel (Schema) ke dalam Database Docker:
```bash
cd backend
npx prisma migrate dev --name init_dev
cd ..
```

*Jika sukses, akan muncul pesan "Your database is now in sync with your schema".*

### 6. Run Application ⚡

Jalankan Frontend dan Backend secara bersamaan dengan satu perintah:
```bash
npm run dev
```

Aplikasi siap diakses:

* **Backend API:** http://localhost:3000
* **Frontend App:** http://localhost:5173
* **Prisma Studio (DB GUI):** http://localhost:5555 (Jalankan manual jika butuh)

---

## 🛠️ Common Commands

### Root Directory

| Command | Description |
| --- | --- |
| `npm run dev` | Menyalakan Frontend & Backend (Concurrently) |
| `npm run install:all` | Install dependency di kedua folder |

### Backend Directory (`cd backend`)

| Command | Description |
| --- | --- |
| `npx prisma studio` | Membuka GUI visual untuk melihat/edit data Database |
| `npx prisma migrate dev` | Apply perubahan schema.prisma ke Database (Dev) |
| `npx prisma generate` | Update typing TypeScript (Client) setelah edit schema |
| `npm run build` | Build TypeScript ke JavaScript (folder `/dist`) |

### Frontend Directory (`cd frontend`)

| Command | Description |
| --- | --- |
| `pnpm dev` | Jalanin server frontend saja |
| `pnpm dlx shadcn@latest add [name]` | Install komponen UI baru (contoh: button, input) |

---

## 🐞 Troubleshooting

**1. Error: `Connect ECONNREFUSED ::1:5432`**

* **Penyebab:** Database Docker belum menyala.
* **Solusi:** `docker compose up -d`

**2. Error: `permission denied... Docker daemon socket`**

* **Penyebab:** User Linux belum masuk grup docker.
* **Solusi:** `sudo usermod -aG docker $USER` lalu restart terminal/logout.

**3. Error: `Port 3000 is already in use`**

* **Penyebab:** Ada terminal lain yang menjalankan server.
* **Solusi:** `lsof -i :3000` lalu `kill -9 <PID>`

**4. Prisma Error: `P1001: Can't reach database server`**

* **Solusi:** Cek file `backend/.env`. Pastikan `DATABASE_URL` menggunakan `localhost` (jika run di host) dan password sesuai `docker-compose.yml` (`password123`).

---

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

Built with ❤️ by the MediCloud Team
