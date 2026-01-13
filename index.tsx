import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { PhotosProvider } from '@/src/contexts/PhotosContext';

// Check for required environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const errorMsg = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      font-family: system-ui, sans-serif; 
      text-align: center; 
      padding: 20px;
    ">
      <h1 style="color: #ef4444; margin-bottom: 20px;">Configuration Error</h1>
      <p style="color: #374151; max-width: 500px; line-height: 1.5;">
        Missing Supabase environment variables. <br/>
        Please check your <code>.env</code> or <code>.env.local</code> file.
      </p>
      <div style="
        background: #f3f4f6; 
        padding: 15px; 
        border-radius: 8px; 
        margin-top: 20px; 
        text-align: left; 
        font-family: monospace; 
        font-size: 14px;
      ">
        VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}<br/>
        VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}
      </div>
    </div>
  `;
  document.body.innerHTML = errorMsg;
  throw new Error('Missing Supabase Environment Variables');
}

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