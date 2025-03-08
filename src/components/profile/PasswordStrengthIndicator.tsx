
import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const requirements = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains a number',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  const metCount = requirements.filter(req => req.met).length;
  const strength = metCount / requirements.length;

  let strengthClass = 'bg-red-500';
  let strengthLabel = 'Weak';

  if (strength === 1) {
    strengthClass = 'bg-green-500';
    strengthLabel = 'Strong';
  } else if (strength >= 0.6) {
    strengthClass = 'bg-yellow-500';
    strengthLabel = 'Medium';
  }

  return (
    <div className="space-y-2 mt-1 mb-3">
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${strengthClass} transition-all duration-300`} 
          style={{ width: `${strength * 100}%` }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground flex justify-between">
        <span>Password strength: {strengthLabel}</span>
        <span>{metCount}/{requirements.length} requirements met</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-xs">
            {req.met ? (
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 mr-1.5 text-red-500" />
            )}
            <span className={req.met ? 'text-muted-foreground' : 'text-muted-foreground/80'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
