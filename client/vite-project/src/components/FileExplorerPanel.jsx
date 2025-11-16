import { useState, useEffect } from 'react';
import { FolderOpen, File, ChevronRight, ChevronDown, Loader2, RefreshCw, Download } from 'lucide-react';
import { getFiles, api } from '../lib/api';
import { cn } from '../lib/utils';

export default function FileExplorerPanel() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFiles();
      setFiles(data.files || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Build tree structure: Images/Documents/Others -> extension -> files
  const buildTree = () => {
    const tree = {
      'Images': {},
      'Documents': {},
      'Others': {}
    };
    
    // Extension to category mapping
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];
    const documentExtensions = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'json'];
    
    files.forEach((file) => {
      const extension = (file.file_type || 'unknown').toLowerCase();
      
      let category;
      if (imageExtensions.includes(extension)) {
        category = 'Images';
      } else if (documentExtensions.includes(extension)) {
        category = 'Documents';
      } else {
        category = 'Others';
      }
      
      if (!tree[category][extension]) {
        tree[category][extension] = [];
      }
      tree[category][extension].push(file);
    });
    
    // Remove empty categories
    Object.keys(tree).forEach(category => {
      if (Object.keys(tree[category]).length === 0) {
        delete tree[category];
      }
    });
    
    return tree;
  };

  const handleDownload = async (filename) => {
    // Add to downloading set
    setDownloadingFiles(prev => new Set(prev).add(filename));
    
    try {
      // Check if file is PDF (use proxy to avoid QUIC issues)
      const isPDF = filename.toLowerCase().endsWith('.pdf');
      
      if (isPDF) {
        // Use server proxy for PDFs to avoid QUIC protocol errors
        const response = await api.get(`/download-proxy/${encodeURIComponent(filename)}`, {
          responseType: 'blob'
        });
        
        // Create blob URL and trigger download
        const blob = response.data;
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          setDownloadingFiles(prev => {
            const next = new Set(prev);
            next.delete(filename);
            return next;
          });
        }, 100);
        
      } else {
        // Use direct signed URL for other files
        const response = await api.get(`/download/${encodeURIComponent(filename)}`);
        const { downloadUrl } = response.data;
        
        // Use XMLHttpRequest for direct download
        const xhr = new XMLHttpRequest();
        xhr.open('GET', downloadUrl, true);
        xhr.responseType = 'blob';
        
        xhr.onload = function() {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
              document.body.removeChild(link);
              window.URL.revokeObjectURL(blobUrl);
              setDownloadingFiles(prev => {
                const next = new Set(prev);
                next.delete(filename);
                return next;
              });
            }, 100);
          } else {
            throw new Error('Failed to download file');
          }
        };
        
        xhr.onerror = function() {
          setDownloadingFiles(prev => {
            const next = new Set(prev);
            next.delete(filename);
            return next;
          });
          alert('Download failed: Network error occurred');
        };
        
        xhr.send();
      }
      
    } catch (err) {
      setDownloadingFiles(prev => {
        const next = new Set(prev);
        next.delete(filename);
        return next;
      });
      alert('Download failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const tree = buildTree();

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            File Explorer
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse your smart-sorted file structure
          </p>
        </div>
        <button
          onClick={loadFiles}
          disabled={loading}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading && files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <p className="font-medium">Error loading files</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No files uploaded yet</p>
              <p className="text-sm mt-2">Upload files to see them organized here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {Object.entries(tree).map(([category, extensions]) => {
              const categoryPath = category;
              const isCategoryExpanded = expandedFolders.has(categoryPath);
              const categoryIcon = category === 'Images' ? '🖼️' : category === 'Documents' ? '📄' : '📦';
              
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleFolder(categoryPath)}
                    className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    {isCategoryExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="text-lg">{categoryIcon}</span>
                    <span className="font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">
                      ({Object.values(extensions).flat().length})
                    </span>
                  </button>
                  
                  {isCategoryExpanded && (
                    <div className="ml-6 space-y-1 mt-1">
                      {Object.entries(extensions).map(([extension, extensionFiles]) => {
                        const extensionPath = `${category}/${extension}`;
                        const isExtensionExpanded = expandedFolders.has(extensionPath);
                        
                        return (
                          <div key={extension}>
                            <button
                              onClick={() => toggleFolder(extensionPath)}
                              className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-lg transition-colors text-left"
                            >
                              {isExtensionExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <span className="text-base">🗂️</span>
                              <span className="font-medium">{extension}</span>
                              <span className="text-sm text-muted-foreground">
                                ({extensionFiles.length})
                              </span>
                            </button>
                            
                            {isExtensionExpanded && (
                              <div className="ml-6 space-y-1 mt-1">
                                {extensionFiles.map((file, idx) => {
                                  const isDownloading = downloadingFiles.has(file.filename);
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors group"
                                    >
                                      <span className="text-sm">📄</span>
                                      <span className="text-sm flex-1 truncate">{file.filename}</span>
                                      <button
                                        onClick={() => handleDownload(file.filename)}
                                        disabled={isDownloading}
                                        className={cn(
                                          "p-1 hover:bg-primary/10 rounded transition-all",
                                          isDownloading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                        )}
                                        title={isDownloading ? "Downloading..." : "Download file"}
                                      >
                                        {isDownloading ? (
                                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                        ) : (
                                          <Download className="w-4 h-4 text-primary" />
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
