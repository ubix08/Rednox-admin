// ============================================================
// src/components/panels/DebugPanel.jsx
// ============================================================
import React from 'react';

export const DebugPanel = ({ results }) => {
  if (!results) {
    return (
      <div style={{ color: '#999', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
        No debug results yet. Click Debug to execute the flow.
      </div>
    );
  }
  
  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>
        Debug Results
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Status */}
        <div style={{
          padding: '12px',
          background: results.success ? '#e8f5e9' : '#ffebee',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <strong>{results.success ? '✓ Success' : '✗ Failed'}</strong>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>
            Duration: {results.duration}ms
          </div>
        </div>
        
        {/* Metadata */}
        {results.metadata && (
          <div style={{
            padding: '12px',
            background: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div><strong>Total Nodes:</strong> {results.metadata.totalNodes}</div>
            <div><strong>Executed:</strong> {results.metadata.executedNodes}</div>
            <div><strong>Skipped:</strong> {results.metadata.skippedNodes}</div>
            <div><strong>Errors:</strong> {results.metadata.errorNodes}</div>
          </div>
        )}
        
        {/* Errors */}
        {results.errors && results.errors.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#f44336' }}>
              Errors
            </h4>
            {results.errors.map((err, i) => (
              <div key={i} style={{
                padding: '8px',
                background: '#ffebee',
                borderLeft: '3px solid #f44336',
                marginBottom: '8px',
                fontSize: '12px'
              }}>
                <div><strong>Node:</strong> {err.nodeId}</div>
                <div><strong>Message:</strong> {err.message}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Execution Trace */}
        {results.trace && results.trace.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Execution Trace ({results.trace.length} steps)
            </h4>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {results.trace.map((trace, i) => (
                <div key={i} style={{
                  padding: '8px',
                  background: trace.status === 'error' ? '#ffebee' : '#f5f5f5',
                  borderLeft: `3px solid ${trace.status === 'error' ? '#f44336' : '#4caf50'}`,
                  marginBottom: '8px',
                  fontSize: '11px'
                }}>
                  <div style={{ fontWeight: 600 }}>
                    {trace.nodeName || trace.nodeType} ({trace.duration}ms)
                  </div>
                  <div style={{ color: '#666', marginTop: '4px' }}>
                    {trace.nodeId}
                  </div>
                  {trace.error && (
                    <div style={{ color: '#f44336', marginTop: '4px' }}>
                      {trace.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Final Output */}
        {results.finalOutput && (
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Final Output
            </h4>
            <pre style={{
              padding: '8px',
              background: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '11px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(results.finalOutput, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};