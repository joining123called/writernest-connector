
import React, { useEffect } from 'react';
import { generateCSRFToken } from '@/contexts/auth/session-management/session-utils';

interface CSRFProtectionProps {
  children: React.ReactNode;
  onInvalidToken?: () => void;
}

export const CSRFProtection: React.FC<CSRFProtectionProps> = ({ 
  children,
  onInvalidToken
}) => {
  // Generate a CSRF token when the component mounts
  useEffect(() => {
    generateCSRFToken();
  }, []);

  // Add CSRF token to all forms within this component
  const addCSRFTokenToForms = () => {
    const token = sessionStorage.getItem('csrf_token');
    
    if (!token) {
      console.error('CSRF token not found');
      if (onInvalidToken) onInvalidToken();
      return;
    }
    
    // Add the token to all forms as a hidden input
    document.querySelectorAll('form').forEach(form => {
      // Check if the form already has a CSRF token
      if (!form.querySelector('input[name="csrf_token"]')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        input.value = token;
        form.appendChild(input);
      }
    });
  };

  // Add the CSRF token to forms whenever children change
  useEffect(() => {
    // Use a timeout to ensure all forms are rendered
    const timeoutId = setTimeout(addCSRFTokenToForms, 0);
    return () => clearTimeout(timeoutId);
  }, [children]);

  return <>{children}</>;
};

// Higher-order component to wrap forms with CSRF protection
export const withCSRFProtection = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { onInvalidToken?: () => void }> => {
  return (props) => (
    <CSRFProtection onInvalidToken={props.onInvalidToken}>
      <Component {...props} />
    </CSRFProtection>
  );
};

export default CSRFProtection;
