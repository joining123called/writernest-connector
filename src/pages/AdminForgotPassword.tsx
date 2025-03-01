
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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
      <div className="auth-card">
        <h1 className="auth-card-title">Reset Admin Password</h1>
        
        {isSubmitted ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              If an admin account exists with the email you provided, we've sent password reset instructions.
            </p>
            
            <p className="text-sm">
              <Link to="/admin-login" className="auth-link font-medium">
                Return to admin login
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground text-center">
              Enter your admin email address below and we'll send you instructions to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="auth-label">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                type="submit" 
                className="auth-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>
            </form>
            
            <p className="mt-6 text-center text-sm">
              <Link to="/admin-login" className="auth-link">
                Back to admin login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminForgotPassword;
