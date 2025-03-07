
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const AdminWalletTransactions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View financial transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Wallet functionality has been removed from the system.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AdminWalletTransactions;
