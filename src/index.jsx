import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n'; // IMPORTANTE: Inicializa o i18next

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);