
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSubmitted ? 
              "Check your email for recovery instructions" : 
              "We'll send you instructions to reset your password"}
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="text-center space-y-6">
            <div className="p-5 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm">
                If an account exists with the email you provided, we've sent password reset instructions.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-lg font-medium flex items-center justify-center"
              asChild
            >
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Login
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-lg"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                variant="gradient"
                className="w-full h-11 mt-4 rounded-lg font-medium" 
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
            
            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline font-medium">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
