
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  strength: number; // 0-5 scale
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  strength 
}) => {
  // Calculate progress percentage (0-100)
  const progress = (strength / 5) * 100;

  // Determine color based on strength
  const getStrengthColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Determine strength text
  const getStrengthText = () => {
    if (strength <= 1) return 'Weak';
    if (strength <= 3) return 'Moderate';
    return 'Strong';
  };

  return (
    <div className="space-y-1 mt-1">
      <div className="flex justify-between items-center text-xs">
        <span>Password Strength:</span>
        <span className={`font-medium ${
          strength <= 1 ? 'text-red-500' : 
          strength <= 3 ? 'text-yellow-500' : 
          'text-green-500'
        }`}>
          {getStrengthText()}
        </span>
      </div>
      <Progress value={progress} className={`h-1.5 ${getStrengthColor()}`} />
    </div>
  );
};
