
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowDownLeft, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPayPalPayout, checkPayoutStatus } from './PayPalUtils';

interface PayPalWithdrawalProps {
  walletId: string;
  balance: number;
  feePercentage: number;
  onWithdrawalComplete: () => void;
}

export const PayPalWithdrawal = ({ 
  walletId, 
  balance, 
  feePercentage,
  onWithdrawalComplete
}: PayPalWithdrawalProps) => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const { toast } = useToast();

  const feeAmount = (amount * feePercentage) / 100;
  const amountAfterFee = amount - feeAmount;

  const handleWithdrawal = async () => {
    if (!walletId || !email || amount <= 0 || amount > balance) return;
    
    setIsProcessing(true);
    
    try {
      const result = await createPayPalPayout(amount, walletId, email);
      
      if (!result.success) {
        throw new Error(result.error || 'Withdrawal failed');
      }
      
      toast({
        title: 'Withdrawal Initiated',
        description: `Your withdrawal of $${amountAfterFee.toFixed(2)} to ${email} has been initiated.`,
      });
      
      // Store the transaction ID for status checking
      if (result.transactionId) {
        setPendingTransactionId(result.transactionId);
      }
      
      // Clear form
      setAmount(0);
      
      // Notify parent component
      onWithdrawalComplete();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: 'Withdrawal Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCheckStatus = async () => {
    if (!pendingTransactionId) return;
    
    setIsChecking(true);
    
    try {
      const result = await checkPayoutStatus(pendingTransactionId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to check status');
      }
      
      toast({
        title: 'Withdrawal Status',
        description: `Status: ${result.status} (PayPal status: ${result.paypalStatus})`,
      });
      
      // If completed or failed, clear the pending transaction
      if (result.status === 'completed' || result.status === 'failed') {
        setPendingTransactionId(null);
        onWithdrawalComplete();
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast({
        title: 'Status Check Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="paypal-email">PayPal Email Address</Label>
        <Input
          id="paypal-email"
          type="email"
          placeholder="Enter your PayPal email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Funds will be sent to this PayPal account
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="withdraw-amount">Amount to Withdraw (USD)</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="withdraw-amount"
              type="number"
              min="1"
              max={balance}
              step="0.01"
              placeholder="0.00"
              className="pl-8"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
          <Button 
            onClick={handleWithdrawal} 
            disabled={isProcessing || !email || amount <= 0 || amount > balance} 
            className="w-32"
          >
            {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ArrowDownLeft className="h-4 w-4 mr-2" />}
            {isProcessing ? 'Processing...' : 'Withdraw'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Available balance: ${balance.toFixed(2)}
        </p>
      </div>
      
      {feePercentage > 0 && amount > 0 && (
        <Alert variant="info" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A {feePercentage}% fee will be applied to your withdrawal. 
            <br />
            You'll receive ${amountAfterFee.toFixed(2)} after a fee of ${feeAmount.toFixed(2)}.
          </AlertDescription>
        </Alert>
      )}
      
      {pendingTransactionId && (
        <div className="mt-6 border rounded-lg p-4 bg-amber-50">
          <h4 className="font-medium mb-2">Pending Withdrawal</h4>
          <p className="text-sm text-muted-foreground mb-3">
            You have a pending withdrawal being processed. PayPal payouts can take some time to complete.
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCheckStatus}
            disabled={isChecking}
          >
            {isChecking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Check Status
          </Button>
        </div>
      )}
    </div>
  );
};
