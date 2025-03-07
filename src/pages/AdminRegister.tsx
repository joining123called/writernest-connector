
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { FormData, UserRole } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isPossiblePhoneNumber } from 'react-phone-number-input';

const AdminRegister = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.ADMIN,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value || '' }));
    if (error) setError(null);
  };

  const validatePhone = (phone: string) => {
    return phone && isPossiblePhoneNumber(phone);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validatePassword(formData.password)) return;
    
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid phone number.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role,
        }
      );
      
      if (signUpError) {
        throw signUpError;
      }
      
      toast({
        title: "Admin account created",
        description: "Your admin account has been created. Please sign in.",
      });
      navigate('/admin-login');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/98 to-background/95 p-4">
      <AnimatePresence mode="wait">
        <motion.div 
          key="register-form"
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
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Create Admin Account</h1>
                <p className="text-sm text-muted-foreground/80 mt-2">Sign up for administrative access</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 text-destructive border-none">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <PhoneInput
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Phone Number"
                      required
                      disabled={isSubmitting}
                      className="h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter phone number with country code</p>
                  </div>
                  
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                      <Input
                        name="password"
                        type="password"
                        placeholder="Password (min. 8 characters)"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 h-11 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all duration-300"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 mt-6 font-medium bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-muted-foreground/80">
                  Already have an account?{" "}
                  <Link 
                    to="/admin-login" 
                    className="font-medium text-primary hover:text-primary/90 transition-colors"
                  >
                    Sign in
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

export default AdminRegister;
