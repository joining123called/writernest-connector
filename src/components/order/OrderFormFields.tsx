
import React from 'react';
import { paperTypes, subjects, deadlines, citationStyles } from './PriceCalculator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Upload, Calendar, Clock, BookText, GraduationCap, AlignLeft, FileText, Book, FileType } from 'lucide-react';
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
    <div className="space-y-8">
      <Card className="border-none shadow-none bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center mb-2">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <FileType className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Assignment Details</CardTitle>
          </div>
          <CardDescription className="text-base">
            Tell us what you need help with
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="paperType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    Paper Type
                  </FormLabel>
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
                  <FormLabel className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                    Subject Area
                  </FormLabel>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField
              control={form.control}
              name="pages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <BookText className="h-4 w-4 mr-2 text-muted-foreground" />
                    Number of Pages
                  </FormLabel>
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
            
            {/* Deadline picker with merged date and time */}
            <FormField
              control={form.control}
              name="deadlineDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Deadline
                  </FormLabel>
                  <div className="grid grid-cols-12 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "col-span-8 h-11 pl-3 text-left font-normal flex justify-between items-center",
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
                                  "col-span-4 h-11 font-normal flex justify-between items-center",
                                  !timeField.value && "text-muted-foreground"
                                )}
                              >
                                {timeField.value || <span>Time</span>}
                                <Clock className="h-4 w-4 opacity-50 ml-2" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3" align="start">
                              <TimePicker value={timeField.value} onChange={timeField.onChange} />
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
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-none bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
        <CardHeader className="pb-2">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
              <AlignLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-semibold">Paper Content</CardTitle>
          </div>
          <CardDescription className="text-base">
            Provide specific details about your paper
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic / Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your paper topic or title" className="h-11" {...field} />
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
                      className="min-h-[120px] resize-none"
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField
              control={form.control}
              name="citationStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Book className="h-4 w-4 mr-2 text-muted-foreground" />
                    Citation Style
                  </FormLabel>
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
                  <FormLabel>Number of Sources</FormLabel>
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
          
          <div className="border-t border-border/50 pt-6 mt-6">
            <Button type="button" variant="outline" className="flex gap-2 h-11">
              <Upload size={16} />
              Upload Additional Files
            </Button>
            <FormDescription className="mt-2 text-sm">
              Upload any reference materials or assignment guidelines
            </FormDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
