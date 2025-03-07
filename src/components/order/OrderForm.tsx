
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Check, Clock } from 'lucide-react';
import { useOrderForm } from './useOrderForm';
import { PaperDetailsFields } from './PaperDetailsFields';
import { SizeAndDeadlineFields } from './SizeAndDeadlineFields';
import { CitationAndSourcesFields } from './CitationAndSourcesFields';
import { FileUploadSection } from './FileUploadSection';
import { OrderSummary } from './OrderSummary';
import { OrderFormProps } from './schema';
import { useOrderFormSettings } from '@/hooks/use-order-form-settings';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';

export function OrderForm({ onOrderSubmit }: OrderFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { settings, isLoading: isLoadingSettings } = useOrderFormSettings();
  
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
  
  // Check if user is logged in
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit an order",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate, toast]);
  
  if (isLoading || isLoadingSettings || isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading order form...</span>
      </div>
    );
  }
  
  const handleCompleteOrder = () => {
    form.handleSubmit(() => {
      handleSubmit();
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
              isFormComplete={isFormComplete}
              isSubmitting={isLoading}
              onSubmit={handleCompleteOrder}
              settings={settings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
