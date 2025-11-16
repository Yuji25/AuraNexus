# 🎯 Quick Demo Script

## Frontend is Live!
Visit: **http://localhost:5173**

---

## 📥 Panel 1: Processor (The "Wow" Moment)

### Test 1: Upload a File
1. Click **Processor** tab
2. Drag & drop any file OR click to browse
3. Click **Process**
4. 👀 **Watch the Receipt** appear instantly with JSON response!

Example receipt for image:
```json
{
  "results": [{
    "file": "logo.png",
    "topic": "General",
    "storagePath": "png/General/1731726000000_logo.png"
  }]
}
```

### Test 2: Paste JSON
1. Clear previous input
2. Paste this in the text area:
```json
[
  { "id": 1, "name": "Alice", "age": 25 },
  { "id": 2, "name": "Bob", "age": 30 }
]
```
3. Click **Process**
4. 👀 **See the receipt** showing SQL table creation!

Expected receipt:
```json
{
  "mode": "SQL",
  "status": "Created new table",
  "destinationTable": "data_abc123",
  "rowsInserted": 2
}
```

### Test 3: Malformed/Huge JSON
Paste this:
```json
[
  { "value": 999999999999999999999999999999999999999999 }
]
```
👀 **Watch it fallback to NoSQL!**

---

## 🗂️ Panel 2: File Explorer

1. Click **File Explorer** tab
2. See your uploaded files organized in a tree!
3. Expand folders to browse

Example tree structure:
```
📁 pdf
  📁 Cooking
    📄 cookbook.pdf
📁 png  
  📁 General
    📄 logo.png
📁 txt
  📁 General
    📄 notes.txt
```

4. Click **Refresh** icon to reload after new uploads

---

## 🧑‍🔬 Panel 3: Data Explorer

1. Click **Data Explorer** tab
2. **Left sidebar**: See all discovered schemas
3. Click any schema to view its data
4. 👀 **JSON viewer** shows table contents

Example schemas you'll see:
- `data_abc123` - Your structured JSON tables
- `documents` - Unstructured/NoSQL data

---

## 🎬 Full Demo Flow (3 minutes)

### Act 1: The Upload (30 sec)
1. Open Processor
2. Drag `report.pdf` → Process
3. Show receipt: `"topic": "General"` 

### Act 2: The Organization (45 sec)
4. Switch to File Explorer
5. Show folder tree: `pdf > General > report.pdf`
6. Explain: "Automatic categorization!"

### Act 3: The Intelligence (90 sec)
7. Back to Processor
8. Paste structured JSON:
```json
[
  {"id": 1, "product": "Laptop", "price": 999},
  {"id": 2, "product": "Mouse", "price": 25}
]
```
9. Show receipt: SQL table created
10. Switch to Data Explorer
11. Click the new schema
12. Show table data with 2 rows
13. Explain: "Same schema = same table, different schema = new table"

### Finale: The Proof (15 sec)
14. Paste huge number JSON
15. Show: "NoSQL fallback"
16. Explain: "Smart decisions based on data structure!"

---

## 🚀 Advanced Tests

### Multi-File Upload
```
Drag multiple files at once:
- photo1.jpg
- photo2.jpg  
- document.pdf
```
Receipt shows array of results!

### Schema Reuse Test
```json
// First upload
[{"id": 1, "name": "Test"}]
// Note the table name in receipt

// Second upload (same schema)
[{"id": 2, "name": "Test2"}]
// Same table name! Data appended
```

### Topic Detection Test
Upload file named `recipe-cookbook.pdf`
→ Topic detected: "Cooking"

---

## 🎤 Talking Points

**For organizers:**

1. **Unified Interface**: 
   "One dropzone accepts PDFs, images, JSON, text - anything!"

2. **Instant Proof**:
   "Every upload returns a JSON receipt immediately - full transparency"

3. **Smart Sorting**:
   "Files automatically organized by type and topic - see the tree view"

4. **Intelligent Storage**:
   "Structured JSON → SQL tables with schema fingerprinting
    Unstructured → NoSQL documents
    Same schema → reuses existing table!"

5. **Dynamic Exploration**:
   "Frontend has no idea what tables exist - it discovers them from backend!"

---

## 🐛 Quick Fixes

**Nothing in File Explorer?**
- Upload a file first in Processor panel
- Click refresh icon

**No schemas in Data Explorer?**
- Upload JSON data first in Processor panel
- Check receipt shows SQL mode

**Receipt shows error?**
- Check backend terminal for logs
- Verify Supabase bucket exists
- Check .env configuration

---

## 📸 Screenshots to Take

1. Processor with file dropzone
2. Receipt showing JSON response
3. File Explorer tree view
4. Data Explorer schema list
5. Table data viewer showing rows

---

## ✅ Demo Checklist

Before presenting:
- [ ] Backend running (`npm run dev` in server/)
- [ ] Frontend running (`npm run dev` in client/vite-project/)
- [ ] Both URLs accessible
- [ ] Test file ready (PDF or image)
- [ ] JSON test data copied
- [ ] Browser window maximized
- [ ] Clear browser cache if needed

---

**Break a leg! 🎭**
