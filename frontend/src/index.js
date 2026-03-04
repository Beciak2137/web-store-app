import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Importujemy router tutaj
import './index.css';
import App from './App';
import './i18n'; // Twoje tłumaczenia

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Owijamy ca?'?? aplikacj?? */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
