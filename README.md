# 🗄️ AuraNexus - Smart Storage System

> **Intelligent Multi-Format Storage System** for the Auraverser '25 Hackathon  
> Unified interface for any data type with automatic categorization, intelligent schema detection, and seamless SQL/NoSQL routing.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-23.3-339933?logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?logo=supabase)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vitejs.dev/)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Testing with Your Own Credentials](#-testing-with-your-own-credentials)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Demo Flow](#-demo-flow)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

AuraNexus is a **production-ready smart storage system** that accepts any data format (files, JSON, text) and intelligently organizes them using:

- **Automatic file categorization** by type and topic (using PDF text extraction)
- **Schema fingerprinting** for JSON data with SHA256 hashing
- **Dynamic SQL table generation** for structured data
- **NoSQL fallback** for unstructured/mixed-type data
- **Type inference system** (integer, bigint, numeric, float, boolean, timestamp, text, jsonb)
- **Overflow detection** for extremely large numbers
- **GIN Indexing** for NoSQL documents enabling fast JSONB queries

### Key Innovation
- **Single unified interface** for all data types
- **Smart routing**: Structured data → SQL, Unstructured → NoSQL
- **Schema registry** tracks all discovered patterns
- **Instant retrieval** with organized file explorer and data browser
- **Indexed NoSQL**: GIN (Generalized Inverted Index) on JSONB columns for lightning-fast queries even on unstructured data

---

## ✨ Features

### 🔄 Panel 1: The Processor (Unified Input)
- **File Upload**: Drag & drop any file type (.pdf, .png, .jpg, .txt, .json, etc.)
- **JSON Input**: Paste raw JSON arrays or malformed JSON
- **Text Input**: Plain text data
- **Instant Receipt**: Real-time JSON response showing processing results
- **Topic Detection**: Automatic extraction from PDF content

### 📁 Panel 2: File Explorer (Smart Organization)
- **Hierarchical Tree View**: Category → Extension → Files
  - 🖼️ Images (png, jpg, svg, etc.)
  - 📄 Documents (pdf, txt, json, etc.)
  - 📦 Others (all other types)
- **Fast Downloads** with loader indicators
- **One-click Delete** with confirmation
- **Real-time Refresh**
- **File Count Badges**

### 🗄️ Panel 3: Data Explorer (Schema Intelligence)
- **Schema Registry Browser**: View all SQL and NoSQL schemas
- **SQL/NoSQL Badges**: Clear type indicators (blue for SQL, orange for NoSQL)
- **Dynamic Table Querying**: Click any schema to view data
- **JSON Viewer**: Collapsible data visualization
- **Individual NoSQL Documents**: Each document listed separately
- **Schema Deletion**: Remove tables and documents with confirmation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Processor   │  │     File     │  │     Data     │    │
│  │    Panel     │  │   Explorer   │  │   Explorer   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend (Node.js + Express)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    Upload    │  │     JSON     │  │     Data     │    │
│  │  Controller  │  │   Service    │  │  Controller  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       Supabase                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Storage    │  │  PostgreSQL  │  │   Schemas    │    │
│  │   Bucket     │  │   (SQL)      │  │   Registry   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  Documents   │  │ Dynamic Data │                       │
│  │   (NoSQL)    │  │    Tables    │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **File Upload** → Stored in Supabase Storage → Metadata in `files` table
2. **JSON Upload** → Schema fingerprint → SQL or NoSQL decision
   - **Structured**: Dynamic table creation (`data_*`)
   - **Unstructured**: Stored in `documents` table (JSONB)
3. **Retrieval** → Files via CDN, Data via dynamic queries

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework with modern hooks
- **Vite 7.2** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first styling
- **Axios** - HTTP client
- **react-dropzone** - File upload with drag & drop
- **@microlink/react-json-view** - JSON visualization
- **Lucide React** - Modern icon library

### Backend
- **Node.js 23.3** - JavaScript runtime
- **Express 5** - Web framework
- **Supabase JS 2.81** - Database & storage client
- **Multer 2.0** - File upload middleware (memory storage)
- **pdf-parse 1.1.1** - PDF text extraction
- **mime-types** - MIME type detection

### Database & Storage
- **Supabase** (PostgreSQL 15+ with extensions)
- **Storage Bucket**: `smartstorage` (for files)
- **Tables**: `files`, `documents`, `schemas`, dynamic `data_*` tables
- **GIN Indexing**: JSONB columns indexed for fast NoSQL queries

---

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm or yarn** (comes with Node.js)
- **Supabase Account** ([Sign up free](https://supabase.com/))
- **Git** (for cloning)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Yuji25/AuraNexus.git
cd "Storage System"
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials (see [Testing with Your Own Credentials](#-testing-with-your-own-credentials)):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
PORT=4000
```

Start the backend server:

```bash
npm run dev
```

Server runs on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd ../client/vite-project
npm install
```

Edit `.env` ( present in project directory ) with your Backend URL:

```env
VITE_API_URL= < your backend-url-here >
```

Start the frontend dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🔑 Testing with Your Own Credentials

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: AuraNexus (or any name)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
4. Wait for project to initialize (~2 minutes)

### Step 2: Get Your Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Service Role Key** (anon key won't work for storage): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Setup Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste this schema:

```sql
-- Main files table
CREATE TABLE IF NOT EXISTS files (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  filename TEXT,
  file_type TEXT,
  topic TEXT,
  storage_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- NoSQL documents table
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN Index for fast JSONB queries on NoSQL documents
CREATE INDEX IF NOT EXISTS idx_documents_data ON documents USING GIN (data);
CREATE INDEX IF NOT EXISTS idx_documents_metadata ON documents USING GIN (metadata);

-- Schema registry table
CREATE TABLE IF NOT EXISTS schemas (
  schema_id TEXT PRIMARY KEY,
  signature TEXT NOT NULL,
  table_name TEXT NOT NULL,
  columns JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to execute dynamic SQL (for table creation/deletion)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
```

3. Click **"Run"**

### Step 4: Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **"New Bucket"**
3. Name: `smartstorage`
4. **Public bucket**: Yes (for easier testing)
5. Click **"Create Bucket"**

### Step 5: Configure Backend

Update `server/.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
PORT=4000
```

### Step 6: Test the Connection

```bash
cd server
npm run dev
```

Visit `http://localhost:4000/test-db` - should see database response (might be empty, that's fine)

### Step 7: Start Frontend

```bash
cd client/vite-project
npm run dev
```

Visit `http://localhost:5173` - you should see the app!

---

## 📂 Project Structure

```
Storage System/
├── server/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── app.js                  # Main server file
│   │   ├── config/
│   │   │   └── supabaseClient.js   # Supabase connection
│   │   ├── controllers/
│   │   │   ├── upload.controller.js    # File upload logic
│   │   │   ├── json.controller.js      # JSON upload logic
│   │   │   └── data.controller.js      # Data retrieval/deletion
│   │   ├── services/
│   │   │   ├── media.service.js        # File processing
│   │   │   └── json.service.js         # Schema detection & type inference
│   │   ├── middleware/
│   │   │   └── upload.middleware.js    # Multer config (100MB limit)
│   │   ├── routes/
│   │   │   ├── upload.route.js         # File upload routes
│   │   │   ├── json.route.js           # JSON routes
│   │   │   └── data.route.js           # Data retrieval/deletion routes
│   │   └── utils/
│   │       ├── logger.util.js          # Console logging
│   │       ├── sql.util.js             # SQL sanitization
│   │       └── textExtract.util.js     # PDF text extraction
│   ├── .env                        # Environment variables (create this)
│   ├── .env.example                # Example env file
│   └── package.json
│
├── client/vite-project/             # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProcessorPanel.jsx      # Upload interface
│   │   │   ├── FileExplorerPanel.jsx   # File browser
│   │   │   └── DataExplorerPanel.jsx   # Schema browser
│   │   ├── lib/
│   │   │   ├── api.js                  # Axios client & API functions
│   │   │   └── utils.js                # Utility functions (cn)
│   │   ├── App.jsx                     # Main app with tabs
│   │   ├── index.css                   # Tailwind directives
│   │   └── main.jsx                    # App entry point
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── postcss.config.cjs          # PostCSS config
│   └── package.json
│
├── other/
│   └── schema.txt                   # SQL schema reference
├── SETUP.md                         # Detailed setup guide
├── DEMO.md                          # Demo script
└── README.md                        # This file
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Endpoints

#### 1. Upload Files
```http
POST /api/upload
Content-Type: multipart/form-data

Body: FormData with 'files' field (supports up to 10 files)
```

**Response:**
```json
{
  "message": "Files uploaded successfully",
  "results": [
    {
      "filename": "report.pdf",
      "fileType": "pdf",
      "topic": "Annual Report",
      "storagePath": "document/Annual Report/1731724800000_report.pdf"
    }
  ]
}
```

#### 2. Upload JSON
```http
POST /api/upload-json
Content-Type: application/json

Body: JSON array or raw JSON
```

**Response:**
```json
{
  "message": "JSON processed successfully",
  "schemaId": "abc123",
  "tableName": "data_users",
  "storageType": "sql",
  "rowsInserted": 5
}
```

#### 3. Get All Files
```http
GET /api/files
```

**Response:**
```json
{
  "files": [
    {
      "id": 1,
      "filename": "logo.png",
      "file_type": "png",
      "topic": "Branding",
      "storage_path": "image/Branding/1731724800000_logo.png",
      "uploaded_at": "2025-11-16T10:30:00Z"
    }
  ]
}
```

#### 4. Get All Schemas
```http
GET /api/schemas
```

**Response:**
```json
{
  "schemas": [
    {
      "schema_id": "abc123",
      "signature": "email,name,age",
      "table_name": "data_users",
      "created_at": "2025-11-16T10:30:00Z"
    },
    {
      "table_name": "document_5",
      "schema_type": "nosql",
      "document_id": 5,
      "created_at": "2025-11-16T10:35:00Z"
    }
  ]
}
```

#### 5. Get Table Data
```http
GET /api/data/:tableName
```

**Response (SQL):**
```json
{
  "table": "data_users",
  "type": "sql",
  "rows": [...],
  "count": 5
}
```

**Response (NoSQL):**
```json
{
  "table": "document_5",
  "type": "nosql",
  "document": {
    "id": 5,
    "data": {...},
    "metadata": {...},
    "created_at": "2025-11-16T10:35:00Z"
  },
  "count": 1
}
```

#### 6. Download File (Signed URL)
```http
GET /api/download/:filename
```

**Response:**
```json
{
  "downloadUrl": "https://supabase.co/storage/...",
  "filename": "report.pdf",
  "fileType": "pdf"
}
```

#### 7. Download File (Proxy for PDFs)
```http
GET /api/download-proxy/:filename
```

**Response:** Binary file stream

#### 8. Delete File
```http
DELETE /api/delete-file/:filename
```

**Response:**
```json
{
  "message": "File deleted successfully",
  "filename": "report.pdf"
}
```

#### 9. Delete Schema/Table
```http
DELETE /api/delete-schema/:tableName
```

**Response:**
```json
{
  "message": "Schema and table deleted successfully",
  "tableName": "data_users"
}
```

---

## 🎭 Demo Flow

### Test Case 1: File Upload
1. Go to **Processor Panel**
2. Drag & drop `sample.pdf`
3. See instant receipt with file details
4. Switch to **File Explorer** → See file in Documents > pdf
5. Click download icon → File downloads
6. Click delete icon → Confirm → File removed

### Test Case 2: JSON Upload (Structured)
1. Go to **Processor Panel**
2. Paste this JSON:
```json
[
  {"name": "Alice", "email": "alice@example.com", "age": 30},
  {"name": "Bob", "email": "bob@example.com", "age": 25}
]
```
3. Click **Upload JSON**
4. See receipt showing SQL storage
5. Switch to **Data Explorer** → See new SQL table
6. Click table → View data

### Test Case 3: JSON Upload (Unstructured/Mixed)
1. Paste this JSON:
```json
[
  {"title": "Post 1", "views": 1234567890123456789},
  {"title": "Post 2", "likes": "many"}
]
```
2. See receipt showing NoSQL storage (due to overflow/mixed types)
3. Switch to **Data Explorer** → See new NoSQL document
4. Click document → View raw JSONB data

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `ECONNREFUSED localhost:4000`
```bash
# Solution: Make sure backend is running
cd server
npm run dev
```

**Problem:** `Supabase connection failed`
```bash
# Check .env file exists and has correct credentials
cat .env

# Test connection
curl http://localhost:4000/test-db
```

**Problem:** `Bucket not found`
```bash
# Create storage bucket in Supabase:
# Dashboard → Storage → New Bucket → "smartstorage" → Public
```

### Frontend Issues

**Problem:** `Failed to fetch`
```javascript
// Check API URL in client/vite-project/src/lib/api.js
const API_BASE_URL = 'http://localhost:4000/api';
```

**Problem:** `Module not found`
```bash
cd client/vite-project
rm -rf node_modules package-lock.json
npm install
```

### Common Errors

**"exec_sql function not found"**
- Run the SQL schema (Step 3 in setup) again
- Make sure to include the `CREATE FUNCTION exec_sql` part

**"Port already in use"**
```bash
# Change port in server/.env
PORT=4001
```

**PDF downloads fail**
- Make sure storage bucket is public
- Or add this policy in Supabase:
```sql
CREATE POLICY "Allow downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'smartstorage');
```

---

## 🎉 Credits

Built for the **Auraverse '25 Hackathon, SST**  
Team: <span style="color: green;"><b>Hara Wala Kurkure</b></span><br>
Repository: [github.com/Yuji25/AuraNexus](https://github.com/Yuji25/AuraNexus)

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🤝 Contributing

Feel free to fork, improve, and submit PRs!

---

**Happy Hacking! 🚀**
