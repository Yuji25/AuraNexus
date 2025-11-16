import { useState } from 'react';
import ProcessorPanel from './components/ProcessorPanel';
import FileExplorerPanel from './components/FileExplorerPanel';
import DataExplorerPanel from './components/DataExplorerPanel';
import { Database, Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('processor');

  const tabs = [
    { id: 'processor', label: 'Processor', icon: Sparkles },
    { id: 'files', label: 'File Explorer', icon: Database },
    { id: 'data', label: 'Data Explorer', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AuraNexus
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Intelligent file & data organization with instant proof
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Live Demo
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-3 font-medium transition-all flex items-center gap-2 border-b-2
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="h-[calc(100vh-16rem)]">
          {activeTab === 'processor' && <ProcessorPanel />}
          {activeTab === 'files' && <FileExplorerPanel />}
          {activeTab === 'data' && <DataExplorerPanel />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
          <p>Auraverse '25 Hackathon, SST - Smart Storage Demo</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
