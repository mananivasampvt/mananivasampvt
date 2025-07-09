import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingScreen from "@/components/LoadingScreen";
import BottomNavigation from "@/components/BottomNavigation";
import { useState, useEffect } from "react";

// Pages
import Index from "./pages/Index";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import Land from "./pages/Land";
import Commercial from "./pages/Commercial";
import PGHostels from "./pages/PGHostels";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Shortlist from "./pages/Shortlist";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Wait for all critical resources to load
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', resolve);
        }
      });

      // Ensure minimum display time for smooth UX (1.2 seconds for cleaner experience)
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Smooth fade out
      setTimeout(() => {
        setIsLoading(false);
      }, 50);
    };

    initializeApp();
  }, []);

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      
      <div className={`loading-fade ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/buy" element={<Buy />} />
                  <Route path="/rent" element={<Rent />} />
                  <Route path="/land" element={<Land />} />
                  <Route path="/commercial" element={<Commercial />} />
                  <Route path="/pg-hostels" element={<PGHostels />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/shortlist" element={<Shortlist />} />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BottomNavigation />
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </div>
    </>
  );
};

export default App;
