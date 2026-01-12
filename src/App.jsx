import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Settings, 
  Plus, 
  Play, 
  Save, 
  Trash2, 
  List, 
  Code,
  Menu,
  X,
  Zap,
  Database,
} from 'lucide-react';
import { API_BASE } from './config';

// Custom Node Component
const CustomNode = ({ data }) => {
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 15px',
      borderRadius: '6px',
      border: '2px solid',
      background: 'white',
      minWidth: '150px',
      fontSize: '13px',
    };
    
    return {
      ...baseStyle,
      borderColor: data.color || '#3b82f6',
      background: data.colorLight || '#eff6ff',
    };
  };

  return (
    <div style={getNodeStyle()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>{data.icon || '⚙️'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>
            {data.label || data.type}
          </div>
          {data.name && (
            <div style={{ fontSize: '11px', opacity: 0.7 }}>
              {data.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Sidebar Component
const Sidebar = ({ isOpen, onClose, nodeCategories, onAddNode }) => {
  if (!isOpen) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Node Palette</h2>
        <button onClick={onClose} className="btn-icon">
          <X size={20} />
        </button>
      </div>
      <div className="sidebar-content">
        {Object.entries(nodeCategories).map(([category, nodes]) => (
          <div key={category} className="node-category">
            <h3>{category}</h3>
            {nodes.map((node) => (
              <button
                key={node.type}
                className="node-palette-item"
                onClick={() => onAddNode(node)}
                style={{
                  borderLeft: `4px solid ${node.ui.color}`,
                }}
              >
                <span>{node.ui.icon}</span>
                <span>{node.ui.paletteLabel || node.type}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Flow List Component
const FlowList = ({ flows, onSelectFlow, onCreateFlow, onDeleteFlow }) => {
  return (
    <div className="flow-list">
      <div className="flow-list-header">
        <h2>Your Flows</h2>
        <button onClick={onCreateFlow} className="btn-primary">
          <Plus size={16} />
          New Flow
        </button>
      </div>
      <div className="flow-items">
        {flows.length === 0 ? (
          <div className="empty-state">
            <Code size={48} style={{ opacity: 0.3 }} />
            <p>No flows yet</p>
            <button onClick={onCreateFlow} className="btn-primary">
              Create your first flow
            </button>
          </div>
        ) : (
          flows.map((flow) => (
            <div
              key={flow.id}
              className="flow-item"
              onClick={() => onSelectFlow(flow)}
            >
              <div className="flow-item-header">
                <h3>{flow.name}</h3>
                <span className={`badge ${flow.enabled ? 'badge-success' : 'badge-secondary'}`}>
                  {flow.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {flow.description && (
                <p className="flow-description">{flow.description}</p>
              )}
              <div className="flow-item-footer">
                <span className="flow-date">
                  Updated: {new Date(flow.updated_at).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFlow(flow.id);
                  }}
                  className="btn-icon btn-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [view, setView] = useState('flows');
  const [flows, setFlows] = useState([]);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeCategories, setNodeCategories] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    try {
      const initRes = await fetch(`${API_BASE}/admin/init`, {
        method: 'POST',
      });
      
      if (!initRes.ok) {
        console.warn('Database might already be initialized');
      }

      const nodesRes = await fetch(`${API_BASE}/admin/nodes`);
      const nodesData = await nodesRes.json();
      
      const categorized = {};
      nodesData.nodes.forEach((node) => {
        if (!categorized[node.category]) {
          categorized[node.category] = [];
        }
        categorized[node.category].push(node);
      });
      setNodeCategories(categorized);

      await loadFlows();
      await loadStats();

      setInitialized(true);
    } catch (err) {
      console.error('Initialization error:', err);
      alert('Failed to initialize. Please check your API endpoint in src/config.js');
    } finally {
      setLoading(false);
    }
  };

  const loadFlows = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/flows`);
      const data = await res.json();
      setFlows(data.flows || []);
    } catch (err) {
      console.error('Failed to load flows:', err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreateFlow = async () => {
    const name = prompt('Flow name:');
    if (!name) return;

    const description = prompt('Description (optional):');

    const newFlow = {
      name,
      description,
      nodes: [],
    };

    try {
      const res = await fetch(`${API_BASE}/admin/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlow),
      });

      const data = await res.json();
      if (data.flowId) {
        await loadFlows();
        alert('Flow created successfully!');
      }
    } catch (err) {
      console.error('Failed to create flow:', err);
      alert('Failed to create flow');
    }
  };

  const handleSelectFlow = async (flow) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/flows/${flow.id}`);
      const data = await res.json();
      
      setCurrentFlow(data);
      
      const reactFlowNodes = (data.config.nodes || []).map((node, idx) => ({
        id: node.id,
        type: 'custom',
        position: node.position || { x: 100 + (idx * 200), y: 100 },
        data: {
          label: node.name || node.type,
          type: node.type,
          name: node.name,
          icon: getNodeIcon(node.type),
          color: getNodeColor(node.type),
          colorLight: getNodeColorLight(node.type),
          ...node,
        },
      }));

      const reactFlowEdges = [];
      (data.config.nodes || []).forEach((node) => {
        (node.wires || []).forEach((wireGroup, outputIndex) => {
          wireGroup.forEach((targetId) => {
            reactFlowEdges.push({
              id: `${node.id}-${outputIndex}-${targetId}`,
              source: node.id,
              target: targetId,
            });
          });
        });
      });

      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
      setView('editor');
    } catch (err) {
      console.error('Failed to load flow:', err);
      alert('Failed to load flow');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlow = async (flowId) => {
    if (!confirm('Are you sure you want to delete this flow?')) return;

    try {
      await fetch(`${API_BASE}/admin/flows/${flowId}`, {
        method: 'DELETE',
      });
      await loadFlows();
    } catch (err) {
      console.error('Failed to delete flow:', err);
      alert('Failed to delete flow');
    }
  };

  const handleSaveFlow = async () => {
    if (!currentFlow) return;

    const flowConfig = {
      name: currentFlow.name,
      description: currentFlow.description,
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.data.type,
        name: node.data.name,
        position: node.position,
        wires: edges
          .filter((edge) => edge.source === node.id)
          .reduce((acc, edge) => {
            if (!acc[0]) acc[0] = [];
            acc[0].push(edge.target);
            return acc;
          }, []),
        ...node.data,
      })),
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/flows/${currentFlow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowConfig),
      });

      if (res.ok) {
        alert('Flow saved successfully!');
        await loadFlows();
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.error}`);
      }
    } catch (err) {
      console.error('Failed to save flow:', err);
      alert('Failed to save flow');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = (nodeType) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        label: nodeType.ui.paletteLabel || nodeType.type,
        type: nodeType.type,
        icon: nodeType.ui.icon,
        color: nodeType.ui.color,
        colorLight: nodeType.ui.colorLight,
        wires: [],
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSidebarOpen(false);
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const getNodeIcon = (type) => {
    const icons = {
      'http-in': '🌐',
      'http-response': '📤',
      'function': '⚡',
      'debug': '🐛',
      'inject': '💉',
      'change': '🔧',
      'switch': '⚖️',
      'template': '📝',
      'json': '{ }',
    };
    return icons[type] || '⚙️';
  };

  const getNodeColor = (type) => {
    return '#3b82f6';
  };

  const getNodeColorLight = (type) => {
    return '#eff6ff';
  };

  if (loading && !initialized) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Initializing RedNox...</p>
      </div>
    );
  }

  return (
    <>
      <div className="app">
        <header className="header">
          <div className="header-left">
            <Zap size={24} color="#3b82f6" />
            <h1>RedNox Admin</h1>
          </div>
          <div className="header-right">
            {view === 'editor' && (
              <>
                <button onClick={() => setView('flows')} className="btn-secondary">
                  <List size={16} />
                  All Flows
                </button>
                <button onClick={handleSaveFlow} className="btn-primary">
                  <Save size={16} />
                  Save
                </button>
              </>
            )}
            {stats && (
              <div className="stats-badge">
                <Database size={14} />
                {stats.flows.total} flows
              </div>
            )}
          </div>
        </header>

        <main className="main">
          {view === 'flows' ? (
            <FlowList
              flows={flows}
              onSelectFlow={handleSelectFlow}
              onCreateFlow={handleCreateFlow}
              onDeleteFlow={handleDeleteFlow}
            />
          ) : (
            <>
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                nodeCategories={nodeCategories}
                onAddNode={handleAddNode}
              />
              <div className="editor-container">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                  <Panel position="top-left">
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="btn-primary"
                    >
                      <Menu size={16} />
                      Add Node
                    </button>
                  </Panel>
                </ReactFlow>
              </div>
            </>
          )}
        </main>
      </div>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .app { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: white; border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header-left { display: flex; align-items: center; gap: 0.75rem; }
        .header-left h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
        .header-right { display: flex; align-items: center; gap: 0.75rem; }
        .stats-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #eff6ff; border-radius: 6px; font-size: 0.875rem; color: #1e40af; font-weight: 500; }
        .main { flex: 1; overflow: hidden; position: relative; }
        .flow-list { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .flow-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .flow-list-header h2 { font-size: 1.875rem; font-weight: 700; color: #1e293b; }
        .flow-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .flow-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.2s; }
        .flow-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .flow-item-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem; }
        .flow-item-header h3 { font-size: 1.125rem; font-weight: 600; color: #1e293b; }
        .flow-description { color: #64748b; font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.5; }
        .flow-item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .flow-date { font-size: 0.75rem; color: #94a3b8; }
        .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-secondary { background: #f1f5f9; color: #64748b; }
        .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; text-align: center; color: #94a3b8; }
        .empty-state p { margin: 1rem 0 2rem; font-size: 1.125rem; }
        .sidebar { position: absolute; top: 0; left: 0; bottom: 0; width: 320px; background: white; border-right: 1px solid #e2e8f0; box-shadow: 2px 0 8px rgba(0,0,0,0.1); z-index: 1000; display: flex; flex-direction: column; }
        .sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .sidebar-header h2 { font-size: 1.25rem; font-weight: 600; color: #1e293b; }
        .sidebar-content { flex: 1; overflow-y: auto; padding: 1rem; }
        .node-category { margin-bottom: 1.5rem; }
        .node-category h3 { font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        .node-palette-item { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; font-weight: 500; color: #334155; }
        .node-palette-item:hover { background: #f8fafc; border-color: #cbd5e1; }
        .editor-container { width: 100%; height: 100%; }
        .btn-primary { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: white; color: #334155; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
        .btn-icon { display: flex; align-items: center; justify-content: center; padding: 0.5rem; background: transparent; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; color: #64748b; }
        .btn-icon:hover { background: #f1f5f9; color: #334155; }
        .btn-danger { color: #dc2626; }
        .btn-danger:hover { background: #fee2e2; }
        .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; }
        .spinner { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-screen p { margin-top: 1rem; color: #64748b; font-size: 0.875rem; }
        @media (max-width: 768px) {
          .header { padding: 0.75rem 1rem; }
          .header-left h1 { font-size: 1.25rem; }
          .flow-list { padding: 1rem; }
          .flow-items { grid-template-columns: 1fr; }
          .sidebar { width: 100%; max-width: 320px; }
        }
      `}</style>
    </>
  );
}
