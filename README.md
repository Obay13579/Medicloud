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

## 🎯 MVP Scope (5-Day Development)

**Simplified Focus:**
- **3 User Roles:** Admin, Doctor, Pharmacist
- **8 Pages:** 2 Public + 6 Dashboard pages
- **25 API Endpoints:** Core functionality only
- **Priority:** Multi-tenancy + Core workflows (Patient → Doctor → Pharmacy)

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
- **Database:** Supabase (Cloud PostgreSQL) - *Shared across all nodes*
- **Load Balancer:** Cloudflare Tunnel (Replica) - *High Availability*
- **DevOps:** Docker Compose, GitHub Actions (CI/CD)

---

## Cloud Architecture & Standards

### Relevansi NIST CCRA

**MediCloud** mengadopsi kerangka kerja NIST Cloud Computing Reference Architecture (SP 500-292) dengan pembagian peran:
- **Cloud Provider:** MediCloud bertindah sebagai penyedia layanan SaaS yang mengelola infrastruktur, aplikasi, dan keamanan data.
- **Cloud Consumer:** Klinik kecil-menengah di Indonesia yang menggunakan layanan untuk operasional medis.
- **Cloud Broker:** Integrasi dengan Supabase untuk manajemen database dan Cloudflare untuk entry point jaringan.
- **Karakteristik Utama:** Mendukung On-demand self-service dan Flexibility melalui penggunaan Docker.

### Resource Abstraction & Provisioning

- **Resource Abstraction:** Menggunakan Docker Containerization untuk mengabstraksi runtime environment (Node.js) yang memastikan konsistensi aplikasi di berbagai lingkungan server.
- **Provisioning:** Menggunakan Docker Compose untuk orkestrasi kontainer secara otomatis. 

### Business Support System (BSS)

- **Tenant Billing:** Otomatis menghitung biaya langganan berdasarkan jumlah data atau durasi penggunaan.
- **Provisioning Logic:** Endpoint `/api/tenants` menangani pembuatan data terisolasi secara otomatis untuk setiap klinik baru yang mendaftar.

### Rancangan Monitoring

<...>

---

## 📂 Project Structure
```text
medicloud/
├── docker-compose.yml      # 🗄️ PostgreSQL Database Service
├── setup_env.sh            # ⚡ Linux Environment Setup Script
├── package.json            # 🚀 Monorepo Root Scripts
├── README.md               # 📖 This Documentation
│
├── backend/                # 🧠 Server Side
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth, validation, error handling
│   │   ├── routes/         # API route definitions
│   │   ├── app.ts          # Express app configuration
│   │   └── index.ts        # Server entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema (Single Source of Truth)
│   ├── .env                # Backend environment variables
│   └── package.json
│
└── frontend/               # 💅 Client Side
    ├── src/
    │   ├── components/
    │   │   ├── ui/         # Shadcn UI components
    │   │   ├── shared/     # Reusable components (Logo, etc)
    │   │   └── layouts/    # Layout wrappers
    │   │       ├── PublicLayout.tsx   # Marketing pages layout
    │   │       └── AppLayout.tsx      # Dashboard layout (Sidebar + Topbar)
    │   ├── features/       # Feature-specific components
    │   │   ├── auth/       # Login/Register forms
    │   │   ├── patients/   # Patient management
    │   │   ├── appointments/ # Appointment features
    │   │   ├── emr/        # Medical records
    │   │   └── pharmacy/   # Prescription & inventory
    │   ├── pages/          # Page components
    │   │   ├── public/     # Landing, Login
    │   │   ├── admin/      # Admin dashboard pages
    │   │   ├── doctor/     # Doctor dashboard pages
    │   │   └── pharmacy/   # Pharmacy dashboard pages
    │   ├── lib/
    │   │   ├── api.ts      # Axios instance with interceptors
    │   │   └── utils.ts    # Utility functions (cn for Tailwind)
    │   ├── App.tsx         # React Router setup
    │   └── main.tsx        # React entry point
    ├── .env                # Frontend environment variables
    └── package.json
```

---

## 📱 Application Pages (8 Total)

### **Public Pages (2)**
1. **Landing Page** - Marketing homepage (static content)
2. **Login Page** - Unified login for all user roles

### **Admin Dashboard (3)**
3. **Admin Dashboard** - Overview stats + Today's queue management
4. **Patient List** - CRUD patient records
5. **Appointment List** - Manage all appointments

### **Doctor Dashboard (2)**
6. **Doctor Queue** - Today's patient queue
7. **EMR Page** - Input medical records (SOAP) + prescriptions

### **Pharmacy Dashboard (1)**
8. **Pharmacy Queue** - Process prescriptions + basic inventory management

---

## 🔌 Backend API Specification (25 Endpoints)

### 1. Authentication (3 endpoints)
```http
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login (returns JWT token)
GET    /api/auth/me            # Get current user profile
```

### 2. Tenant Management (2 endpoints)
```http
POST   /api/tenants            # Create new clinic (signup)
GET    /api/tenants/:slug      # Get clinic info
```

### 3. Patient Management (5 endpoints)
```http
GET    /api/:tenant/patients           # List all patients
POST   /api/:tenant/patients           # Register new patient
GET    /api/:tenant/patients/:id       # Get patient detail
PATCH  /api/:tenant/patients/:id       # Update patient info
DELETE /api/:tenant/patients/:id       # Delete patient record
```

### 4. Appointment Management (5 endpoints)
```http
GET    /api/:tenant/appointments           # List appointments (filter by date/doctor)
POST   /api/:tenant/appointments           # Create new appointment
GET    /api/:tenant/appointments/:id       # Get appointment detail
PATCH  /api/:tenant/appointments/:id       # Update status (checkin/complete)
DELETE /api/:tenant/appointments/:id       # Cancel appointment
```

### 5. Medical Records / EMR (3 endpoints)
```http
GET    /api/:tenant/patients/:id/records   # Get patient medical history
POST   /api/:tenant/records                # Create new SOAP record
GET    /api/:tenant/records/:id            # Get record detail
```

### 6. Prescriptions (4 endpoints)
```http
GET    /api/:tenant/prescriptions          # List prescriptions (filter by status)
POST   /api/:tenant/prescriptions          # Create prescription from EMR
GET    /api/:tenant/prescriptions/:id      # Get prescription detail
PATCH  /api/:tenant/prescriptions/:id      # Update status (process/complete)
```

### 7. Inventory Management (3 endpoints)
```http
GET    /api/:tenant/inventory              # List all drugs
POST   /api/:tenant/inventory              # Add new drug
PATCH  /api/:tenant/inventory/:id          # Update drug stock
```

---

## 🗺️ Page-to-API Mapping Guide

### PAGE 1: Landing Page
| Component | Action | Backend Endpoint |
|-----------|--------|------------------|
| Hero Section | - | (Static content) |
| CTA Button | Click | → Navigate to Login Page |

### PAGE 2: Login Page
| Component | Action | Backend Endpoint |
|-----------|--------|------------------|
| Login Form | Submit credentials | `POST /api/auth/login` |
| After Login | Get user info | `GET /api/auth/me` |

**Redirect Logic:**
- `role = ADMIN` → Admin Dashboard
- `role = DOCTOR` → Doctor Queue
- `role = PHARMACIST` → Pharmacy Queue

### PAGE 3: Admin Dashboard
| Component | Action | Backend Endpoint |
|-----------|--------|------------------|
| Stats Cards | Load on mount | Count from `GET /api/:tenant/appointments?date=today` |
| Today's Queue | Load appointments | `GET /api/:tenant/appointments?date=today` |
| Check-in Button | Click | `PATCH /api/:tenant/appointments/:id` (status: CHECKED_IN) |
| Add Patient Modal | Submit | `POST /api/:tenant/patients` |

### PAGE 4: Patient List
| Component | Action | Backend Endpoint |
|-----------|--------|------------------|
| Table | Load patients | `GET /api/:tenant/patients` |
| Add Button | Open modal | - |
| Add Modal | Submit form | `POST /api/:tenant/patients` |
| Edit Button | Load data | `GET /api/:tenant/patients/:id` |
| Edit Modal | Submit changes | `PATCH /api/:tenant/patients/:id` |
| Delete Button | Confirm & delete | `DELETE /api/:tenant/patients/:id` |
| View History | Click patient name | `GET /api/:tenant/patients/:id/records` |

### PAGE 5: Appointment List
| Component | Action | Backend Endpoint |
|-----------|--------|------------------|
| Table | Load appointments | `GET /api/:tenant/appointments` |
| Filter by Date | Select date | `GET /api/:tenant/appointments?date={date}` |
| Filter by Doctor | Select doctor | `GET /api/:tenant/appointments?doctorId={id}` |
| Add Modal | Submit form | `POST /api/:tenant/appointments` |
| Edit Modal | Update appointment | `PATCH /api/:tenant/appointments/:id` |
| Cancel Button | Delete | `DELETE /api/:tenant/appointments/:id` |

### PAGE 6: Doctor Queue
| Component | Action | Backend Endpoint |
|-----------|--------|------------------|
| Queue List | Load today's appointments | `GET /api/:tenant/appointments?doctorId={me}&date=today` |
| Call Patient Button | Update status | `PATCH /api/:tenant/appointments/:id` (status: IN_PROGRESS) |
| Start Consultation | Click patient | → Navigate to EMR Page |

### PAGE 7: EMR Page
| Component | Action | Backend Endpoint |
|-----------|--------|------------------|
| Patient Info Header | Load patient | `GET /api/:tenant/patients/:id` |
| Medical History | Load history | `GET /api/:tenant/patients/:id/records` |
| SOAP Form | Input data | (Local state) |
| Save SOAP Button | Submit | `POST /api/:tenant/records` |
| Prescription Form | Add drugs | (Local state - hardcoded drug list for MVP) |
| Send to Pharmacy | Submit | `POST /api/:tenant/prescriptions` |
| Complete Button | Mark done | `PATCH /api/:tenant/appointments/:id` (status: COMPLETED) |

### PAGE 8: Pharmacy Queue
| Component | Action | Backend Endpoint |
|-----------|--------|------------------|
| Prescription List | Load pending | `GET /api/:tenant/prescriptions?status=PENDING` |
| Prescription Detail | Click prescription | `GET /api/:tenant/prescriptions/:id` |
| Process Button | Start processing | `PATCH /api/:tenant/prescriptions/:id` (status: PROCESSING) |
| Complete Button | Mark done | `PATCH /api/:tenant/prescriptions/:id` (status: COMPLETED) |
| Inventory Tab | Load drugs | `GET /api/:tenant/inventory` |
| Add Drug | Quick add | `POST /api/:tenant/inventory` |
| Update Stock | Inline edit | `PATCH /api/:tenant/inventory/:id` |

---

## 📊 Database Schema (Prisma)
```prisma
model Tenant {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  createdAt DateTime @default(now())
  
  users         User[]
  patients      Patient[]
  appointments  Appointment[]
  records       MedicalRecord[]
  prescriptions Prescription[]
  inventory     Drug[]
}

model User {
  id        String   @id @default(cuid())
  tenantId  String
  email     String
  password  String
  name      String
  role      String   // ADMIN, DOCTOR, PHARMACIST
  
  tenant        Tenant        @relation(fields: [tenantId], references: [id])
  appointments  Appointment[]
  records       MedicalRecord[]
  
  @@unique([tenantId, email])
}

model Patient {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  phone     String
  dob       DateTime
  gender    String
  
  tenant       Tenant          @relation(fields: [tenantId], references: [id])
  appointments Appointment[]
  records      MedicalRecord[]
}

model Appointment {
  id        String   @id @default(cuid())
  tenantId  String
  patientId String
  doctorId  String
  date      DateTime
  timeSlot  String
  status    String   // SCHEDULED, CHECKED_IN, IN_PROGRESS, COMPLETED
  
  tenant  Tenant  @relation(fields: [tenantId], references: [id])
  patient Patient @relation(fields: [patientId], references: [id])
  doctor  User    @relation(fields: [doctorId], references: [id])
}

model MedicalRecord {
  id          String   @id @default(cuid())
  tenantId    String
  patientId   String
  doctorId    String
  visitDate   DateTime @default(now())
  subjective  String?
  objective   String?
  assessment  String?
  plan        String?
  
  tenant        Tenant         @relation(fields: [tenantId], references: [id])
  patient       Patient        @relation(fields: [patientId], references: [id])
  doctor        User           @relation(fields: [doctorId], references: [id])
  prescriptions Prescription[]
}

model Prescription {
  id        String   @id @default(cuid())
  tenantId  String
  recordId  String
  status    String   // PENDING, PROCESSING, COMPLETED
  items     Json     // [{drugName, dosage, frequency}]
  
  tenant Tenant        @relation(fields: [tenantId], references: [id])
  record MedicalRecord @relation(fields: [recordId], references: [id])
}

model Drug {
  id       String @id @default(cuid())
  tenantId String
  name     String
  stock    Int    @default(0)
  unit     String
  
  tenant Tenant @relation(fields: [tenantId], references: [id])
}
```

---

## 🚀 Getting Started (Team Setup Guide)

Ikuti langkah ini agar laptopmu terhubung ke cluster Load Balancing tim.

### 1. Prerequisites

Pastikan Docker Desktop sudah jalan. Jika di Linux/WSL, jalankan script setup:
```bash
chmod +x setup_env.sh
./setup_env.sh
# ⚠️ PENTING: Logout dan Login kembali terminal setelah script selesai agar permission Docker aktif.
```

### 2. Installation & Environment Setup

Kita sudah siapkan script automasi untuk install dependency dan copy environment variable dasar.
```bash
npm run init:project
```

### 3. Configure Environment (.env)

Buka file `.env` di root folder. **Minta Token & URL Database ke Team Lead (Obi).**
**Jangan pakai database lokal agar fitur High Availability jalan!**
```ini
# .env (Root Folder)

# 1. Database Cloud (Supabase) - Minta ke Admin
DATABASE_URL="postgresql://postgres.<DB_ID>:<PASSWORD>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# 2. Tunnel Token (Cloudflare) - Minta ke Admin
TUNNEL_TOKEN="eyJh..."

# 3. Security
JWT_SECRET="rahasia_tim_kita_123"

# 4. Backend Config
PORT=3000
NODE_ENV=development

# 5. Frontend Config (Optional)
VITE_API_URL=http://localhost:3000
```

### 4. Run Application & Tunnel ⚡

Nyalakan Backend, Frontend, dan Load Balancer Agent sekaligus.
```bash
docker compose up -d
```

**Tunggu status tunnel "Connected" di Dashboard Cloudflare.**

### 5. Database Migration (Optional)

Hanya jalankan jika kamu mengubah `schema.prisma`.
```bash
cd backend
npx prisma migrate dev --name nama_perubahan
cd ..
```

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

## 📝 Development Workflow

### Daily Development Flow
1. Start database: `docker compose up -d`
2. Run both servers: `npm run dev`
3. Access Prisma Studio (if needed): `cd backend && npx prisma studio`
4. Make changes to code (hot reload enabled)
5. Stop servers: `Ctrl + C`

### Making Database Changes
1. Edit `backend/prisma/schema.prisma`
2. Run migration: `cd backend && npx prisma migrate dev --name your_change_name`
3. Prisma Client will auto-regenerate

### Adding New UI Components
```bash
cd frontend
pnpm dlx shadcn@latest add button    # Example: add button component
```

---

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

Built with ❤️ by the MediCloud Team
