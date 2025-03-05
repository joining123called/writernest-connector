
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Wallet, WalletTransaction, WalletSettings } from '@/types/wallet';
import { useAuth } from '@/contexts/auth';

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletSettings, setWalletSettings] = useState<WalletSettings | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch wallet data
  const fetchWallet = useCallback(async () => {
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
        setWallet(data as Wallet);
      } else {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert([{ user_id: user.id, balance: 0 }])
          .select('*')
          .single();

        if (createError) throw createError;
        
        setWallet(newWallet as Wallet);
      }
      
      // Fetch wallet settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'wallet_settings')
        .maybeSingle();
        
      if (settingsError) {
        console.error('Error fetching wallet settings:', settingsError);
      } else if (settingsData && settingsData.value) {
        setWalletSettings(settingsData.value as WalletSettings);
      }
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wallet information. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Fetch wallet transactions
  const fetchTransactions = useCallback(async () => {
    if (!wallet) return;

    setIsLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTransactions(data as WalletTransaction[]);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction history.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [wallet, toast]);

  // Make a deposit
  const deposit = useCallback(async (amount: number, paymentMethod: string) => {
    if (!wallet || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid deposit amount.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // Call process-payment edge function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { amount, paymentMethod, walletId: wallet.id }
      });

      if (error) throw error;
      
      // Refresh wallet data
      fetchWallet();
      fetchTransactions();
      
      return data;
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      toast({
        title: 'Deposit failed',
        description: 'There was an error processing your deposit. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  }, [wallet, toast, fetchWallet, fetchTransactions]);

  // Make a withdrawal
  const withdraw = useCallback(async (amount: number, withdrawalMethod: string) => {
    if (!wallet || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive'
      });
      return null;
    }

    if (wallet.balance < amount) {
      toast({
        title: 'Insufficient funds',
        description: 'Your withdrawal amount exceeds your available balance.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // In a real app, this would call a withdrawal API endpoint
      // For now, we'll simulate it with database operations
      
      // Update wallet balance
      const newBalance = Number(wallet.balance) - Number(amount);
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);
        
      if (updateError) throw updateError;

      // Record the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert([{
          wallet_id: wallet.id,
          amount: amount,
          type: 'withdrawal',
          status: 'completed',
          description: `Withdrawal via ${withdrawalMethod}`,
          payment_method: withdrawalMethod
        }])
        .select()
        .single();
        
      if (transactionError) throw transactionError;

      // Refresh wallet data
      fetchWallet();
      fetchTransactions();
      
      return transaction;
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: 'Withdrawal failed',
        description: 'There was an error processing your withdrawal. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  }, [wallet, toast, fetchWallet, fetchTransactions]);

  // Load wallet on component mount
  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user, fetchWallet]);

  // Load transactions when wallet is available
  useEffect(() => {
    if (wallet) {
      fetchTransactions();
    }
  }, [wallet, fetchTransactions]);

  return {
    wallet,
    walletSettings,
    transactions,
    isLoading,
    isLoadingTransactions,
    fetchWallet,
    fetchTransactions,
    deposit,
    withdraw
  };
}
