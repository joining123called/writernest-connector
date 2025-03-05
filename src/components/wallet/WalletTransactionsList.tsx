import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
  reference_id?: string;
}

interface WalletTransactionsListProps {
  walletId?: string;
}

export const WalletTransactionsList = ({ walletId }: WalletTransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletId) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', walletId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setTransactions(data as Transaction[]);
      } catch (error) {
        console.error('Error fetching wallet transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [walletId]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-lg">No transactions yet</h3>
        <p className="text-muted-foreground text-sm mt-1">
          When you make deposits or payments, they will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-2">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              transaction.type === 'deposit' || transaction.type === 'refund' 
                ? "bg-green-100" 
                : "bg-amber-100"
            )}>
              {transaction.type === 'deposit' || transaction.type === 'refund' ? (
                <ArrowDownLeft className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {transaction.type === 'deposit' && 'Wallet Deposit'}
                {transaction.type === 'withdrawal' && 'Wallet Withdrawal'}
                {transaction.type === 'payment' && 'Payment for Order'}
                {transaction.type === 'refund' && 'Order Refund'}
              </p>
              <p className="text-sm text-muted-foreground">{transaction.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              "font-medium",
              transaction.type === 'deposit' || transaction.type === 'refund'
                ? "text-green-600" 
                : "text-amber-600"
            )}>
              {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </p>
            <div className="flex items-center gap-2 justify-end">
              <p className="text-xs text-muted-foreground">
                {format(new Date(transaction.created_at), 'MMM d, yyyy')}
              </p>
              <Badge 
                variant={
                  transaction.status === 'completed' ? 'default' : 
                  transaction.status === 'pending' ? 'outline' : 'destructive'
                }
                className="text-xs"
              >
                {transaction.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
