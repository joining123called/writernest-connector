
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, Shield } from 'lucide-react';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await resetPassword(email);
      if (!error) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
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
          <h1 className="text-2xl font-semibold">Reset Admin Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSubmitted ? 
              "Check your email for recovery instructions" : 
              "We'll send you instructions to reset your admin password"}
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm">
                If an admin account exists with the email you provided, we've sent password reset instructions.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-lg font-medium flex items-center justify-center"
              asChild
            >
              <Link to="/admin-login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Admin Login
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Admin Email</Label>
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
              
              <Button 
                type="submit" 
                className="w-full h-11 mt-2 rounded-lg font-medium" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Instructions...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/admin-login" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to admin login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminForgotPassword;
