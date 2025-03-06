
import React, { useState, useEffect } from 'react';
import { formatDeadlineCountdown, isUrgent } from '@/utils/deadline-utils';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeadlineCountdownProps {
  deadline: string;
  className?: string;
}

export const DeadlineCountdown: React.FC<DeadlineCountdownProps> = ({ 
  deadline,
  className
}) => {
  const [countdown, setCountdown] = useState(() => formatDeadlineCountdown(deadline));
  
  useEffect(() => {
    // Update the countdown every minute
    const interval = setInterval(() => {
      setCountdown(formatDeadlineCountdown(deadline));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [deadline]);
  
  const urgent = isUrgent(deadline);
  
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {countdown.isPastDeadline ? (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Overdue {countdown.timeRemaining}</span>
        </Badge>
      ) : urgent ? (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          <span>{countdown.timeRemaining}</span>
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          <span>{countdown.timeRemaining}</span>
        </Badge>
      )}
    </div>
  );
};
