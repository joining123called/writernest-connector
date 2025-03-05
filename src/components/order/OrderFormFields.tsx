
import React from 'react';
import { paperTypes, subjects, deadlines, citationStyles } from './PriceCalculator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Upload, Calendar, Clock, BookText, GraduationCap, FileText, BookOpen, Timer } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TimePicker } from './TimePicker';
import { Separator } from '@/components/ui/separator';

type OrderFormFieldsProps = {
  form: UseFormReturn<any>;
};

export function OrderFormFields({ form }: OrderFormFieldsProps) {
  return (
    <Card className="border-t-4 border-t-primary rounded-2xl shadow-md bg-gradient-to-b from-white to-gray-50/80 dark:from-slate-900 dark:to-slate-900/90">
      <CardHeader className="pb-3">
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Paper Details</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Let us know exactly what you need for your paper
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-base font-medium mb-3 text-foreground flex items-center">
            <BookText className="mr-2 h-4 w-4 text-primary" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="paperType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Paper Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
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
                  <FormLabel className="text-sm font-medium">Subject Area</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
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
        </div>
        
        <Separator className="my-2" />
        
        <div>
          <h3 className="text-base font-medium mb-3 text-foreground flex items-center">
            <Timer className="mr-2 h-4 w-4 text-primary" />
            Length & Deadline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="pages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Paper Length</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
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
              name="deadlineDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Deadline</FormLabel>
                  <div className="grid grid-cols-12 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "col-span-8 pl-3 text-left font-normal flex justify-between items-center h-11",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Select date</span>
                            )}
                            <Calendar className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <FormField
                      control={form.control}
                      name="deadlineTime"
                      render={({ field: timeField }) => (
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "col-span-4 font-normal flex justify-between items-center h-11",
                                  !timeField.value && "text-muted-foreground"
                                )}
                              >
                                {timeField.value || <span>Time</span>}
                                <Clock className="h-4 w-4 opacity-50 ml-2" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3" align="start">
                              <div className="flex items-center space-x-2">
                                <TimePicker value={timeField.value} onChange={timeField.onChange} />
                              </div>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                      )}
                    />
                  </div>
                  <FormDescription className="text-xs">
                    Select when you need your paper delivered
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div>
          <h3 className="text-base font-medium mb-3 text-foreground flex items-center">
            <GraduationCap className="mr-2 h-4 w-4 text-primary" />
            Paper Content
          </h3>
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Topic / Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your paper topic or title" className="h-11" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
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
                  <FormLabel className="text-sm font-medium">Paper Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed instructions for your paper..." 
                      rows={5}
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Include any specific requirements, grading rubric, or sample material
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div>
          <h3 className="text-base font-medium mb-3 text-foreground flex items-center">
            <BookOpen className="mr-2 h-4 w-4 text-primary" />
            Sources & References
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="citationStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Citation Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
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
                  <FormLabel className="text-sm font-medium">Number of Sources</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
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
        </div>
        
        <div className="border border-dashed border-primary/30 bg-primary/5 rounded-lg p-4 mt-6">
          <Button type="button" variant="outline" className="flex gap-2 w-full justify-center">
            <Upload size={16} />
            Upload Additional Files
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Upload any files that will help the writer (PDF, DOC, PPT, etc.)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
