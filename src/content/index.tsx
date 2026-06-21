import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContentApp } from './ContentApp';
import tailwindStyle from '../index.css?inline';

// Ensure we only inject once
if (!document.getElementById('leetlens-root')) {
  const rootElement = document.createElement('div');
  rootElement.id = 'leetlens-root';
  
  // Prevent the shadow host from blocking interactions globally
  rootElement.style.position = 'fixed';
  rootElement.style.top = '0';
  rootElement.style.right = '0';
  rootElement.style.zIndex = '2147483647'; // Max z-index
  rootElement.style.pointerEvents = 'none'; // Only allow events on children
  
  document.body.appendChild(rootElement);

  const shadowRoot = rootElement.attachShadow({ mode: 'open' });
  
  const styleElement = document.createElement('style');
  styleElement.textContent = tailwindStyle;
  shadowRoot.appendChild(styleElement);

  const appContainer = document.createElement('div');
  appContainer.id = 'leetlens-app-container';
  // Re-enable pointer events for the React app inside the shadow root
  appContainer.style.pointerEvents = 'auto';
  shadowRoot.appendChild(appContainer);

  createRoot(appContainer).render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>
  );
}
