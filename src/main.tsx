import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { trackEnhancedVisitor } from '@/utils/enhancedVisitorTracker';
import { visitorDataMaintenance } from '@/utils/visitorDataMaintenance';

createRoot(document.getElementById("root")!).render(<App />);

// Start background maintenance service
visitorDataMaintenance.start();

// Enhanced visitor tracking - only track if not on admin route
if (!window.location.pathname.startsWith('/admin')) {
  // Delay tracking slightly to ensure all resources are loaded
  setTimeout(() => {
    trackEnhancedVisitor();
  }, 1000);
}
