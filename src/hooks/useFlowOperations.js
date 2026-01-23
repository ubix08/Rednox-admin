// ============================================================
// src/hooks/useFlowOperations.js
// ============================================================
import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { flowApi } from '../api';
import { convertToRedNoxFormat } from '../utils/converters';

export const useFlowOperations = () => {
  const { setFlows, currentFlow, reactFlowNodes, reactFlowEdges } = useStore();
  
  const handleNewFlow = useCallback(async () => {
    const name = prompt('Enter flow name:');
    if (!name) return;
    
    try {
      const flowData = { 
        name, 
        description: '', 
        version: '1.0.0', 
        nodes: [] 
      };
      
      const result = await flowApi.createFlow(flowData);
      
      const flowsData = await flowApi.fetchFlows();
      setFlows(flowsData.flows || []);
      
      const newFlow = await flowApi.fetchFlow(result.flowId);
      useStore.getState().setCurrentFlow(newFlow);
      
      alert('Flow created successfully!');
    } catch (err) {
      alert('Error creating flow: ' + err.message);
    }
  }, [setFlows]);
  
  const handleSaveFlow = useCallback(async () => {
    if (!currentFlow) {
      alert('No flow selected');
      return;
    }
    
    try {
      const rednoxNodes = convertToRedNoxFormat(reactFlowNodes, reactFlowEdges);
      
      const flowData = {
        name: currentFlow.name,
        description: currentFlow.description || '',
        version: currentFlow.version || '1.0.0',
        nodes: rednoxNodes
      };
      
      await flowApi.updateFlow(currentFlow.id, flowData);
      
      const flowsData = await flowApi.fetchFlows();
      setFlows(flowsData.flows || []);
      
      const updatedFlow = await flowApi.fetchFlow(currentFlow.id);
      useStore.getState().setCurrentFlow(updatedFlow);
      
      alert('Flow saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving flow: ' + err.message);
    }
  }, [currentFlow, reactFlowNodes, reactFlowEdges, setFlows]);
  
  const handleExportFlow = useCallback(async () => {
    if (!currentFlow) return;
    
    try {
      const data = await flowApi.exportFlow(currentFlow.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentFlow.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error exporting flow: ' + err.message);
    }
  }, [currentFlow]);
  
  const handleImportFlow = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await flowApi.importFlow(data);
        
        const flowsData = await flowApi.fetchFlows();
        setFlows(flowsData.flows || []);
        
        alert('Flow imported successfully!');
      } catch (err) {
        alert('Error importing flow: ' + err.message);
      }
    };
    input.click();
  }, [setFlows]);
  
  const handleDeleteFlow = useCallback(async () => {
    if (!currentFlow) return;
    
    if (!confirm(`Delete flow "${currentFlow.name}"?`)) return;
    
    try {
      await flowApi.deleteFlow(currentFlow.id);
      
      const flowsData = await flowApi.fetchFlows();
      setFlows(flowsData.flows || []);
      
      useStore.getState().setCurrentFlow(null);
      alert('Flow deleted successfully!');
    } catch (err) {
      alert('Error deleting flow: ' + err.message);
    }
  }, [currentFlow, setFlows]);
  
  const handleToggleFlow = useCallback(async () => {
    if (!currentFlow) return;
    
    try {
      await flowApi.toggleFlow(currentFlow.id, !currentFlow.enabled);
      
      const flowsData = await flowApi.fetchFlows();
      setFlows(flowsData.flows || []);
      
      const updatedFlow = await flowApi.fetchFlow(currentFlow.id);
      useStore.getState().setCurrentFlow(updatedFlow);
      
      alert(`Flow ${currentFlow.enabled ? 'disabled' : 'enabled'} successfully!`);
    } catch (err) {
      alert('Error toggling flow: ' + err.message);
    }
  }, [currentFlow, setFlows]);
  
  const handleDebugExecute = useCallback(async () => {
    if (!currentFlow) return;
    
    try {
      const config = typeof currentFlow.config === 'string' 
        ? JSON.parse(currentFlow.config) 
        : currentFlow.config;
      
      const httpInNode = config.nodes?.find(n => n.type === 'http-in') ||
                         config.nodes?.find(n => n.type === 'inject') ||
                         config.nodes?.[0];
      
      if (!httpInNode) {
        alert('No entry node found in flow');
        return;
      }
      
      const payload = prompt('Enter payload (JSON):', '{"test": true}');
      let parsedPayload = {};
      
      if (payload) {
        try {
          parsedPayload = JSON.parse(payload);
        } catch {
          parsedPayload = { value: payload };
        }
      }
      
      const result = await flowApi.debugExecute(
        currentFlow.id, 
        httpInNode.id, 
        parsedPayload
      );
      
      useStore.getState().setDebugResults(result);
      useStore.getState().setActiveTab('debug');
      
      alert('Debug execution completed! Check the Debug tab.');
    } catch (err) {
      alert('Error executing debug: ' + err.message);
    }
  }, [currentFlow]);
  
  return {
    handleNewFlow,
    handleSaveFlow,
    handleExportFlow,
    handleImportFlow,
    handleDeleteFlow,
    handleToggleFlow,
    handleDebugExecute
  };
};
