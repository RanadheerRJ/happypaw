import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter/index.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@/styles/globals.css';
import App from '@/App';
import { assertEnv } from '@/config/env';

const problems = assertEnv();
if (problems.length > 0) {
  // Surface configuration mistakes early, without blocking the demo.
  console.error(`[happypaw] Configuration problem:\n- ${problems.join('\n- ')}`);
}

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
