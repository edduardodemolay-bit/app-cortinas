import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';

import './index.css';
import { Home } from './routes/Home';
import { PublicProposal } from './routes/PublicProposal';
import { Simulator } from './routes/Simulator';

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
      </Routes>
    </HashRouter>
  </StrictMode>,
);
