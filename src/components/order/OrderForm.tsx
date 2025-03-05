
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Check, Clock } from 'lucide-react';
import { useOrderForm } from './useOrderForm';
import { PaperDetailsFields } from './PaperDetailsFields';
import { SizeAndDeadlineFields } from './SizeAndDeadlineFields';
import { CitationAndSourcesFields } from './CitationAndSourcesFields';
import { FileUploadSection } from './FileUploadSection';
import { OrderSummary } from './OrderSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { OrderFormProps } from './schema';
import { useOrderFormSettings } from '@/hooks/use-order-form-settings';
import { usePaymentMethods } from '@/hooks/use-payment-methods';
import { useToast } from '@/hooks/use-toast';

export function OrderForm({ onOrderSubmit }: OrderFormProps) {
  const { toast } = useToast();
  const { settings, isLoading: isLoadingSettings } = useOrderFormSettings();
  const { paymentMethods, isLoading: isLoadingPaymentMethods, error: paymentMethodsError } = usePaymentMethods();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  const {
    form,
    orderSummary,
    uploadedFiles,
    setUploadedFiles,
    isFormComplete,
    isLoading,
    handleFileUpload,
    handleSubmit
  } = useOrderForm(onOrderSubmit);
  
  // Show toast if there's an error fetching payment methods
  React.useEffect(() => {
    if (paymentMethodsError) {
      toast({
        title: "Payment Methods Error",
        description: "There was an error loading payment methods. You may proceed with the order, but payment options may be limited.",
        variant: "destructive",
      });
    }
  }, [paymentMethodsError, toast]);
  
  if (isLoading || isLoadingSettings || isLoadingPaymentMethods) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading order form...</span>
      </div>
    );
  }
  
  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleCompleteOrder = () => {
    // If payment methods exist but none selected, don't proceed
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to complete your order.",
        variant: "destructive",
      });
      return;
    }
    
    form.handleSubmit(() => {
      handleSubmit(selectedPaymentMethod);
    })();
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className={`flex flex-col ${settings.orderSummaryPosition === 'right' ? 'md:flex-row' : 'flex-col'} gap-6`}>
        <div className={`w-full ${settings.orderSummaryPosition === 'right' ? 'md:w-2/3' : 'w-full'}`}>
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <Check className="h-6 w-6 text-green-500 mr-2" />
                <CardTitle className="text-2xl">{settings.serviceName}</CardTitle>
              </div>
              <CardDescription>
                {settings.serviceDescription}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form className="space-y-6">
                  <PaperDetailsFields 
                    form={form} 
                    settings={settings}
                  />
                  
                  <SizeAndDeadlineFields 
                    form={form} 
                    settings={settings}
                  />
                  
                  <CitationAndSourcesFields 
                    form={form} 
                    settings={settings}
                  />
                  
                  <FileUploadSection 
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    onFileUpload={handleFileUpload}
                  />
                  
                  {paymentMethods.length > 0 && (
                    <PaymentMethodSelector
                      paymentMethods={paymentMethods}
                      selectedMethod={selectedPaymentMethod}
                      onSelectMethod={handlePaymentMethodSelect}
                    />
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className={`w-full ${settings.orderSummaryPosition === 'right' ? 'md:w-1/3' : 'w-full'}`}>
          <div className="sticky top-6">
            <OrderSummary 
              form={form}
              orderSummary={orderSummary}
              uploadedFiles={uploadedFiles}
              isFormComplete={isFormComplete && (paymentMethods.length === 0 || !!selectedPaymentMethod)}
              onSubmit={handleCompleteOrder}
              settings={settings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
