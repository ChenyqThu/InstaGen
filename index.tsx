import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { PhotosProvider } from '@/src/contexts/PhotosContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <PhotosProvider>
        <App />
      </PhotosProvider>
    </AuthProvider>
  </React.StrictMode>
);