import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext'
import { LibraryProvider } from './context/LibraryContext'
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';
import './index.css'
import App from './App.jsx'

// Set base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LibraryProvider>
            <App />
            <Toaster position="top-right" />
          </LibraryProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
