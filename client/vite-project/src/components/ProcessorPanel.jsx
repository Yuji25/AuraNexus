import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';
import ReactJson from '@microlink/react-json-view';
import { uploadFiles, uploadJSON } from '../lib/api';
import { cn } from '../lib/utils';

export default function ProcessorPanel() {
  const [files, setFiles] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setError(null);
    },
  });

  const handleProcess = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      if (files.length > 0) {
        // Upload files
        const result = await uploadFiles(files);
        setResponse(result);
      } else if (textInput.trim()) {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(textInput);
          const result = await uploadJSON(parsed);
          setResponse(result);
        } catch {
          // If not valid JSON, send as plain text
          const result = await uploadJSON({ text: textInput });
          setResponse(result);
        }
      } else {
        setError('Please provide files or text input');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
      setResponse(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" />
          Processor - Unified Input
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload files or paste JSON/text to see instant processing proof
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Input Section */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-6 border-b overflow-auto">
          {/* File Dropzone */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">File Upload</label>
            <div
              {...getRootProps()}
              className={cn(
                "flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                files.length > 0 && "border-primary bg-primary/5"
              )}
            >
              <input {...getInputProps()} />
              <Upload className={cn("w-12 h-12 mb-4", files.length > 0 ? "text-primary" : "text-muted-foreground")} />
              {files.length > 0 ? (
                <div className="text-center">
                  <p className="font-medium">{files.length} file(s) selected</p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {files.map((f, i) => (
                      <div key={i}>{f.name}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-medium">Drag & drop files here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepts all file types (.png, .pdf, .json, .txt, etc.)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Text/JSON Input</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste JSON, malformed JSON, or any text here..."
              className="flex-1 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>
        </div>

        {/* Process Button */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/30">
          <button
            onClick={handleProcess}
            disabled={loading || (files.length === 0 && !textInput.trim())}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
              loading || (files.length === 0 && !textInput.trim())
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Process
              </>
            )}
          </button>
          <button
            onClick={() => {
              setFiles([]);
              setTextInput('');
              setResponse(null);
              setError(null);
            }}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Receipt Section */}
        <div className="flex-1 overflow-auto p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Receipt - Processing Result
          </h3>
          
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive mb-4">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {response ? (
            <div className="bg-muted/50 rounded-lg p-4 border">
              <ReactJson
                src={response}
                theme="rjv-default"
                collapsed={false}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={true}
                name={false}
                style={{ backgroundColor: 'transparent', fontSize: '0.875rem' }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground">
              <p className="text-sm">Process files or text to see the instant receipt here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
