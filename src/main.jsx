import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebApp } from '@twa-dev/sdk';
import App from './App.jsx';
import './index.css';

/**
 * Telegram Mini App init:
 * - WebApp bo'lganda: klaviaturani yashirish, ekran to'liq ochilishi (expand)
 *   va header rangini loyiha foniga moslash.
 * - Oddiy brauzer/PWA/Capacitor'da SDK o'zi hech narsa qilmaydi (xavfsiz).
 */
try {
  if (WebApp) {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor?.('#0d0d1a');
    WebApp.setBackgroundColor?.('#0d0d1a');
    WebApp.disableVerticalSwipes?.();
  }
} catch {
  // Telegram muhitida emas — jim o'tamiz
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
