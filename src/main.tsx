import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { trackUniqueVisitor } from '@/utils/visitorTracker';

createRoot(document.getElementById("root")!).render(<App />);

// Only track visitor if not on admin route
if (!window.location.pathname.startsWith('/admin')) {
  trackUniqueVisitor();
}
