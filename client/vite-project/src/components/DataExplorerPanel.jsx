import { useState, useEffect } from 'react';
import { Database, Table, Loader2, RefreshCw, ChevronRight, FileJson } from 'lucide-react';
import ReactJson from '@microlink/react-json-view';
import { getSchemas, getTableData } from '../lib/api';
import { cn } from '../lib/utils';

export default function DataExplorerPanel() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);

  const loadSchemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchemas();
      setSchemas(data.schemas || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load schemas');
    } finally {
      setLoading(false);
    }
  };

  const loadTable = async (tableName) => {
    setLoadingTable(true);
    setSelectedTable(tableName);
    setTableData(null);
    try {
      const data = await getTableData(tableName);
      setTableData(data);
    } catch (err) {
      setTableData({ error: err.response?.data?.error || err.message });
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    loadSchemas();
  }, []);

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Data Explorer
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Explore discovered schemas and query intelligent storage
          </p>
        </div>
        <button
          onClick={loadSchemas}
          disabled={loading}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Schema List */}
        <div className="w-80 border-r flex flex-col">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">Schema Registry</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {schemas.length} schema(s) discovered
            </p>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            ) : schemas.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground px-4">
                <div>
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No schemas found</p>
                  <p className="text-xs mt-1">Upload JSON data to see schemas</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {schemas.map((schema, idx) => {
                  const isNoSQL = schema.schema_type === 'nosql' || schema.table_name === 'documents';
                  return (
                    <button
                      key={idx}
                      onClick={() => loadTable(schema.table_name)}
                      className={cn(
                        "w-full p-3 rounded-lg transition-colors text-left border",
                        selectedTable === schema.table_name
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted border-border"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {isNoSQL ? (
                          <FileJson className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Table className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {isNoSQL ? `Document #${schema.document_id}` : schema.table_name}
                            </p>
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded font-semibold",
                              isNoSQL
                                ? selectedTable === schema.table_name
                                  ? "bg-orange-500/20 text-orange-100"
                                  : "bg-orange-500/10 text-orange-600"
                                : selectedTable === schema.table_name
                                  ? "bg-blue-500/20 text-blue-100"
                                  : "bg-blue-500/10 text-blue-600"
                            )}>
                              {isNoSQL ? 'NoSQL' : 'SQL'}
                            </span>
                          </div>
                          <p className={cn(
                            "text-xs truncate",
                            selectedTable === schema.table_name ? "opacity-90" : "text-muted-foreground"
                          )}>
                            {isNoSQL 
                              ? (schema.created_at ? new Date(schema.created_at).toLocaleString() : 'No timestamp')
                              : (schema.signature || 'Unstructured')
                            }
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Table Data Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b bg-muted/30 flex items-center gap-3">
            <h3 className="font-semibold flex-1">
              {selectedTable ? selectedTable : 'Select a schema'}
            </h3>
            {selectedTable && tableData && tableData.type && (
              <span className={cn(
                "text-xs px-2 py-1 rounded font-semibold",
                tableData.type === 'nosql'
                  ? "bg-orange-500/10 text-orange-600"
                  : "bg-blue-500/10 text-blue-600"
              )}>
                {tableData.type === 'nosql' ? 'NoSQL' : 'SQL'}
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            {!selectedTable ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Table className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a schema to view its data</p>
                </div>
              </div>
            ) : loadingTable ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tableData ? (
              <div className="bg-muted/50 rounded-lg p-4 border">
                <ReactJson
                  src={tableData.type === 'nosql' && tableData.document ? tableData.document : tableData}
                  theme="rjv-default"
                  collapsed={1}
                  displayDataTypes={false}
                  displayObjectSize={true}
                  enableClipboard={true}
                  name={selectedTable}
                  style={{ backgroundColor: 'transparent', fontSize: '0.875rem' }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
