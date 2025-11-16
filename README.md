# Smart Storage System - Frontend

Fast, reliable frontend built with **Vite + React + Tailwind CSS** for demonstrating intelligent file and data organization.

## 🎯 Features

### Panel 1: The Processor (Unified Input & Proof)
- **File Dropzone**: Drag & drop any file type (.png, .pdf, .json, .txt, etc.)
- **Text Area**: Paste raw JSON, malformed JSON, or plain text
- **Instant Receipt**: JSON response viewer showing processing proof
- Perfect for live demos - shows immediate backend response

### Panel 2: File Explorer (Smart File Organization)
- Tree view visualization of your uploaded files
- Automatic categorization by file type and topic
- Hierarchical folder structure: `FileType > Topic > Files`
- Expandable/collapsible folders
- Real-time file count

### Panel 3: Data Explorer (Schema Intelligence)
- Schema registry browser
- View all discovered database schemas
- Query any table dynamically
- JSON viewer for structured data
- Shows SQL vs NoSQL storage decisions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Running backend server on `http://localhost:4000`

### Installation

```bash
cd client/vite-project
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📦 Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool & dev server
- **Tailwind CSS 3** - Utility-first styling
- **Axios** - HTTP client
- **react-dropzone** - File upload
- **@microlink/react-json-view** - JSON visualization
- **Lucide React** - Icon library

## 🎨 Design System

Uses a custom Tailwind theme with CSS variables for easy theming:
- Primary color: Blue (`hsl(221.2 83.2% 53.3%)`)
- Card backgrounds with backdrop blur
- Muted colors for secondary elements
- Smooth transitions and hover states

## 📡 API Endpoints

The frontend consumes these backend APIs:

- `POST /api/upload` - Upload files (multipart/form-data)
- `POST /api/upload-json` - Upload JSON/text data
- `GET /api/files` - Retrieve all uploaded files
- `GET /api/schemas` - Retrieve schema registry
- `GET /api/data/:tableName` - Query specific table

## 🎭 Demo Flow

1. **Upload Test**: Drop a file or paste JSON → See instant receipt
2. **Browse Files**: Switch to File Explorer → See organized tree
3. **Query Data**: Open Data Explorer → Browse schemas & tables

## 🔧 Configuration

Update API base URL in `src/lib/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:4000/api';
```

## 🎯 Hackathon Ready

- ✅ Clean, professional UI
- ✅ Instant visual proof of processing
- ✅ Live data exploration
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Smooth animations

## 📝 Project Structure

```
src/
├── components/
│   ├── ProcessorPanel.jsx    # Panel 1: Upload & Receipt
│   ├── FileExplorerPanel.jsx # Panel 2: File Browser
│   └── DataExplorerPanel.jsx # Panel 3: Schema Explorer
├── lib/
│   ├── api.js                 # API client
│   └── utils.js               # Utility functions
├── App.jsx                    # Main app with tabs
└── index.css                  # Tailwind + custom styles
```

## 🎉 Credits

Built for the **Auraverse '25 Hackathon, SST**

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
