import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
  reference_id?: string;
  user_id?: string;
  user_email?: string;
  user_full_name?: string;
}

export const AdminWalletTransactions = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      
      try {
        // Fetch transactions with wallet info
        const { data: transactionsData, error } = await supabase
          .from('wallet_transactions')
          .select(`
            *,
            wallet:wallet_id (
              user_id
            )
          `)
          .order('created_at', { ascending: false });
          
        if (error) throw error;

        // Process the results to get user information
        const enhancedTransactions = await Promise.all((transactionsData || []).map(async (transaction: any) => {
          let userInfo = { user_id: null, user_email: 'Unknown', user_full_name: 'Unknown User' };
          
          if (transaction.wallet && transaction.wallet.user_id) {
            // Fetch user profile for each transaction
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', transaction.wallet.user_id)
              .maybeSingle();
              
            if (profileData) {
              userInfo = {
                user_id: transaction.wallet.user_id,
                user_email: profileData.email,
                user_full_name: profileData.full_name
              };
            }
          }
          
          return {
            ...transaction,
            ...userInfo
          };
        }));
        
        setTransactions(enhancedTransactions as WalletTransaction[]);
      } catch (error) {
        console.error('Error fetching wallet transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);
  
  const filteredTransactions = transactions.filter(transaction => {
    // Text search
    const matchesSearch = 
      !searchQuery || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.user_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-blue-100 text-blue-800';
      case 'withdrawal':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-amber-100 text-amber-800';
      case 'refund':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Transactions</CardTitle>
        <CardDescription>
          View and manage all wallet transactions across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-lg">No transactions found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.user_full_name || 'Unknown User'}
                      {transaction.user_email && (
                        <div className="text-xs text-muted-foreground">
                          {transaction.user_email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={transaction.description}>
                      {transaction.description}
                      {transaction.reference_id && (
                        <div className="text-xs text-muted-foreground truncate">
                          Ref: {transaction.reference_id}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getTypeColor(transaction.type))}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(transaction.status))}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      transaction.type === 'deposit' || transaction.type === 'refund'
                        ? "text-green-600" 
                        : "text-amber-600"
                    )}>
                      {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
