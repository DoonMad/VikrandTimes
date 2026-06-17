# 📰 Vikrand Times: Production-Grade Digital Newspaper Platform

### 🚀 Live Website: [https://www.vikrandtimes.com](https://www.vikrandtimes.com)

A high-performance, full-stack digital newspaper publishing and e-paper reading platform. Built with **Next.js (App Router)** and powered by a containerized **Node.js microservice** that offloads heavy PDF rendering to a background processing queue, converting large vectors into highly optimized, print-quality WebP page assets.

Designed to handle heavy publication PDFs (>50MB) on resource-constrained devices, implementing memory-safe windowing algorithms and automated pipeline telemetry.

---

## 🏗️ System Architecture & Data Flow

This platform is architected as a decoupled, stateless microservice system to guarantee independent scaling and high availability:

```
[ Next.js Admin Panel ] ---> (POST PDF File) ---> [ Express API (Port 4000) ]
                                                            |
                                                            v (Enqueues Job)
[ Supabase Storage ] <--- (Uploads WebPs/PDF) <--- [ BullMQ Worker + Redis ]
        |                                                   |
        | (Serves WebP Pages)                               v (Updates Metadata)
        v                                           [ Supabase DB (Postgres) ]
[ Next.js Client Viewer ] <--- (Reads JSON Metadata) <------/
```

---

## ✨ Key Features

### 👤 Client-Facing Reader Portal
* **Daily Newspaper Reader**: Responsive, touch-friendly page viewer that renders high-definition WebP pages. Features smooth slide transitions, loading animations, and dynamic zoom tools.
* **Archive Explorer**: Calendar-based issues search allowing readers to search and browse past newspaper publications by date.
* **Special Editions**: Catalog of special issues, magazines, and supplements with customized cover thumbnails.
* **Responsive Layouts**: Premium, mobile-first design with accessibility (a11y) considerations for toolbar buttons, navigation, and modal dialogues.
* **Interactive Contact Portal**: Simple interface for readers to submit feedback, inquiries, or news tips.

### 🛡️ Admin Management Console
* **Role-Based Access Control (RBAC)**: Secure pages protected by Supabase Authentication and database RLS. Only users with the `admin` role can access management routes.
* **Edition Upload Portal**: Drag-and-drop PDF upload form. Features real-time conversion progress bars communicating status directly with the OCI backend.
* **Special Edition Handler**: Form for uploading standalone editions, automatically generating cover thumbnails from Page 1 of the PDF in the browser.
* **Performance Telemetry Dashboard**: Real-time graphs and cards highlighting cumulative storage savings (calculated from original vs compressed sizes), queue speed statistics, and average client-side load times.
* **Message Center**: Admin interface to read, review, mark as responded, or delete contact form messages.

---

## 🛠️ Core Technology Stack & Skills Demonstrated

### Frontend (Next.js App Router)
* **Framework**: React 19 / Next.js 16 (Turbopack, App Router).
* **Styling & UI**: TailwindCSS, Lucide Icons (Responsive, accessible, premium design system).
* **Performance Optimization**: Dynamic component loading, aspect-ratio scroll anchors, and client-side page pre-rendering.

### Backend Microservice (Node.js & Express)
* **Runtime**: Node.js 22 (LTS) / TypeScript.
* **Task Scheduling**: **BullMQ** backed by **Redis** for robust background task queueing, retry logic, and worker management.
* **Image Processing Engine**: **Poppler Utility (`pdftoppm`)** for high-fidelity PDF rasterization, and **sharp** for lossless WebP compression.

### Database, Storage & Security
* **Database**: **Supabase (PostgreSQL)** featuring relational tables, indexes, and custom triggers.
* **Object Storage**: **Supabase Storage** buckets acting as a global CDN for raw PDFs, WebP page assets, and generated edition thumbnails.
* **Security & Row Level Security (RLS)**: Enforced strict access control policies on tables ensuring database integrity.

### DevOps & Infrastructure
* **Containerization**: Docker, Docker Compose (multi-container orchestration, private networks, resource constraints).
* **Cloud Hosting**: **Oracle Cloud Infrastructure (OCI)** Virtual Machine (Always Free tier).
* **Networking & Security**: Custom Linux firewall configurations (`iptables`/`netfilter-persistent`) and OCI VCN Ingress/Egress configurations.

---

## 💾 Database Schema Design

The application utilizes a PostgreSQL relational schema with Row-Level Security (RLS) policies and automated triggers:

```sql
-- 1. Profiles Table (Holds User Info & Roles)
create table profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    name text not null,
    dob date,
    phone text,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamp with time zone default now()
);

-- 2. Daily Editions Table (Newspapers indexed by date)
create table editions (
    publish_date date primary key,
    page_count integer default 1,
    created_at timestamp with time zone default now()
);

-- 3. Special Editions Table (Indexed by Unique Slug)
create table special_editions (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    publish_date date not null,
    thumbnail_url text,
    page_count integer default 1,
    created_at timestamp with time zone default now()
);

-- 4. Contact Messages Table (For admin inquiry log)
create table contact_messages (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    phone text,
    subject text not null,
    message text not null,
    is_read boolean default false,
    responded boolean default false,
    response_notes text,
    created_at timestamptz default now()
);

-- 5. System Performance & Compression Telemetry Metrics
create table metrics (
    id uuid primary key default gen_random_uuid(),
    target_id text not null, -- Stores publishDate or Slug
    original_size_bytes bigint not null,
    compressed_size_bytes bigint not null,
    conversion_time_ms integer not null,
    page_count integer not null,
    client_load_time_ms integer,
    created_at timestamptz default now()
);
```

### Database Triggers & Policies
* **Profile Sync Trigger**: A PostgreSQL database trigger `on_auth_user_email_confirmed` automatically provisions a matching `profiles` record with default `user` permissions as soon as a user verifies their email in Supabase.
* **RLS Policies**: Secure policies restrict `editions`, `special_editions`, and `metrics` viewing to the public (read-only), while only allowing users matching `role = 'admin'` to run insert/update/delete operations.

---

## 🧠 Solved Engineering Challenges

### 1. The Mobile OOM (Out-of-Memory) Crash Problem
* **The Challenge**: Rendering a 50+ page newspaper PDF using in-browser PDF engines (like `pdf.js` WASM) consumed over **300MB–500MB of RAM**, immediately crashing mobile web browsers on budget smartphones.
* **The Solution**: 
  1. Offloaded the PDF rendering to the cloud, converting PDF pages to WebP images.
  2. Implemented a **9-page sliding window algorithm** (`currentPage ± 4`) on the Next.js viewer client. Pages outside this window are completely unloaded from the DOM.
  3. Created empty placeholder elements matching the exact aspect ratio (`1:1.414` standard portrait) to keep the browser scrollbar smooth and prevent layout shifts.
  4. Reduced browser memory usage from **300MB+ to under 20MB**!

### 2. High-Performance Text Legibility
* **The Challenge**: Standard image conversion creates blurry text when readers zoom in closely to read newspaper articles.
* **The Solution**: Rendered PDF pages at **200 DPI** to PNG, then downscaled to **2400px width** (maintaining aspect ratio), and compressed to WebP at **85% quality** via `sharp`. This resulted in razor-sharp text on high-density Retina/OLED screens with a **75% saving in storage** compared to original vector PDFs.

### 3. Deploying on a Resource-Constrained Server (1GB RAM)
* **The Challenge**: OCI Always Free AMD instances are limited to 1 GB of RAM. Running a Node.js server, a background worker, and a Redis database together can easily cause the server to crash due to OOM errors.
* **The Solution**:
  * **Memory Limits**: Configured the Docker daemon to restrict the app container to **650MB RAM** (`deploy.resources.limits.memory`) and passed `--max-old-space-size=512` to Node.js.
  * **Worker Throttling**: Set BullMQ worker **concurrency to 1** to process jobs strictly sequentially, preventing CPU and memory spikes.
  * **Private Networking**: Deployed Redis inside a private Docker bridge network. By not exposing the Redis port (`6379`) to the public internet, we removed security vulnerabilities while maintaining seamless container communication.

---

## 📝 Configuration & Environment Variables

### 1. Frontend Environment Variables (`.env.local`)
Create this file in the root Next.js project directory:

```env
# Supabase Client Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Deployed Backend OCI Endpoint
NEXT_PUBLIC_BACKEND_URL=http://80.225.195.91:4000
```

### 2. Backend Environment Variables (`pdf-converter-service/.env`)
Create this file inside the `pdf-converter-service/` folder:

```env
# Port to bind the Node.js API server
PORT=4000

# Direct connection string to Supabase PostgreSQL database (used for schema migrations)
DATABASE_URL=postgresql://postgres.your-project-id:[password]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres

# Supabase Client Credentials (URL + Service Role Bypass Key for Storage Bucket uploads)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-high-privilege-service-role-key

# CORS Whitelist (Allows requests from frontend origin)
FRONTEND_URL=http://localhost:3000

# Redis Connection (Optional if running locally without Docker; overridden by Docker Compose)
REDIS_URL=redis://127.0.0.1:6379
```

---

## 🏃 How to Run the Project

### Local Development Setup

#### 1. Start the Backend (with local Redis container):
Ensure Docker Desktop is running on your computer:
```bash
cd pdf-converter-service
docker compose up --build
```
*(The API will be available at `http://localhost:4000` and will automatically verify/bootstrap database tables).*

#### 2. Start the Frontend:
Open a separate terminal window at the root directory:
```bash
npm install
npm run dev
```
*(The web application will open at `http://localhost:3000`)*.

---

### Cloud VM Production Deployment (Docker Compose)

To deploy the backend worker on a Linux VM (like Ubuntu on Oracle Cloud):

```bash
# 1. SSH into your VM
ssh -i "your-ssh-key.key" ubuntu@80.225.195.91

# 2. Clone the repository
git clone https://github.com/DoonMad/VikrandTimes.git
cd VikrandTimes/pdf-converter-service

# 3. Create and populate your production .env file
nano .env

# 4. Start the service in detached mode (background daemon)
docker compose up -d --build
```

You can view the logs or check container health by running:
```bash
docker compose ps
docker compose logs -f app
```
