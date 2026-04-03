import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios'; // <-- NEW: Import axios

// --- NEW: GLOBAL AXIOS INTERCEPTOR ---
// This acts as a middleman. It catches every outgoing request and attaches the JWT.
axios.interceptors.request.use(
  (config) => {
    // 1. Grab the secure token from localStorage
    const token = localStorage.getItem('token');
    
    // 2. If it exists, attach it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
      <App />
    </BrowserRouter>
 
);