import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Play, Trash2, Activity, Database, Route, BarChart3, 
  Search, RefreshCw, AlertCircle, CheckCircle, Clock, Power, PowerOff, 
  Menu, X, Home, Boxes, Download, Upload, Edit3, Save, Code, 
  Maximize2, Minimize2, Eye, Settings, Zap, Link, FileJson,
  ChevronRight, ChevronDown, Filter, SortAsc, Grid, List
} from 'lucide-react';

// Mock API - Replace with your actual API_BASE
const API_BASE = 'https://rednox.ubixsnow08.workers.dev';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [flows, setFlows] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [flowsRes, nodesRes, routesRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/flows`).then(r => r.json()),
        fetch(`${API_BASE}/admin/nodes`).then(r => r.json()),
        fetch(`${API_BASE}/admin/routes`).then(r => r.json()),
        fetch(`${API_BASE}/admin/stats`).then(r => r.json())
      ]);
      
      setFlows(flowsRes.flows || []);
      setNodes(nodesRes.nodes || []);
      setRoutes(routesRes.routes || []);
      setStats(statsRes);
      setError(null);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        showSidebar={showSidebar}
        currentView={currentView}
        setCurrentView={setCurrentView}
        stats={stats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          currentView={currentView}
          onRefresh={loadData}
          setCurrentView={setCurrentView}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          <div className="p-4 md:p-6">
            {currentView === 'dashboard' && (
              <DashboardView stats={stats} flows={flows} />
            )}

            {currentView === 'flows' && (
              <FlowsView 
                flows={flows} 
                loading={loading}
                onRefresh={loadData}
                onEdit={(flow) => {
                  setSelectedFlow(flow);
                  setCurrentView('flow-editor');
                }}
              />
            )}

            {currentView === 'flow-editor' && (
              <FlowEditor 
                flow={selectedFlow}
                nodes={nodes}
                onBack={() => setCurrentView('flows')}
                onSave={loadData}
              />
            )}

            {currentView === 'routes' && (
              <RoutesView routes={routes} loading={loading} />
            )}

            {currentView === 'nodes' && (
              <NodesView nodes={nodes} loading={loading} />
            )}

            {currentView === 'logs' && (
              <LogsView />
            )}

            {currentView === 'database' && (
              <DatabaseView onRefresh={loadData} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ showSidebar, currentView, setCurrentView, stats }) {
  return (
    <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex-shrink-0`}>
      <div className="p-4 md:p-6 h-full overflow-y-auto">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">RedNox</h1>
            <p className="text-xs text-gray-500">Flow Engine</p>
          </div>
        </div>

        <nav className="space-y-1">
          <NavItem 
            icon={<Home className="w-5 h-5" />} 
            label="Dashboard" 
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />
          <NavItem 
            icon={<Activity className="w-5 h-5" />} 
            label="Flows" 
            badge={stats?.flows?.total}
            active={currentView === 'flows' || currentView === 'flow-editor'}
            onClick={() => setCurrentView('flows')}
          />
          <NavItem 
            icon={<Route className="w-5 h-5" />} 
            label="Routes" 
            badge={stats?.routes}
            active={currentView === 'routes'}
            onClick={() => setCurrentView('routes')}
          />
          <NavItem 
            icon={<Boxes className="w-5 h-5" />} 
            label="Nodes" 
            badge={stats?.nodes}
            active={currentView === 'nodes'}
            onClick={() => setCurrentView('nodes')}
          />
          <NavItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="Logs" 
            active={currentView === 'logs'}
            onClick={() => setCurrentView('logs')}
          />
          <NavItem 
            icon={<Database className="w-5 h-5" />} 
            label="Database" 
            active={currentView === 'database'}
            onClick={() => setCurrentView('database')}
          />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all text-sm md:text-base ${
        active 
          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-medium truncate">{label}</span>
      {badge !== undefined && badge !== null && (
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
          active ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function Header({ showSidebar, setShowSidebar, currentView, onRefresh, setCurrentView }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 capitalize truncate">
            {currentView.replace('-', ' ')}
          </h2>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Refresh</span>
          </button>
          
          {currentView === 'flows' && (
            <button
              onClick={() => setCurrentView('flow-editor')}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Flow</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function DashboardView({ stats, flows }) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Total Flows"
          value={stats?.flows?.total || 0}
          icon={<Activity className="w-5 h-5 md:w-6 md:h-6" />}
          color="blue"
        />
        <StatCard
          title="Active Flows"
          value={stats?.flows?.enabled || 0}
          icon={<CheckCircle className="w-5 h-5 md:w-6 md:h-6" />}
          color="green"
        />
        <StatCard
          title="Routes"
          value={stats?.routes || 0}
          icon={<Route className="w-5 h-5 md:w-6 md:h-6" />}
          color="purple"
        />
        <StatCard
          title="Nodes"
          value={stats?.nodes || 0}
          icon={<Boxes className="w-5 h-5 md:w-6 md:h-6" />}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Recent Flows</h3>
        <div className="space-y-3">
          {flows.slice(0, 5).map(flow => (
            <div key={flow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${flow.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm md:text-base truncate">{flow.name}</p>
                  <p className="text-xs md:text-sm text-gray-500 truncate">{flow.description || 'No description'}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {new Date(flow.updated_at).toLocaleDateString()}
              </span>
            </div>
          ))}
          {flows.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">No flows yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-gray-500 mb-1 truncate">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 md:p-3 bg-gradient-to-br ${colorClasses[color]} rounded-lg text-white flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function FlowsView({ flows, loading, onRefresh, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (flow.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search flows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-sm">Loading flows...</p>
        </div>
      ) : filteredFlows.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-sm">No flows found</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
          {filteredFlows.map(flow => (
            <FlowCard key={flow.id} flow={flow} onRefresh={onRefresh} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlowCard({ flow, onRefresh, onEdit }) {
  const [loading, setLoading] = useState(false);

  const toggleFlow = async (enabled) => {
    setLoading(true);
    try {
      const action = enabled ? 'enable' : 'disable';
      await fetch(`${API_BASE}/admin/flows/${flow.id}/${action}`, { method: 'POST' });
      onRefresh();
    } catch (err) {
      alert('Error toggling flow: ' + err.message);
    }
    setLoading(false);
  };

  const deleteFlow = async () => {
    if (!confirm(`Delete flow "${flow.name}"?`)) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/admin/flows/${flow.id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      alert('Error deleting flow: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">{flow.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
              flow.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {flow.enabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 line-clamp-2">{flow.description || 'No description'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">Updated {new Date(flow.updated_at).toLocaleDateString()}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onEdit(flow)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        
        <button
          onClick={() => toggleFlow(!flow.enabled)}
          disabled={loading}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            flow.enabled
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {flow.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          <span className="hidden sm:inline">{flow.enabled ? 'Disable' : 'Enable'}</span>
        </button>

        <button
          onClick={deleteFlow}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs md:text-sm font-medium hover:bg-red-200 transition-colors ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
}

function FlowEditor({ flow, nodes, onBack, onSave }) {
  const [flowData, setFlowData] = useState(flow || {
    name: '',
    description: '',
    nodes: []
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const canvasRef = useRef(null);

  const handleSave = async () => {
    try {
      const url = flow ? `${API_BASE}/admin/flows/${flow.id}` : `${API_BASE}/admin/flows`;
      const method = flow ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowData)
      });
      
      alert('Flow saved successfully!');
      onSave();
      onBack();
    } catch (err) {
      alert('Error saving flow: ' + err.message);
    }
  };

  const addNode = (nodeType) => {
    const newNode = {
      id: crypto.randomUUID(),
      type: nodeType.type,
      name: nodeType.ui?.paletteLabel || nodeType.type,
      x: 100,
      y: 100,
      wires: [[]]
    };
    
    setFlowData({
      ...flowData,
      nodes: [...flowData.nodes, newNode]
    });
    setShowNodePalette(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-200 p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm md:text-base"
          >
            ← Back
          </button>
          
          <input
            type="text"
            value={flowData.name}
            onChange={(e) => setFlowData({...flowData, name: e.target.value})}
            placeholder="Flow Name"
            className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base"
          />
          
          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all text-sm md:text-base"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
        
        <input
          type="text"
          value={flowData.description || ''}
          onChange={(e) => setFlowData({...flowData, description: e.target.value})}
          placeholder="Description"
          className="w-full mt-3 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs md:text-sm"
        />
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette - Mobile Drawer / Desktop Sidebar */}
        <div className={`${showNodePalette ? 'fixed inset-0 z-50 md:relative md:w-64' : 'hidden md:block md:w-64'} bg-white border-r border-gray-200 overflow-y-auto`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Node Palette</h3>
              <button
                onClick={() => setShowNodePalette(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {nodes.map(node => (
                <button
                  key={node.type}
                  onClick={() => addNode(node)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  style={{ borderLeft: `4px solid ${node.ui?.color || '#999'}` }}
                >
                  <span className="text-xl">{node.ui?.icon || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {node.ui?.paletteLabel || node.type}
                    </p>
                    <p className="text-xs text-gray-500">{node.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-50 overflow-auto">
          <button
            onClick={() => setShowNodePalette(true)}
            className="md:hidden fixed bottom-4 right-4 z-40 p-4 bg-red-500 text-white rounded-full shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>

          <div ref={canvasRef} className="min-h-full p-4 md:p-8">
            {flowData.nodes.length === 0 ? (
              <div className="text-center py-12">
                <Boxes className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-sm md:text-base">Add nodes from the palette to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flowData.nodes.map(node => (
                  <div
                    key={node.id}
                    className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4 max-w-xs cursor-move hover:border-red-500 transition-colors"
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        {node.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{node.name}</p>
                        <p className="text-xs text-gray-500">{node.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel - Mobile Drawer / Desktop Sidebar */}
        {selectedNode && (
          <div className="fixed inset-y-0 right-0 z-50 w-80 md:relative md:w-64 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Properties</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => {
                      const updated = flowData.nodes.map(n => 
                        n.id === selectedNode.id ? {...n, name: e.target.value} : n
                      );
                      setFlowData({...flowData, nodes: updated});
                      setSelectedNode({...selectedNode, name: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <p className="text-sm text-gray-500">{selectedNode.type}</p>
                </div>

                <button
                  onClick={() => {
                    const updated = flowData.nodes.filter(n => n.id !== selectedNode.id);
                    setFlowData({...flowData, nodes: updated});
                    setSelectedNode(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RoutesView({ routes, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoutes = routes.filter(route =>
    route.path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.flow_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search routes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Flow</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 md:px-6 py-8 text-center text-gray-500 text-sm">
                    Loading routes...
                  </td>
                </tr>
              ) : filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 md:px-6 py-8 text-center text-gray-500 text-sm">
                    No routes configured
                  </td>
                </tr>
              ) : (
                filteredRoutes.map(route => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {route.method}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 font-mono text-xs md:text-sm text-gray-900 break-all">
                      {route.fullUrl || route.path}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-900 hidden md:table-cell">
                      {route.flow_name}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        route.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {route.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NodesView({ nodes, loading }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...new Set(nodes.map(n => n.category))];
  
  const filteredNodes = nodes.filter(node => {
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    const matchesSearch = node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.ui?.paletteLabel?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm md:text-base"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-sm">Loading nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredNodes.map(node => (
            <div key={node.type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-white text-lg md:text-xl flex-shrink-0"
                  style={{ background: node.ui?.color || '#999' }}
                >
                  {node.ui?.icon || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                    {node.ui?.paletteLabel || node.type}
                  </h4>
                  <p className="text-xs text-gray-500">{node.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>In: {node.inputs}</span>
                <span>•</span>
                <span>Out: {node.outputs}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate loading logs
    setTimeout(() => {
      setLogs([
        { id: 1, timestamp: new Date().toISOString(), level: 'info', flow: 'Test Flow', message: 'Flow executed successfully' },
        { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'error', flow: 'API Flow', message: 'Node execution failed' },
        { id: 3, timestamp: new Date(Date.now() - 7200000).toISOString(), level: 'warning', flow: 'Webhook Handler', message: 'Rate limit approaching' }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.level === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'info', 'warning', 'error'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm whitespace-nowrap transition-colors ${
                filter === level
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-sm">Loading logs...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                    log.level === 'error' ? 'bg-red-100 text-red-800' :
                    log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 order-last sm:order-none">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{log.flow}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DatabaseView({ onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const initDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/init`, { method: 'POST' });
      const data = await res.json();
      setStatus(data.success ? 'success' : 'error');
      alert(data.success ? 'Database initialized successfully' : 'Database initialization failed: ' + (data.error || 'Unknown error'));
      if (data.success) onRefresh();
    } catch (err) {
      setStatus('error');
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-base md:text-lg font-semibold">Database Management</h3>
            <p className="text-xs md:text-sm text-gray-500">Initialize or reset the D1 database</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs md:text-sm text-blue-800">
              This will create all required tables for RedNox to function properly.
              Safe to run multiple times - existing data will not be affected.
            </p>
          </div>

          {status && (
            <div className={`p-4 border rounded-lg ${
              status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm ${
                  status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {status === 'success' 
                    ? 'Database initialized successfully' 
                    : 'Database initialization failed'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={initDatabase}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 text-sm md:text-base"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Initialize Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
