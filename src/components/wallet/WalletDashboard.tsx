
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWallet } from '@/hooks/useWallet';
import { format } from 'date-fns';
import { 
  DollarSign, 
  ArrowUpRight, 
  CreditCard, 
  RefreshCw, 
  ArrowDownLeft,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { WalletTransactionsList } from './WalletTransactionsList';

export const WalletDashboard = () => {
  const { toast } = useToast();
  const { 
    wallet, 
    walletSettings,
    isLoading,
    deposit,
    withdraw 
  } = useWallet();
  
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit');

  // Check if wallet system is enabled in settings
  const isWalletSystemEnabled = walletSettings?.enable_wallet_system ?? false;

  const handleDeposit = async () => {
    if (!wallet || depositAmount <= 0) return;
    
    setIsProcessingDeposit(true);
    try {
      const result = await deposit(depositAmount, 'card');
      
      if (result) {
        toast({
          title: 'Deposit successful',
          description: `$${depositAmount.toFixed(2)} has been added to your wallet.`,
        });
        setDepositAmount(0);
      }
    } finally {
      setIsProcessingDeposit(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!wallet || !walletSettings) return;
    
    if (withdrawalAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive'
      });
      return;
    }
    
    if (withdrawalAmount > wallet.balance) {
      toast({
        title: 'Insufficient funds',
        description: 'Your withdrawal amount exceeds your available balance.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsProcessingWithdrawal(true);
    try {
      // Calculate fee if enabled
      const feePercentage = walletSettings.withdrawal_fee_percentage || 0;
      const feeAmount = (withdrawalAmount * feePercentage) / 100;
      const withdrawalWithFee = withdrawalAmount - feeAmount;
      
      const result = await withdraw(withdrawalAmount, 'bank_transfer');
      
      if (result) {
        toast({
          title: 'Withdrawal successful',
          description: `$${withdrawalWithFee.toFixed(2)} has been withdrawn from your wallet. A fee of $${feeAmount.toFixed(2)} was applied.`,
        });
        setWithdrawalAmount(0);
      }
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg mt-4"></div>
      </div>
    );
  }

  if (!isWalletSystemEnabled) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Wallet System Disabled</CardTitle>
            <CardDescription>
              The wallet system is currently disabled by the administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please contact the administrator for more information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">My Wallet</CardTitle>
          <CardDescription>
            Manage your funds and view transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <h2 className="text-3xl font-bold">${wallet?.balance.toFixed(2) || '0.00'}</h2>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {wallet?.updated_at ? format(new Date(wallet.updated_at), 'MMM d, yyyy h:mm a') : 'Never'}
            </p>
          </div>

          <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deposit">Deposit Funds</TabsTrigger>
              <TabsTrigger value="withdraw" disabled={!walletSettings?.allow_withdrawals}>Withdraw</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Deposit (USD)</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="amount"
                        type="number"
                        min={walletSettings?.min_deposit_amount || 5}
                        max={walletSettings?.max_deposit_amount || 1000}
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={depositAmount || ''}
                        onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button onClick={handleDeposit} disabled={isProcessingDeposit || depositAmount <= 0} className="w-32">
                      {isProcessingDeposit ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ArrowUpRight className="h-4 w-4 mr-2" />}
                      {isProcessingDeposit ? 'Processing...' : 'Deposit'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min: ${walletSettings?.min_deposit_amount || 5}, Max: ${walletSettings?.max_deposit_amount || 1000}
                  </p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Methods
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    For this demo, deposits are simulated instantly. In a real application, 
                    payment methods like credit cards and PayPal would be integrated here.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="withdraw" className="space-y-4 py-4">
              {walletSettings?.allow_withdrawals ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount to Withdraw (USD)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          min="1"
                          max={wallet?.balance || 0}
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          value={withdrawalAmount || ''}
                          onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button 
                        onClick={handleWithdrawal} 
                        disabled={isProcessingWithdrawal || withdrawalAmount <= 0 || withdrawalAmount > (wallet?.balance || 0)} 
                        className="w-32"
                      >
                        {isProcessingWithdrawal ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ArrowDownLeft className="h-4 w-4 mr-2" />}
                        {isProcessingWithdrawal ? 'Processing...' : 'Withdraw'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available balance: ${wallet?.balance.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  
                  {walletSettings?.withdrawal_fee_percentage > 0 && (
                    <Alert variant="warning" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        A {walletSettings.withdrawal_fee_percentage}% fee will be applied to your withdrawal. 
                        For a withdrawal of ${withdrawalAmount > 0 ? withdrawalAmount.toFixed(2) : '0.00'}, 
                        the fee would be ${withdrawalAmount > 0 ? ((withdrawalAmount * walletSettings.withdrawal_fee_percentage) / 100).toFixed(2) : '0.00'}.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="bg-muted/50 p-4 rounded-lg mt-6">
                    <h4 className="font-medium mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Withdrawal Methods
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      For this demo, withdrawals are simulated instantly. In a real application, 
                      withdrawals would be processed through bank transfers or other payment gateways.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-lg">Withdrawals Disabled</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Withdrawals are currently disabled by the administrator.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              <WalletTransactionsList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
