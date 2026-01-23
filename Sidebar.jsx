// ============================================================
// src/components/layout/Sidebar.jsx
// ============================================================
import React from 'react';
import { useStore } from '../../store/useStore';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { DebugPanel } from '../panels/DebugPanel';
import { RoutesPanel } from '../panels/RoutesPanel';
import { TABS } from '../../utils/constants';

const Tab = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      flex: 1,
      padding: '12px',
      textAlign: 'center',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      borderBottom: active ? '2px solid #1976d2' : '2px solid transparent',
      color: active ? '#1976d2' : '#666',
      background: active ? '#f5f5f5' : 'transparent'
    }}
  >
    {label}
  </div>
);

export const Sidebar = ({ selectedNodeData, onUpdateNode }) => {
  const { activeTab, isSidebarOpen, routes, debugResults, setActiveTab } = useStore();
  
  if (!isSidebarOpen) return null;
  
  return (
    <div style={{
      width: '320px',
      background: '#fafafa',
      borderLeft: '1px solid #ddd',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: '#fff',
        borderBottom: '1px solid #ddd'
      }}>
        <Tab 
          label="Properties" 
          active={activeTab === TABS.PROPERTIES} 
          onClick={() => setActiveTab(TABS.PROPERTIES)} 
        />
        <Tab 
          label="Debug" 
          active={activeTab === TABS.DEBUG} 
          onClick={() => setActiveTab(TABS.DEBUG)} 
        />
        <Tab 
          label="Routes" 
          active={activeTab === TABS.ROUTES} 
          onClick={() => setActiveTab(TABS.ROUTES)} 
        />
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {activeTab === TABS.PROPERTIES && (
          <PropertiesPanel nodeData={selectedNodeData} onUpdate={onUpdateNode} />
        )}
        {activeTab === TABS.DEBUG && (
          <DebugPanel results={debugResults} />
        )}
        {activeTab === TABS.ROUTES && (
          <RoutesPanel routes={routes} />
        )}
      </div>
    </div>
  );
};