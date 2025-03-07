
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WriterOrdersTable from "./WriterOrdersTable";
import { OrderItem } from '@/types';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react'; // Using lucide-react instead of radix icons
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const WriterOrdersList = () => {
  const [activeTab, setActiveTab] = useState("active");

  // Fetch writer orders - Fixed type instantiation issue by using explicit type casting
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['writer-orders'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('assignment_details')
        .select('*')
        .eq('writer_id', userId);
      
      if (error) throw error;
      return data as OrderItem[];
    }
  });

  // Filter orders based on active tab
  const activeOrders = orders?.filter(order => 
    ['assigned', 'in_progress', 'under_review'].includes(order.status)
  ) || [];
  
  const completedOrders = orders?.filter(order => 
    order.status === 'completed'
  ) || [];

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Assignments</CardTitle>
            <CardDescription>View and manage your writing assignments</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            <WriterOrdersTable orders={activeOrders} />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <WriterOrdersTable orders={completedOrders} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WriterOrdersList;
