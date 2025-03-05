
import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Check, Clock, Upload, Calendar, X, FileText, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addHours, isToday, isTomorrow, addDays } from "date-fns";
import { useOrderFormSettings } from '@/hooks/use-order-form-settings';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Maximum file size: 2GB in bytes
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

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
  deadline: z.date({
    required_error: "Please select a deadline",
  }),
  topic: z.string().optional(),
  instructions: z.string().optional(),
  citationStyle: z.string().optional(),
  sources: z.string().optional(),
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
  onOrderSubmit?: (data: z.infer<typeof orderFormSchema> & { files: File[] }) => void;
};

export function OrderForm({ onOrderSubmit }: OrderFormProps) {
  const { toast } = useToast();
  const { settings, isLoading: isLoadingSettings } = useOrderFormSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [orderSummary, setOrderSummary] = useState({
    basePrice: 15.99,
    pages: 1,
    words: 275,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deadlineText: '7 days',
    pricePerPage: 15.99,
    totalPrice: 15.99,
    discount: 0,
    finalPrice: 15.99,
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isFormComplete, setIsFormComplete] = useState(false);
  
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      paperType: "",
      subject: "",
      pages: "1",
      deadline: new Date(Date.now() + settings.standardDeliveryDays * 24 * 60 * 60 * 1000),
      topic: "",
      instructions: "",
      citationStyle: "apa",
      sources: "0",
    },
  });
  
  useEffect(() => {
    if (!isLoadingSettings) {
      form.reset({
        ...form.getValues(),
        deadline: new Date(Date.now() + settings.standardDeliveryDays * 24 * 60 * 60 * 1000),
      });
    }
  }, [isLoadingSettings, settings, form]);

  const watchPages = form.watch('pages');
  const watchDeadline = form.watch('deadline');
  
  // Check if all required fields are filled
  useEffect(() => {
    const requiredFields = ['paperType', 'subject', 'pages', 'deadline'];
    const isComplete = requiredFields.every(field => !!form.getValues(field as any));
    setIsFormComplete(isComplete);
  }, [form.watch()]);
  
  const timeSlots = [
    { label: "9:00 AM", hours: 9, minutes: 0 },
    { label: "12:00 PM", hours: 12, minutes: 0 },
    { label: "3:00 PM", hours: 15, minutes: 0 },
    { label: "6:00 PM", hours: 18, minutes: 0 },
    { label: "9:00 PM", hours: 21, minutes: 0 },
    { label: "11:59 PM", hours: 23, minutes: 59 },
  ];
  
  React.useEffect(() => {
    if (isLoadingSettings) return;
    
    const pages = parseInt(watchPages || "1");
    const now = new Date();
    const selectedDate = watchDeadline || now;
    
    const diffTime = Math.abs(selectedDate.getTime() - now.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let multiplier = 1.0;
    const minHours = settings.minimumHours;
    
    // Apply the appropriate multiplier based on the deadline
    if (diffHours <= minHours) {
      multiplier = settings.urgentDeliveryMultiplier;
    } else if (diffHours <= 12) {
      multiplier = settings.urgent12HoursMultiplier;
    } else if (diffHours <= 24) {
      multiplier = settings.urgent24HoursMultiplier;
    } else if (diffHours <= 48) {
      multiplier = settings.urgent48HoursMultiplier;
    } else if (diffDays <= settings.standardDeliveryDays) {
      multiplier = 1.0;
    } else {
      multiplier = 0.9;
    }
    
    let deadlineText = '';
    if (isToday(selectedDate)) {
      deadlineText = `Today at ${format(selectedDate, 'h:mm a')}`;
    } else if (isTomorrow(selectedDate)) {
      deadlineText = `Tomorrow at ${format(selectedDate, 'h:mm a')}`;
    } else if (diffDays <= 7) {
      deadlineText = `${format(selectedDate, 'EEEE')} at ${format(selectedDate, 'h:mm a')}`;
    } else {
      deadlineText = format(selectedDate, 'MMMM d, yyyy') + ` at ${format(selectedDate, 'h:mm a')}`;
    }
    
    if (diffHours <= 12) {
      deadlineText += " (Very Urgent)";
    } else if (diffHours <= 24) {
      deadlineText += " (Urgent)";
    } else if (diffHours <= 48) {
      deadlineText += " (Express)";
    }
    
    const basePrice = settings.basePricePerPage;
    const pricePerPage = basePrice * multiplier;
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
      deadline: selectedDate,
      deadlineText,
      pricePerPage,
      totalPrice,
      discount,
      finalPrice
    });
  }, [watchPages, watchDeadline, settings, isLoadingSettings]);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles: File[] = [];
    const errors: string[] = [];
    
    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} exceeds the 2GB limit`);
        return;
      }
      
      newFiles.push(file);
    });
    
    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: "File upload error",
          description: error,
          variant: "destructive",
        });
      });
    }
    
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} file(s) ready to be submitted with your order`,
      });
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  const onSubmit = (data: z.infer<typeof orderFormSchema>) => {
    console.log("Order submitted:", data, orderSummary, uploadedFiles);
    
    toast({
      title: "Order submitted successfully",
      description: "Your order has been received and is being processed.",
    });
    
    if (onOrderSubmit) {
      onOrderSubmit({...data, files: uploadedFiles});
    }
  };
  
  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading order form...</span>
      </div>
    );
  }
  
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.showPaperType && (
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
                    )}
                    
                    {settings.showSubjectFields && (
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
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.showPageCount && (
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
                                    {i + 1} page{i > 0 ? 's' : ''} {settings.showWordCount ? `/ ${(i + 1) * 275} words` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {settings.showDeadlineOptions && (
                      <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Deadline</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full h-11 px-3 flex justify-between items-center text-left font-normal text-muted-foreground border border-input/40 bg-background/80 hover:bg-accent/30 hover:text-accent-foreground transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-primary/70" />
                                      {field.value ? (
                                        <span className="text-foreground">
                                          {format(field.value, "PPP")} at {format(field.value, "h:mm a")}
                                        </span>
                                      ) : (
                                        <span>Select deadline date and time</span>
                                      )}
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                      {field.value && isToday(field.value) ? "Today" : 
                                       field.value && isTomorrow(field.value) ? "Tomorrow" : ""}
                                    </span>
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <div className="border-b p-3">
                                  <div className="text-sm font-medium mb-2">Select date</div>
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      if (date) {
                                        const newDate = new Date(date);
                                        if (field.value) {
                                          newDate.setHours(field.value.getHours());
                                          newDate.setMinutes(field.value.getMinutes());
                                        } else {
                                          newDate.setHours(23);
                                          newDate.setMinutes(59);
                                        }
                                        field.onChange(newDate);
                                      }
                                    }}
                                    disabled={(date) => 
                                      date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </div>
                                <div className="p-3 border-t">
                                  <div className="text-sm font-medium mb-3">Select time</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {timeSlots.map((time, i) => {
                                      const isSelected = field.value && 
                                        field.value.getHours() === time.hours && 
                                        field.value.getMinutes() === time.minutes;
                                      
                                      return (
                                        <Button
                                          key={i}
                                          type="button"
                                          variant={isSelected ? "default" : "outline"}
                                          size="sm"
                                          className={`h-9 ${isSelected ? 'bg-primary text-white' : 'bg-background'}`}
                                          onClick={() => {
                                            const newDate = new Date(field.value || new Date());
                                            newDate.setHours(time.hours);
                                            newDate.setMinutes(time.minutes);
                                            field.onChange(newDate);
                                          }}
                                        >
                                          <Clock className="mr-2 h-3.5 w-3.5" />
                                          {time.label}
                                        </Button>
                                      )
                                    })}
                                  </div>
                                </div>
                                
                                <div className="p-3 border-t">
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const tomorrow = addDays(new Date(), 1);
                                        tomorrow.setHours(23, 59, 0, 0);
                                        field.onChange(tomorrow);
                                      }}
                                    >
                                      Tomorrow EOD
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const nextWeek = addDays(new Date(), 7);
                                        nextWeek.setHours(23, 59, 0, 0);
                                        field.onChange(nextWeek);
                                      }}
                                    >
                                      Next Week
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Choose when you need your paper delivered
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  {settings.showSubjectFields && (
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
                  )}
                  
                  {settings.showInstructions && (
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
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.showCitationStyles && (
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
                    )}
                    
                    {settings.showSources && (
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
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileUpload}
                      multiple
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex gap-2 mb-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                      Upload Additional Files
                    </Button>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">Uploaded Files:</p>
                        <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium truncate max-w-[200px]">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                  </span>
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFile(index)}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Submit button moved to the order summary section */}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div className={`w-full ${settings.orderSummaryPosition === 'right' ? 'md:w-1/3' : 'w-full'}`}>
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
                  {settings.showSubjectFields && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-medium">{form.watch('subject') ? 
                        subjects.find(s => s.value === form.watch('subject'))?.label : 
                        "Not selected"}</span>
                    </div>
                  )}
                  {settings.showPageCount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">
                        {orderSummary.pages} page{orderSummary.pages > 1 ? 's' : ''}
                        {settings.showWordCount ? ` / ${orderSummary.words} words` : ''}
                      </span>
                    </div>
                  )}
                  {settings.showDeadlineOptions && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium">{orderSummary.deadlineText}</span>
                    </div>
                  )}
                  
                  {settings.showCitationStyles && form.watch('citationStyle') && form.watch('citationStyle') !== "none" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Citation style:</span>
                      <span className="font-medium">
                        {citationStyles.find(s => s.value === form.watch('citationStyle'))?.label}
                      </span>
                    </div>
                  )}
                  
                  {settings.showSources && form.watch('sources') && form.watch('sources') !== "0" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sources:</span>
                      <span className="font-medium">{form.watch('sources')}</span>
                    </div>
                  )}
                  
                  {uploadedFiles.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Files:</span>
                      <Badge variant="outline" className="font-medium">
                        {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="text-lg font-medium mb-2">Price Breakdown</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base price:</span>
                      {settings.priceDisplayMode === 'perPage' ? (
                        <span>${orderSummary.pricePerPage.toFixed(2)} × {orderSummary.pages}</span>
                      ) : (
                        <span>${orderSummary.totalPrice.toFixed(2)}</span>
                      )}
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
                        {isToday(orderSummary.deadline) ? 
                          `Today at ${format(orderSummary.deadline, "h:mm a")}` : 
                          isTomorrow(orderSummary.deadline) ?
                          `Tomorrow at ${format(orderSummary.deadline, "h:mm a")}` :
                          `${format(orderSummary.deadline, "MMMM d, yyyy")} at ${format(orderSummary.deadline, "h:mm a")}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button 
                  type="button" 
                  className="w-full" 
                  size="lg"
                  disabled={!isFormComplete}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Submit Order
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
