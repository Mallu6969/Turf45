// Background reconciliation utility
// Runs automatically when app is open to reconcile pending payments
// Works on Vercel Hobby plan (client-side, not server-side cron)

let reconciliationInterval: NodeJS.Timeout | null = null;
let isRunning = false;

export function startBackgroundReconciliation() {
  // Don't start if already running
  if (reconciliationInterval) {
    return;
  }

  console.log("🔄 Starting background reconciliation...");
  
  reconciliationInterval = setInterval(async () => {
    // Prevent concurrent runs
    if (isRunning) {
      return;
    }

    try {
      isRunning = true;
      
      // Call the reconciliation endpoint to process all pending payments
      const response = await fetch('/api/razorpay/reconcile-pending-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      
      if (response.ok && data.processed > 0) {
        console.log(`✅ Background reconciliation: ${data.successful} successful, ${data.failed} failed`);
      }
    } catch (err) {
      console.error('❌ Background reconciliation error:', err);
    } finally {
      isRunning = false;
    }
  }, 60000); // Run every 60 seconds (1 minute)
}

export function stopBackgroundReconciliation() {
  if (reconciliationInterval) {
    clearInterval(reconciliationInterval);
    reconciliationInterval = null;
    console.log("⏹️ Stopped background reconciliation");
  }
}

// Auto-start when module loads (if in browser)
if (typeof window !== 'undefined') {
  // Start background reconciliation when app loads
  // Only if user is likely an admin (on booking management or dashboard)
  const startIfAdmin = () => {
    const path = window.location.pathname;
    if (path.includes('/booking-management') || path.includes('/dashboard') || path.includes('/admin')) {
      startBackgroundReconciliation();
    }
  };

  // Start immediately if already on admin page
  startIfAdmin();

  // Also start on navigation (for SPA)
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(startIfAdmin, 100);
  };

  // Cleanup on page unload
  window.addEventListener('beforeunload', stopBackgroundReconciliation);
}

