// Guard for window.fetch to prevent TypeError when libraries try to polyfill it
// in an environment where it's a read-only property (like some sandboxed iframes).
if (typeof window !== 'undefined' && window.fetch) {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && descriptor.configurable === false) {
      console.warn('window.fetch is not configurable, skipping guard.');
    } else {
      const originalFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        get: () => originalFetch,
        set: (v) => { 
          console.warn('Prevented library from overwriting window.fetch. This is usually fine in sandboxed environments.');
        },
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {
    console.warn('Could not apply window.fetch guard.', e);
  }
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <App />
);
