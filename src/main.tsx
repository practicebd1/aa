import React, { StrictMode, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime error in SkillStream app:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#fafaf9',
          color: '#1c1917',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            background: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e7e5e4'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: '#0c0a09' }}>
              SkillStream Platform
            </h1>
            <p style={{ fontSize: '14px', color: '#57534e', marginBottom: '20px' }}>
              Application loading issue encountered. Please refresh or return to homepage.
            </p>
            {this.state.error && (
              <div style={{
                textAlign: 'left',
                background: '#f5f5f4',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#dc2626',
                fontFamily: 'monospace',
                overflowX: 'auto',
                marginBottom: '20px'
              }}>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={() => {
                window.location.hash = '';
                window.location.reload();
              }}
              style={{
                backgroundColor: '#f59e0b',
                color: '#000000',
                border: 'none',
                fontWeight: '600',
                padding: '10px 24px',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reload Website
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

