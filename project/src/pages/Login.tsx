import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';
import { UserRole } from '@/types';
import { withCSRFProtection } from '@/components/security/CSRFProtection';
import { validateCSRFToken } from '@/contexts/auth/session-management/session-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load remembered credentials if exists
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedState = localStorage.getItem('rememberMe');
    if (rememberedEmail && rememberedState === 'true') {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      const redirectPath = 
        user.role === UserRole.ADMIN ? '/admin-dashboard' :
        user.role === UserRole.WRITER ? '/writer-dashboard' :
        '/client-dashboard';
      
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate CSRF token
    const form = e.target as HTMLFormElement;
    const csrfToken = form.elements.namedItem('csrf_token') as HTMLInputElement;
    
    if (!csrfToken || !validateCSRFToken(csrfToken.value)) {
      setError('Invalid form submission. Please try again.');
      return;
    }
    
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/98 to-background/95 p-4">
      <AnimatePresence mode="wait">
        <motion.div 
          key="login-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden dark:bg-black/20">
            {/* Subtle background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <div className="relative">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Welcome Back</h1>
                <p className="text-sm text-muted-foreground/80 mt-2">Sign in to continue to your account</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 text-destructive border-none">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
                        required
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Password</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
                        required
                        disabled={isSubmitting}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor="remember" 
                      className="text-sm text-muted-foreground/90 cursor-pointer select-none"
                    >
                      Remember Me
                    </Label>
                  </div>
                  
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/90 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 mt-2 font-medium bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-center"
              >
                <p className="text-sm text-muted-foreground/80">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="font-medium text-primary hover:text-primary/90 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default withCSRFProtection(Login);