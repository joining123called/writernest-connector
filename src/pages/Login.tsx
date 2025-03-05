
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';
import { UserRole } from '@/types';
import { withCSRFProtection } from '@/components/security/CSRFProtection';
import { validateCSRFToken } from '@/contexts/auth/session-management/session-utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      if (user.role === UserRole.ADMIN) {
        navigate('/admin-dashboard');
      } else if (user.role === UserRole.WRITER) {
        navigate('/writer-dashboard');
      } else {
        navigate('/client-dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate CSRF token
    const form = e.target as HTMLFormElement;
    const csrfToken = form.elements.namedItem('csrf_token') as HTMLInputElement;
    
    if (!csrfToken || !validateCSRFToken(csrfToken.value)) {
      toast({
        title: "Security error",
        description: "Invalid form submission detected. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please provide both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      } else if (user && user.role === UserRole.ADMIN) {
        // If somehow an admin logs in through the client login form
        toast({
          title: "Access denied",
          description: "Please use the admin login page to sign in as an administrator.",
          variant: "destructive",
        });
        // Sign out the admin user immediately
        await signOut();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Error is already handled in the signIn function
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background/90 to-background">
      <div className="w-full max-w-md px-8 py-10 rounded-xl bg-card shadow-lg border border-border/30 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-5 shadow-md">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Sign in to your client or writer account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden CSRF token field will be added by the CSRFProtection component */}
          
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-lg border-input/30 bg-card shadow-sm"
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-lg border-input/30 bg-card shadow-sm"
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            variant="gradient"
            className="w-full h-12 mt-4 rounded-lg font-medium text-base shadow-md" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        
        <div className="mt-8 text-center space-y-5">
          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Create account
            </Link>
          </p>
          
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-px bg-border flex-grow"></div>
            <span className="text-xs text-muted-foreground px-2">or</span>
            <div className="h-px bg-border flex-grow"></div>
          </div>
          
          <p className="text-xs">
            <Link to="/admin-login" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default withCSRFProtection(Login);
