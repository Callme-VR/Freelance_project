# Freelance Project - Certificate Generator System

A full-stack web application for generating and managing certificates. Built with a **Next.js** frontend and an **Express + Prisma + PostgreSQL (Neon)** backend, powered by **Bun**.

---

## 📁 Project Architecture

```text
FreeLance_project/
├── backend/          # Express REST API, Prisma ORM, PostgreSQL connection
└── frentend/         # Next.js 16 React Frontend (Tailwind CSS)
```

---

## 🚀 Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** Express, TypeScript, Bun Runtime
- **Database & ORM:** PostgreSQL (Neon DB), Prisma ORM 7
- **PDF & File Processing:** PDF-Lib, SheetJS (XLSX), Archiver, JSZip

---

## 🛠️ Prerequisites

Ensure you have the following installed:
- **Bun** (v1.0+ recommended) or **Node.js** (v18+)
- **Git**

---

## ⚙️ Getting Started & Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Callme-VR/Freelance_project.git
cd Freelance_project
```

---

### 2. Backend Setup (`/backend`)

1. **Navigate to the `backend` folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` folder:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"
   ```

4. **Setup Database (Prisma):**
   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Run the Backend Server:**
   ```bash
   bun dev
   # or
   npm run dev
   ```
   > 📡 Backend API will run on **`http://localhost:4500`**

---

### 3. Frontend Setup (`/frentend`)

1. **Open a new terminal and navigate to the `frentend` folder:**
   ```bash
   cd frentend
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Run the Frontend App:**
   ```bash
   bun dev
   # or
   npm run dev
   ```
   > 🌐 Frontend app will run on **`http://localhost:5000`**

---

## 📜 Available Scripts Summary

### Backend (`/backend`)
| Command | Action |
|---|---|
| `bun dev` | Runs backend API server in watch mode (`index.ts`) |
| `bun run db:generate` | Generates Prisma client types |
| `bun run db:push` | Pushes Prisma schema changes to database |
| `bun run db:studio` | Opens Prisma Studio database GUI |

### Frontend (`/frentend`)
| Command | Action |
|---|---|
| `bun dev` | Starts Next.js dev server on port `5000` |
| `bun run build` | Compiles production build |
| `bun run start` | Runs production server |
| `bun run lint` | Runs ESLint check |
