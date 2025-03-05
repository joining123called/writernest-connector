import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Check, Clock, FileText, Upload, CreditCard, DollarSign } from 'lucide-react';

const orderFormSchema = z.object({
  paperType: z.string({
    required_error: "Please select a paper type",
  }),
  subject: z.string({
    required_error: "Please select a subject",
  }),
  pages: z.string({
    required_error: "Please select number of pages",
  }),
  deadline: z.string({
    required_error: "Please select a deadline",
  }),
  topic: z.string().optional(),
  instructions: z.string().optional(),
  citationStyle: z.string().optional(),
  sources: z.string().optional(),
  termsAgreed: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

const paperTypes = [
  { value: "essay", label: "Essay" },
  { value: "research", label: "Research Paper" },
  { value: "case-study", label: "Case Study" },
  { value: "dissertation", label: "Dissertation" },
  { value: "article", label: "Article/Review" },
  { value: "assignment", label: "Assignment" },
  { value: "presentation", label: "Presentation" },
  { value: "editing", label: "Editing/Proofreading" },
];

const subjects = [
  { value: "business", label: "Business" },
  { value: "psychology", label: "Psychology" },
  { value: "nursing", label: "Nursing & Healthcare" },
  { value: "sociology", label: "Sociology" },
  { value: "economics", label: "Economics" },
  { value: "history", label: "History" },
  { value: "literature", label: "Literature" },
  { value: "science", label: "Science" },
  { value: "engineering", label: "Engineering" },
  { value: "other", label: "Other" },
];

const deadlines = [
  { value: "6h", label: "6 hours", multiplier: 2.0, isUrgent: true },
  { value: "12h", label: "12 hours", multiplier: 1.8, isUrgent: true },
  { value: "24h", label: "24 hours", multiplier: 1.6, isUrgent: true },
  { value: "48h", label: "2 days", multiplier: 1.4, isUrgent: false },
  { value: "72h", label: "3 days", multiplier: 1.2, isUrgent: false },
  { value: "7d", label: "7 days", multiplier: 1.0, isUrgent: false },
  { value: "14d", label: "14 days", multiplier: 0.9, isUrgent: false },
];

const citationStyles = [
  { value: "apa", label: "APA" },
  { value: "mla", label: "MLA" },
  { value: "chicago", label: "Chicago/Turabian" },
  { value: "harvard", label: "Harvard" },
  { value: "other", label: "Other" },
  { value: "none", label: "Not required" },
];

type OrderFormProps = {
  onOrderSubmit?: (data: z.infer<typeof orderFormSchema>) => void;
};

export function OrderForm({ onOrderSubmit }: OrderFormProps) {
  const { toast } = useToast();
  const [orderSummary, setOrderSummary] = useState({
    basePrice: 15.99,
    pages: 1,
    words: 275,
    deadline: '7d',
    deadlineText: '7 days',
    pricePerPage: 15.99,
    totalPrice: 15.99,
    discount: 0,
    finalPrice: 15.99,
  });
  
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      paperType: "",
      subject: "",
      pages: "1",
      deadline: "7d",
      topic: "",
      instructions: "",
      citationStyle: "apa",
      sources: "0",
      termsAgreed: false,
    },
  });
  
  const watchPages = form.watch('pages');
  const watchDeadline = form.watch('deadline');
  
  React.useEffect(() => {
    const pages = parseInt(watchPages || "1");
    const deadlineOption = deadlines.find(d => d.value === watchDeadline) || deadlines[5];
    
    const basePrice = 15.99;
    const pricePerPage = basePrice * deadlineOption.multiplier;
    const totalPrice = pricePerPage * pages;
    
    let discount = 0;
    if (pages >= 3) {
      discount = totalPrice * 0.15;
    }
    
    const finalPrice = totalPrice - discount;
    
    setOrderSummary({
      basePrice,
      pages,
      words: pages * 275,
      deadline: deadlineOption.value,
      deadlineText: deadlineOption.label,
      pricePerPage,
      totalPrice,
      discount,
      finalPrice
    });
  }, [watchPages, watchDeadline]);
  
  const onSubmit = (data: z.infer<typeof orderFormSchema>) => {
    console.log("Order submitted:", data, orderSummary);
    
    toast({
      title: "Order submitted successfully",
      description: "Your order has been received and is being processed.",
    });
    
    if (onOrderSubmit) {
      onOrderSubmit(data);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center mb-2">
                <Check className="h-6 w-6 text-green-500 mr-2" />
                <CardTitle className="text-2xl">Fill Your Order Details</CardTitle>
              </div>
              <CardDescription>
                Provide information about your assignment to get an accurate quote.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paperType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paper Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select paper type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paperTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Area</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.value} value={subject.value}>
                                  {subject.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Pages</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of pages" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...Array(20)].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1} page{i > 0 ? 's' : ''} / {(i + 1) * 275} words
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select deadline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deadlines.map((deadline) => (
                                <SelectItem 
                                  key={deadline.value} 
                                  value={deadline.value}
                                  className={deadline.isUrgent ? "text-orange-600 font-medium" : ""}
                                >
                                  {deadline.label}
                                  {deadline.isUrgent && " (Urgent)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic / Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your paper topic or title" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter a specific topic or leave blank if you want the writer to choose
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paper Instructions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter detailed instructions for your paper..." 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include any specific requirements, grading rubric, or sample material
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="citationStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Citation Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select citation style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {citationStyles.map((style) => (
                                <SelectItem key={style.value} value={style.value}>
                                  {style.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sources"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Sources</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of sources" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...Array(21)].map((_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                  {i === 0 ? "No sources required" : `${i} source${i > 1 ? 's' : ''}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <Button type="button" variant="outline" className="flex gap-2 mb-4">
                      <Upload size={16} />
                      Upload Additional Files
                    </Button>
                    
                    <FormField
                      control={form.control}
                      name="termsAgreed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the Terms of Service, Privacy Policy, and Money-Back Guarantee
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    Complete Your Order
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">With Each Order, You Get:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>100% plagiarism-free content</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Well-researched papers with quality sources</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Free revisions within 14 days</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Secure Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">Visa</div>
                  <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">Mastercard</div>
                  <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">PayPal</div>
                  <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">Apple Pay</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="sticky top-6">
            <Card className="bg-gray-50 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paper type:</span>
                    <span className="font-medium">{form.watch('paperType') ? 
                      paperTypes.find(t => t.value === form.watch('paperType'))?.label : 
                      "Not selected"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{form.watch('subject') ? 
                      subjects.find(s => s.value === form.watch('subject'))?.label : 
                      "Not selected"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{orderSummary.pages} page{orderSummary.pages > 1 ? 's' : ''} / {orderSummary.words} words</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">{orderSummary.deadlineText}</span>
                  </div>
                  
                  {form.watch('citationStyle') && form.watch('citationStyle') !== "none" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Citation style:</span>
                      <span className="font-medium">
                        {citationStyles.find(s => s.value === form.watch('citationStyle'))?.label}
                      </span>
                    </div>
                  )}
                  
                  {form.watch('sources') && form.watch('sources') !== "0" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sources:</span>
                      <span className="font-medium">{form.watch('sources')}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="text-lg font-medium mb-2">Price Breakdown</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base price:</span>
                      <span>${orderSummary.pages} × ${orderSummary.pricePerPage.toFixed(2)}</span>
                    </div>
                    
                    {orderSummary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (15%):</span>
                        <span>-${orderSummary.discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${orderSummary.finalPrice.toFixed(2)}</span>
                  </div>
                  
                  {orderSummary.discount > 0 && (
                    <div className="text-green-600 text-sm text-right mt-1">
                      You save: ${orderSummary.discount.toFixed(2)}
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-3 text-sm">
                    <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Estimated delivery time</p>
                      <p className="text-blue-600 dark:text-blue-400">
                        {orderSummary.deadline === "6h" || orderSummary.deadline === "12h" ? 
                          "Your order will be completed today" : 
                          `Your order will be delivered by ${new Date(Date.now() + parseInt(orderSummary.deadline) * 24 * 60 * 60 * 1000).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button className="w-full" size="lg" variant="premium">
                  Complete Your Order
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Protected by SSL encryption
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
