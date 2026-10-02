import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { registerSW } from 'virtual:pwa-register';

import './index.css';
import { Home } from './routes/Home';
import { PublicProposal } from './routes/PublicProposal';
import { Simulator } from './routes/Simulator';

// autoUpdate: when a new deploy is detected, the new service worker takes over and the page reloads,
// so nobody keeps running a stale cached version.
registerSW({ immediate: true });

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

// HashRouter: GitHub Pages has no SPA rewrites, so deep links (e.g. proposal links sent by WhatsApp) use #/...
createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simular" element={<Simulator />} />
        <Route path="/p/:token" element={<PublicProposal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
);
