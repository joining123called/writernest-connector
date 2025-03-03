
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { FormData, UserRole } from '@/types';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.CLIENT,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, phone: value || '' }));
  };

  const handleRoleChange = (value: string) => {
    // Only allow CLIENT or WRITER roles (not ADMIN)
    if (value === UserRole.CLIENT || value === UserRole.WRITER) {
      setFormData((prev) => ({ 
        ...prev, 
        role: value as UserRole
      }));
    }
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      toast({
        title: "Password too weak",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.phone) {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        {
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role,
        }
      );
      
      if (error) {
        throw error;
      }
      
      // Registration successful, navigate to login
      toast({
        title: "Account created",
        description: "Your account has been created. Please sign in.",
      });
      navigate('/login');
      
    } catch (error: any) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card bg-background/95 backdrop-blur-lg">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-semibold">Create Your Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign up as a client or writer</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="h-11 pl-10 rounded-lg border-input/50 bg-background shadow-sm"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-11 pl-10 rounded-lg border-input/50 bg-background shadow-sm"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <div className="relative pl-10">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <PhoneInput
                international
                defaultCountry="US"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="h-11 rounded-lg border border-input/50 bg-background shadow-sm w-full"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                className="h-11 pl-10 rounded-lg border-input/50 bg-background shadow-sm"
                required
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">I am registering as</Label>
            <RadioGroup 
              value={formData.role} 
              onValueChange={handleRoleChange}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserRole.CLIENT} id="client" />
                <Label htmlFor="client" className="text-sm">Client</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserRole.WRITER} id="writer" />
                <Label htmlFor="writer" className="text-sm">Writer</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-11 mt-2 rounded-lg font-medium" 
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
        
        <div className="mt-6 text-center space-y-4">
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline transition-colors">
              Sign in
            </Link>
          </p>
          
          <p className="text-xs text-muted-foreground">
            <Link to="/admin-register" className="hover:text-primary transition-colors">
              Register as Admin
            </Link>
          </p>
          
          <div className="text-xs text-muted-foreground pt-2">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">Terms of Service</a>{" "}and{" "}
            <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
