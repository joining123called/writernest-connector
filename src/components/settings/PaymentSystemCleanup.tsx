
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { cleanPaymentSystem } from '@/utils/cleanPaymentSystem';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePlatformSettings } from '@/hooks/use-platform-settings';

export const PaymentSystemCleanup = () => {
  const { toast } = useToast();
  const { isAdmin } = usePlatformSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCleanup = async () => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const cleanupResult = await cleanPaymentSystem();
      setResult(cleanupResult);
      
      if (cleanupResult.success) {
        toast({
          title: "Payment system cleanup successful",
          description: "All payment configurations have been removed from the database",
        });
        // Close dialog after success
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        toast({
          title: "Payment system cleanup failed",
          description: cleanupResult.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      });
      
      toast({
        title: "Error",
        description: "Failed to clean payment system. See console for details.",
        variant: "destructive",
      });
      
      console.error("Payment cleanup error:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!isAdmin) {
    return null;
  }

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Remove Payment System
        </CardTitle>
        <CardDescription>
          Permanently remove all payment-related configurations and settings from the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning: Irreversible Action</AlertTitle>
          <AlertDescription>
            This action will permanently remove all payment gateway configurations. 
            You will need to reconfigure payment methods if you want to use them again in the future.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Payment System
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400">Confirm Payment System Removal</DialogTitle>
              <DialogDescription>
                This action cannot be undone. All payment gateway configurations and settings will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Warning</AlertTitle>
                <AlertDescription>
                  This will disable all payment methods and remove all API keys and credentials from the database.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <p className="text-sm">To confirm, type "REMOVE PAYMENT SYSTEM" below:</p>
                <input
                  className="w-full p-2 border rounded"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="REMOVE PAYMENT SYSTEM"
                />
              </div>
              
              {result && (
                <Alert variant={result.success ? "default" : "destructive"} className={result.success ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : ""}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)} 
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCleanup} 
                disabled={confirmText !== "REMOVE PAYMENT SYSTEM" || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Payment System
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
