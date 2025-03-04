
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth"; 
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, Component, ErrorInfo, ReactNode } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import WriterDashboard from "./pages/WriterDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance with retry disabled to prevent infinite loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Error boundary component
class ErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error caught by boundary:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}

// Fallback component for errors
const ErrorFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
    <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
    <p className="text-muted-foreground mb-6">The application encountered an error. Please try refreshing the page.</p>
    <button 
      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      onClick={() => window.location.href = '/'}
    >
      Go to home page
    </button>
  </div>
);

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-forgot-password" element={<AdminForgotPassword />} />
        
        {/* Client Dashboard Routes */}
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/client-dashboard/:page" element={<ClientDashboard />} />
        <Route path="/client-dashboard/profile" element={<ProfilePage />} />
        <Route path="/client-dashboard/settings" element={<ProfilePage />} />
        
        {/* Writer Dashboard Routes */}
        <Route path="/writer-dashboard" element={<WriterDashboard />} />
        <Route path="/writer-dashboard/:page" element={<WriterDashboard />} />
        <Route path="/writer-dashboard/profile" element={<ProfilePage />} />
        <Route path="/writer-dashboard/settings" element={<ProfilePage />} />
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/:page" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/profile" element={<ProfilePage />} />
        <Route path="/admin-dashboard/settings" element={<ProfilePage />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <AnimatedRoutes />
            </AuthProvider>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
