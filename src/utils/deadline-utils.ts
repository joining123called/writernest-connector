
import { formatDistance, isPast, parseISO } from 'date-fns';

/**
 * Formats a deadline timestamp into a human-readable countdown
 */
export const formatDeadlineCountdown = (deadlineTimestamp: string): {
  timeRemaining: string;
  isPastDeadline: boolean;
} => {
  const deadline = parseISO(deadlineTimestamp);
  const isPastDeadline = isPast(deadline);
  
  const timeRemaining = formatDistance(
    deadline,
    new Date(),
    { addSuffix: true }
  );
  
  return {
    timeRemaining,
    isPastDeadline
  };
};

/**
 * Returns true if the deadline is within 24 hours
 */
export const isUrgent = (deadlineTimestamp: string): boolean => {
  const deadline = parseISO(deadlineTimestamp);
  const now = new Date();
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursRemaining > 0 && hoursRemaining <= 24;
};
