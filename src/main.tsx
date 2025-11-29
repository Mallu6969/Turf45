import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Start background reconciliation when app loads
// This works on Vercel Hobby plan (client-side, not server-side cron)
if (typeof window !== 'undefined') {
  // Dynamically import to avoid issues
  import('./utils/backgroundReconciliation').then(({ startBackgroundReconciliation }) => {
    // Check if user is on an admin page
    const checkAndStart = () => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/booking-management') || 
          currentPath.includes('/dashboard') || 
          currentPath.includes('/admin') || 
          currentPath.includes('/staff')) {
        startBackgroundReconciliation();
      }
    };
    
    // Start immediately if on admin page
    checkAndStart();
    
    // Listen for route changes (for React Router)
    window.addEventListener('popstate', checkAndStart);
    
    // Check periodically (fallback for SPA navigation)
    setInterval(checkAndStart, 5000);
  });
}
