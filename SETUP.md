# Smart Storage System - Complete Setup Guide

## 🎯 Project Overview

A smart storage system with intelligent file and data organization, featuring:
- **Unified file upload** (all types: images, PDFs, JSON, text, etc.)
- **Automatic categorization** by file type and content topic
- **Smart JSON storage** with schema fingerprinting (SQL for structured, NoSQL for unstructured)
- **Beautiful frontend** with 3 panels for instant proof and exploration

---

## 🚀 Quick Start

### 1. Backend Setup

```powershell
cd server
npm install
```

Create `.env` file:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
PORT=4000
NODE_ENV=development
```

**Required Supabase Setup:**

Run these SQL commands in Supabase SQL Editor:

```sql
-- 1. Create files table
CREATE TABLE IF NOT EXISTS files (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  topic TEXT,
  file_type TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create documents table (for unstructured JSON)
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create schemas registry
CREATE TABLE IF NOT EXISTS schemas (
  schema_id TEXT PRIMARY KEY,
  signature TEXT NOT NULL,
  table_name TEXT NOT NULL,
  columns JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create storage bucket
-- Go to Storage → Create bucket → name: "smartstorage" → Public or Private

-- 5. Create exec_sql function (for dynamic table creation)
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

GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
```

Start backend:
```powershell
npm run dev
```

Backend runs on: `http://localhost:4000`

### 2. Frontend Setup

```powershell
cd client/vite-project
npm install
```

Create `.env` (optional, defaults to localhost:4000):
```env
VITE_API_URL=http://localhost:4000/api
```

Start frontend:
```powershell
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🎭 Demo Workflow

### Test Case 1: File Upload (Images/PDFs)
1. Open `http://localhost:5173`
2. Go to **Processor** panel
3. Drag & drop a file (e.g., `logo.png`, `report.pdf`)
4. Click "Process"
5. **Receipt shows**: `{ "status": "File Stored", "fileType": "png", "topic": "General", ... }`
6. Switch to **File Explorer** → See organized tree: `png > General > logo.png`

### Test Case 2: JSON Upload (Structured Data)
1. In **Processor** panel, paste this JSON in text area:
```json
[
  { "id": 1, "name": "Alice", "age": 25 },
  { "id": 2, "name": "Bob", "age": 30 }
]
```
2. Click "Process"
3. **Receipt shows**: `{ "mode": "SQL", "destinationTable": "data_abc123", ... }`
4. Switch to **Data Explorer** → See new schema → Click to view table data

### Test Case 3: Malformed/Unstructured JSON
1. Paste this in text area:
```json
[
  { "name": "Test", "steps": [1,2,3] },
  { "id": 99, "value": 123456789012345678901234567890 }
]
```
2. **Receipt shows**: `{ "mode": "NoSQL", "status": "Stored as document", ... }`
3. Switch to **Data Explorer** → See `documents` table

---

## 📡 API Endpoints

### Upload Endpoints
- `POST /api/upload` - Upload files (multipart/form-data, field: `files`)
- `POST /api/upload-json` - Upload JSON/text (raw body or `{"json": "..."}`)

### Retrieval Endpoints
- `GET /api/files` - Get all uploaded files
- `GET /api/schemas` - Get schema registry
- `GET /api/data/:tableName` - Query specific table

---

## 🏗️ Architecture

### Backend (Node.js + Express + Supabase)
```
server/
├── src/
│   ├── app.js                         # Main Express app
│   ├── config/supabaseClient.js       # Supabase init
│   ├── controllers/
│   │   ├── upload.controller.js       # File upload handler
│   │   ├── json.controller.js         # JSON upload handler
│   │   └── data.controller.js         # Retrieval endpoints
│   ├── services/
│   │   ├── upload.service.js          # File processing logic
│   │   ├── json.service.js            # Smart JSON storage
│   │   └── topicDetection.service.js  # Content categorization
│   ├── middleware/upload.middleware.js # Multer config
│   └── utils/
│       ├── textExtract.util.js        # PDF text extraction
│       ├── fileType.util.js           # MIME detection
│       └── sql.util.js                # SQL sanitization
```

### Frontend (React + Vite + Tailwind)
```
client/vite-project/src/
├── components/
│   ├── ProcessorPanel.jsx             # Panel 1: Upload + Receipt
│   ├── FileExplorerPanel.jsx          # Panel 2: File tree
│   └── DataExplorerPanel.jsx          # Panel 3: Schema browser
├── lib/
│   ├── api.js                         # Axios API client
│   └── utils.js                       # Tailwind utilities
└── App.jsx                            # Main app with tabs
```

---

## 🎨 Key Features Explained

### 1. Unified Input (Panel 1)
- **Why**: Single interface for all data types (requirement)
- **How**: Dropzone accepts any file; text area accepts JSON/text
- **Proof**: Instant JSON receipt shows backend processing decision

### 2. Smart File Organization (Panel 2)
- **Why**: "Properly sorted folder structure" requirement
- **How**: Files stored as `{fileType}/{topic}/{filename}`
- **Proof**: Tree view shows hierarchical organization

### 3. Intelligent JSON Storage (Panel 3)
- **Why**: "See correct schema" + "retrieve all uploaded files"
- **How**: Schema fingerprinting reuses tables for same structure
- **Decisions**:
  - Same schema → Reuse table
  - Overflow (huge numbers) → NoSQL
  - Mixed types → NoSQL
  - Consistent structure → SQL with typed columns
- **Proof**: Schema list + dynamic table viewer

---

## 🔧 Troubleshooting

### Backend Issues

**Port conflict:**
```powershell
# Change PORT in server/.env
PORT=5000
```

**Supabase errors:**
- Check `.env` has correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Verify bucket `smartstorage` exists
- Ensure `exec_sql` function created

**PDF parsing fails:**
```powershell
cd server
npm install pdf-parse@1.1.1
```

### Frontend Issues

**API connection fails:**
- Check backend is running on correct port
- Update `client/vite-project/.env`:
```env
VITE_API_URL=http://localhost:YOUR_PORT/api
```

**CORS errors:**
- Backend already has `cors()` enabled
- If issues persist, specify origin in `server/src/app.js`:
```javascript
app.use(cors({ origin: 'http://localhost:5173' }));
```

---

## 📦 Tech Stack

### Backend
- Node.js 18+
- Express.js
- Supabase (PostgreSQL + Storage)
- Multer (file uploads)
- pdf-parse (PDF extraction)

### Frontend
- React 19
- Vite 7
- Tailwind CSS 3
- Axios
- react-dropzone
- @microlink/react-json-view
- Lucide React (icons)

---

## 🎯 Hackathon Checklist

- ✅ Unified interface for all file types
- ✅ JSON upload (valid, malformed, huge numbers)
- ✅ Smart file sorting by type & topic
- ✅ Schema fingerprinting & table reuse
- ✅ SQL for structured, NoSQL for unstructured
- ✅ Instant processing proof (JSON receipt)
- ✅ File retrieval with tree view
- ✅ Dynamic schema exploration
- ✅ Beautiful, responsive UI
- ✅ Error handling & loading states

---

## 🚢 Deployment

### Backend (Railway/Render)
1. Set environment variables
2. Deploy from `server/` folder
3. Update frontend API URL

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set `VITE_API_URL` environment variable

---

## 📝 Notes

- **PDF parsing**: Uses pdf-parse@1.1.1 (ESM compatible)
- **File limit**: 100MB per file (configurable in `upload.middleware.js`)
- **Security**: SQL identifiers sanitized, table names validated
- **Schema limit**: 100 rows per table query (configurable in `data.controller.js`)

---

## 🎉 Credits

**Auraverser Hackathon 2025**

Built with ❤️ using:
- Vite + React for blazing fast frontend
- Supabase for intelligent backend storage
- Tailwind CSS for beautiful UI
