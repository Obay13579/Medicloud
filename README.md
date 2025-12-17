# 🏥 MediCloud - Clinic Management System

**MediCloud** is a Multi-tenant Cloud-based Clinic Practice Management System designed for small to medium clinics in Indonesia.
Built with a modern **Monorepo Architecture** for seamless full-stack development.

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
    │   ├── components/ui/  # Shadcn Components
    │   ├── lib/utils.ts    # Utility for Tailwind class merge
    │   └── ...
    └── .env                # Frontend Config
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
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Prisma Studio (DB GUI):** [http://localhost:5555](http://localhost:5555) (Jalankan manual jika butuh)

---

## 🛠️ Common Commands

### Root Directory
| Command | Description |
|---|---|
| `npm run dev` | Menyalakan Frontend & Backend (Concurrently) |
| `npm run install:all` | Install dependency di kedua folder |

### Backend Directory (`cd backend`)
| Command | Description |
|---|---|
| `npx prisma studio` | Membuka GUI visual untuk melihat/edit data Database |
| `npx prisma migrate dev` | Apply perubahan schema.prisma ke Database (Dev) |
| `npx prisma generate` | Update typing TypeScript (Client) setelah edit schema |
| `npm run build` | Build TypeScript ke JavaScript (folder `/dist`) |

### Frontend Directory (`cd frontend`)
| Command | Description |
|---|---|
| `pnpm dev` | Jalanin server frontend saja |
| `pnpm dlx shadcn@latest add [name]` | Install komponen UI baru (contoh: button, input) |

---

## 🐞 Troubleshooting

**1. Error: `Connect ECONNREFUSED ::1:5432`**
* **Penyebab:** Database Docker belum menyala.
* **Solusi:**
    ```bash
    docker ps  # Cek status
    docker compose up -d  # Nyalakan
    ```

**2. Error: `permission denied while trying to connect to the Docker daemon socket`**
* **Penyebab:** User Linux kamu belum masuk grup docker.
* **Solusi:**
    ```bash
    sudo usermod -aG docker $USER
    newgrp docker
    ```

**3. Error: `Port 3000 is already in use`**
* **Penyebab:** Ada terminal lain yang menjalankan server atau proses nyangkut.
* **Solusi:**
    ```bash
    lsof -i :3000  # Cari PID yang pakai port 3000
    kill -9 <PID>  # Matikan paksa
    ```

**4. Prisma Error: `P1001: Can't reach database server`**
* **Solusi:** Cek file `backend/.env`. Pastikan `DATABASE_URL` menggunakan `localhost` (jika run di host) dan password sesuai `docker-compose.yml` (`password123`).
