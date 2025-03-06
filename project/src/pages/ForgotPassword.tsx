import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        throw resetError;
      }
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/98 to-background/95 p-4">
      <AnimatePresence mode="wait">
        <motion.div 
          key="forgot-password-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden dark:bg-black/20">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <div className="relative">
              <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Reset Password</h1>
                <p className="text-sm text-muted-foreground/80 mt-2">
                  {isSubmitted ? 
                    "Check your email for recovery instructions" : 
                    "We'll send you instructions to reset your password"}
                </p>
              </div>
              
              {isSubmitted ? (
                <div className="text-center space-y-6">
                  <div className="p-5 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-sm text-foreground/80">
                      If an account exists with the email you provided, we've sent password reset instructions.
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-xl font-medium flex items-center justify-center border-white/10 hover:bg-white/5"
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive" className="bg-destructive/10 text-destructive border-none">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

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
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 mt-2 font-medium bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
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
                    <Link 
                      to="/login" 
                      className="inline-flex items-center text-sm text-primary hover:text-primary/90 font-medium transition-colors"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;