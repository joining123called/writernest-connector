
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth"; 
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import WriterDashboard from "./pages/WriterDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import ClientOrderPage from "./pages/ClientOrderPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetching when window regains focus
      retry: 1, // Limit retries on failure
    },
  },
});

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-forgot-password" element={<AdminForgotPassword />} />
        
        {/* Profile Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        
        {/* Client Dashboard Routes */}
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/client-dashboard/:page" element={<ClientDashboard />} />
        <Route path="/client-dashboard/order" element={<ClientOrderPage />} />
        
        {/* Writer Dashboard Routes */}
        <Route path="/writer-dashboard" element={<WriterDashboard />} />
        <Route path="/writer-dashboard/:page" element={<WriterDashboard />} />
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/:page" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/settings" element={<AdminSettings />} />
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
