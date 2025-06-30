import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TooltipProvider } from '@/components/ui/tooltip';
import { PlacementMenuProvider } from '@/contexts/PlacementMenuContext';
import { ThemeProvider } from '@/components/ThemeSwitcher';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <TooltipProvider>
        <PlacementMenuProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </PlacementMenuProvider>
      </TooltipProvider>
    </React.StrictMode>
  );
}
