
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AlertTriangle } from 'lucide-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Simple Error Boundary to catch runtime crashes (like process is not defined)
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          width: '100vw', 
          backgroundColor: '#000', 
          color: '#fff', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ef4444', marginBottom: '20px' }}>
             <AlertTriangle size={48} />
          </div>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Application Crashed</h1>
          <p style={{ color: '#9ca3af', maxWidth: '500px', marginBottom: '20px' }}>
            Something went wrong during initialization. This is likely due to an environment configuration issue.
          </p>
          <pre style={{ 
            backgroundColor: '#111', 
            padding: '15px', 
            borderRadius: '8px', 
            color: '#f87171', 
            overflowX: 'auto',
            maxWidth: '100%',
            fontSize: '12px',
            textAlign: 'left'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '30px',
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
       <App />
    </ErrorBoundary>
  </React.StrictMode>
);
