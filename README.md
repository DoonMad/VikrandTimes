# 📰 Vikrand Times E-Paper Platform

A premium, high-performance web application for reading and managing digital newspaper editions. The platform features an optimized, page-by-page WebP rendering engine with mobile memory constraints, telemetry tracking, and a dedicated backend microservice for PDF processing.

---

## 🏗️ System Architecture

The project is structured as a monorepo consisting of two primary components:

1. **Frontend (Root)**: A dynamic Next.js application handling client rendering, database queries, and the admin management console.
2. **Backend Converter (`/pdf-converter-service`)**: A Node.js microservice utilizing **BullMQ** (powered by **Redis**) and **sharp** to handle resource-heavy PDF parsing and WebP image generation page-by-page.

---

## 🚀 Key Features

* **Lossless WebP Image Rendering**: Converts vector PDFs into high-resolution (2400px width at 200 DPI) print-quality WebP pages, reducing file sizes by **75–85%**.
* **Mobile Page Windowing**: Prevents device crash/out-of-memory (OOM) on mobile browsers by only rendering a sliding window of **9 pages** at a time, keeping off-screen placeholders.
* **Telemetry & Analytics**: Built-in instrumentation tracking upload processing speeds, download speeds, and client load times.
* **Performance Dashboard**: Real-time admin views highlighting cumulative storage savings, network bandwidth reduction, and conversion speeds.
* **Containerized Deployment**: Simple, one-command deployment workflow utilizing Docker and Docker Compose.

---

## 🛠️ Local Development Setup

### 1. Frontend Configuration (Root)

Create a [`.env.local`](file:///a:/Programming/Projects/newspaper-website/.env.local) file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

Start the Next.js development server:
```bash
npm install
npm run dev
```

### 2. Backend Configuration (`/pdf-converter-service`)

Create a `.env` file in the `pdf-converter-service/` directory:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Run the backend locally using Docker Compose:
```bash
cd pdf-converter-service
docker compose up --build
```
*(Docker Compose will automatically start a local Redis container and hook it up to the application).*

---

## ☁️ Production Deployment (Oracle Cloud VM)

The backend is configured to run fully containerized on virtual machines. 

### 1. VM Prerequisites
Install Docker and Docker Compose on the host machine:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker ubuntu
# Log out and log back in to apply group membership
```

### 2. Deployment Command
Prepare your production `.env` credentials in `pdf-converter-service/` and run:
```bash
docker compose up -d --build
```

This starts:
* A private, isolated **Redis** instance (not exposed to the public internet).
* The **Express API & BullMQ Worker** exposing port `4000` to handle upload queues and database sync.
