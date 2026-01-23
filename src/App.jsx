// ============================================================
// src/App.jsx - COMPLETE WITH REACTFLOW PROVIDER
// ============================================================
import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useStore } from './store/useStore';
import { flowApi } from './api';
import { Header } from './components/layout/Header';
import { TopNavBar } from './components/layout/TopNavBar';
import { FlowEditor } from './components/flow/FlowEditor';
import { SettingsModal } from './components/modals/SettingsModal';
import { useFlowOperations } from './hooks/useFlowOperations';

function App() {
  const { setFlows, setNodeTypes, setRoutes, setStats, apiUrl } = useStore();
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    handleNewFlow,
    handleSaveFlow,
    handleExportFlow,
    handleImportFlow,
    handleDeleteFlow,
    handleToggleFlow,
    handleDebugExecute
  } = useFlowOperations();
  
  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('App: Loading initial data from', apiUrl);
        
        // Load node types
        const nodesData = await flowApi.fetchNodes();
        console.log('App: Loaded node types:', nodesData);
        setNodeTypes(nodesData.nodes || []);
        
        // Load flows
        const flowsData = await flowApi.fetchFlows();
        console.log('App: Loaded flows:', flowsData);
        setFlows(flowsData.flows || []);
        
        // Load routes
        try {
          const routesData = await flowApi.fetchRoutes();
          console.log('App: Loaded routes:', routesData);
          setRoutes(routesData.routes || []);
        } catch (err) {
          console.warn('App: Routes not available:', err);
        }
        
        // Load stats
        try {
          const statsData = await flowApi.fetchStats();
          console.log('App: Loaded stats:', statsData);
          setStats(statsData);
        } catch (err) {
          console.warn('App: Stats not available:', err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('App: Error loading data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [apiUrl, setFlows, setNodeTypes, setRoutes, setStats]);
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: 500, color: '#666' }}>
            Loading RedNox...
          </div>
          <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
            Connecting to {apiUrl}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{
          background: '#fff',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#f44336' }}>
            Connection Error
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            {error}
          </div>
          <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>
            API URL: {apiUrl}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '10px 20px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            ⚙️ Configure Settings
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />
      <TopNavBar
        onNew={handleNewFlow}
        onSave={handleSaveFlow}
        onExport={handleExportFlow}
        onImport={handleImportFlow}
        onDelete={handleDeleteFlow}
        onToggle={handleToggleFlow}
        onDebug={handleDebugExecute}
        onSettings={() => setShowSettings(true)}
      />
      
      {/* CRITICAL: Wrap FlowEditor in ReactFlowProvider */}
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
      
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
