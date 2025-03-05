import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletTransactionsList } from './WalletTransactionsList';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  ArrowUpRight, 
  CreditCard, 
  RefreshCw, 
  ArrowDownLeft,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { WalletSettings } from '@/hooks/platform-settings/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PayPalButtons } from './PayPalButtons';

interface WalletData {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export const WalletDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletSettings, setWalletSettings] = useState<WalletSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDeposit, setLoadingDeposit] = useState(false);
  const [loadingWithdrawal, setLoadingWithdrawal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('deposit');

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) return;

      setIsLoading(true);
      
      try {
        // Check if wallet exists for user
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setWalletData(data as WalletData);
        } else {
          // Create wallet if it doesn't exist
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert([{ user_id: user.id, balance: 0 }])
            .select('*')
            .single();

          if (createError) throw createError;
          
          setWalletData(newWallet as WalletData);
          console.log('Created new wallet for user');
        }
        
        // Fetch wallet settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('platform_settings')
          .select('*')
          .eq('key', 'wallet_settings')
          .maybeSingle();
          
        if (settingsError) throw settingsError;
        
        if (settingsData && settingsData.value) {
          setWalletSettings(settingsData.value as unknown as WalletSettings);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load wallet information. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, [user, toast]);

  const handlePayPalSuccess = async (transactionId: string, amount: number) => {
    if (!walletData) return;
    
    try {
      toast({
        title: 'Deposit successful',
        description: `$${amount.toFixed(2)} has been added to your wallet.`,
      });
      
      // Refresh wallet data
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', walletData.id)
        .single();
        
      if (error) throw error;
      
      setWalletData(data as WalletData);
    } catch (error) {
      console.error('Error updating wallet after PayPal payment:', error);
    }
  };

  const handlePayPalError = (errorMessage: string) => {
    toast({
      title: 'Payment error',
      description: errorMessage,
      variant: 'destructive'
    });
  };

  const handleSimulatedDeposit = async () => {
    if (!walletData || depositAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid deposit amount.',
        variant: 'destructive'
      });
      return;
    }

    setLoadingDeposit(true);

    try {
      // In a real app, this would integrate with a payment processor
      // For demo purposes, we'll just update the balance directly
      
      // Update wallet balance
      const newBalance = Number(walletData.balance) + Number(depositAmount);
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', walletData.id);
        
      if (updateError) throw updateError;

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([{
          wallet_id: walletData.id,
          amount: depositAmount,
          type: 'deposit',
          status: 'completed',
          description: 'Wallet deposit (simulated)'
        }]);
        
      if (transactionError) throw transactionError;

      // Update local state
      setWalletData({
        ...walletData,
        balance: newBalance,
        updated_at: new Date().toISOString()
      });

      setDepositAmount(0);
      
      toast({
        title: 'Deposit successful',
        description: `$${depositAmount.toFixed(2)} has been added to your wallet.`,
      });
      
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast({
        title: 'Deposit failed',
        description: 'There was an error processing your deposit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoadingDeposit(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!walletData || !walletSettings) return;
    
    if (withdrawalAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive'
      });
      return;
    }
    
    if (withdrawalAmount > walletData.balance) {
      toast({
        title: 'Insufficient funds',
        description: 'Your withdrawal amount exceeds your available balance.',
        variant: 'destructive'
      });
      return;
    }
    
    setLoadingWithdrawal(true);
    
    try {
      // Calculate fee if enabled
      const feePercentage = walletSettings.withdrawal_fee_percentage || 0;
      const feeAmount = (withdrawalAmount * feePercentage) / 100;
      const withdrawalWithFee = withdrawalAmount - feeAmount;
      
      // In a real app, this would integrate with PayPal payout API
      // For demo purposes, we'll just update the balance directly
      
      // Update wallet balance
      const newBalance = Number(walletData.balance) - Number(withdrawalAmount);
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', walletData.id);
        
      if (updateError) throw updateError;

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([{
          wallet_id: walletData.id,
          amount: withdrawalAmount,
          type: 'withdrawal',
          status: 'completed',
          description: `Wallet withdrawal (Fee: $${feeAmount.toFixed(2)})`
        }]);
        
      if (transactionError) throw transactionError;

      // Update local state
      setWalletData({
        ...walletData,
        balance: newBalance,
        updated_at: new Date().toISOString()
      });
      
      setWithdrawalAmount(0);
      
      toast({
        title: 'Withdrawal successful',
        description: `$${withdrawalWithFee.toFixed(2)} has been withdrawn from your wallet. A fee of $${feeAmount.toFixed(2)} was applied.`,
      });
      
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: 'Withdrawal failed',
        description: 'There was an error processing your withdrawal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoadingWithdrawal(false);
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

  if (!walletSettings?.enable_wallet_system) {
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
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <h2 className="text-3xl font-bold">${walletData?.balance.toFixed(2)}</h2>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {walletData?.updated_at ? format(new Date(walletData.updated_at), 'MMM d, yyyy h:mm a') : 'Never'}
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
                    <Button onClick={handleSimulatedDeposit} disabled={loadingDeposit || depositAmount <= 0} className="w-32">
                      {loadingDeposit ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ArrowUpRight className="h-4 w-4 mr-2" />}
                      {loadingDeposit ? 'Processing...' : 'Deposit'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min: ${walletSettings?.min_deposit_amount || 5}, Max: ${walletSettings?.max_deposit_amount || 1000}
                  </p>
                </div>
                
                {walletSettings?.payment_methods.paypal.enabled && walletData && (
                  <div className="border rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Pay with PayPal</h3>
                    </div>
                    
                    {depositAmount >= (walletSettings?.min_deposit_amount || 5) && 
                     depositAmount <= (walletSettings?.max_deposit_amount || 1000) ? (
                      <PayPalButtons 
                        amount={depositAmount}
                        clientId={walletSettings.payment_methods.paypal.client_id || ''}
                        walletId={walletData.id}
                        onSuccess={handlePayPalSuccess}
                        onError={handlePayPalError}
                      />
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                          Please enter a valid amount between ${walletSettings?.min_deposit_amount || 5} and ${walletSettings?.max_deposit_amount || 1000} to enable PayPal payment.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
                
                <div className="bg-muted/50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Methods
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    For this demo, deposits are simulated instantly. In a real application, 
                    payment methods like credit cards would also be integrated here.
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
                          max={walletData?.balance || 0}
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          value={withdrawalAmount || ''}
                          onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button 
                        onClick={handleWithdrawal} 
                        disabled={loadingWithdrawal || withdrawalAmount <= 0 || withdrawalAmount > (walletData?.balance || 0)} 
                        className="w-32"
                      >
                        {loadingWithdrawal ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ArrowDownLeft className="h-4 w-4 mr-2" />}
                        {loadingWithdrawal ? 'Processing...' : 'Withdraw'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available balance: ${walletData?.balance.toFixed(2)}
                    </p>
                  </div>
                  
                  {walletSettings.withdrawal_fee_percentage > 0 && (
                    <Alert variant="default" className="bg-amber-50 mt-4">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        A {walletSettings.withdrawal_fee_percentage}% fee will be applied to your withdrawal. 
                        For a withdrawal of ${withdrawalAmount > 0 ? withdrawalAmount.toFixed(2) : '0.00'}, 
                        the fee would be ${withdrawalAmount > 0 ? ((withdrawalAmount * walletSettings.withdrawal_fee_percentage) / 100).toFixed(2) : '0.00'}.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="bg-muted/50 p-4 rounded-lg mt-6">
                    <h4 className="font-medium mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                      Withdrawal Methods
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      For this demo, withdrawals are simulated instantly. In a real application, 
                      withdrawals would be processed through PayPal or other payment gateways.
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
              <WalletTransactionsList walletId={walletData?.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
