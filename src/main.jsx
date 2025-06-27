import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Inicializa o dark mode como padrão
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || 'dark'; // Dark mode por padrão
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Executa antes da renderização
initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
