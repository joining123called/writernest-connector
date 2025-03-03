
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, Shield } from 'lucide-react';
import { UserRole } from '@/types';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      } else if (user && user.role !== UserRole.ADMIN) {
        // If a non-admin logs in through the admin login form
        toast({
          title: "Access denied",
          description: "This login is only for administrators. Please use the regular login page.",
          variant: "destructive",
        });
        // Sign out the non-admin user immediately
        await signOut();
      }
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card bg-background/95 backdrop-blur-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="rounded-full bg-primary/10 p-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1">Access the admin dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 pl-10 rounded-lg border-input/50 bg-background shadow-sm"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Link to="/admin-forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pl-10 rounded-lg border-input/50 bg-background shadow-sm"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-11 mt-2 rounded-lg font-medium" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In as Admin'
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center space-y-4">
          <p className="text-sm">
            Need an admin account?{" "}
            <Link to="/admin-register" className="font-medium text-primary hover:underline transition-colors">
              Register as Admin
            </Link>
          </p>
          
          <p className="text-xs text-muted-foreground">
            <Link to="/login" className="hover:text-primary transition-colors">
              Client/Writer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
