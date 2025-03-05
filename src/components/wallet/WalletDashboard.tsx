import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletTransactionsList } from './WalletTransactionsList';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, ArrowUpRight, CreditCard, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

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
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDeposit, setLoadingDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);

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

  const handleDeposit = async () => {
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
          description: 'Wallet deposit'
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
        variant: 'default'
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg mt-4"></div>
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

          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit Funds</TabsTrigger>
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
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={depositAmount || ''}
                        onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button onClick={handleDeposit} disabled={loadingDeposit || depositAmount <= 0} className="w-32">
                      {loadingDeposit ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ArrowUpRight className="h-4 w-4 mr-2" />}
                      {loadingDeposit ? 'Processing...' : 'Deposit'}
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
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
            
            <TabsContent value="history">
              <WalletTransactionsList walletId={walletData?.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
