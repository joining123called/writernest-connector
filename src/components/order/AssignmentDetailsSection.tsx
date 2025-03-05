
import React from 'react';
import { paperTypes, subjects } from './PriceCalculator';
import { FormField, FormControl, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileType, FileText, GraduationCap, BookText, Clock } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { DateTimePicker } from './TimePicker';

type AssignmentDetailsSectionProps = {
  form: UseFormReturn<any>;
};

export function AssignmentDetailsSection({ form }: AssignmentDetailsSectionProps) {
  return (
    <Card className="border border-border/10 shadow-sm overflow-hidden bg-gradient-to-br from-background to-background/90 dark:from-background/90 dark:to-background/70">
      <CardHeader className="pb-2 border-b border-border/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-primary/10 p-2.5 rounded-full">
            <FileType className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Assignment Details</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground/80">
          Tell us what you need help with
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="paperType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-sm font-medium text-foreground/90">
                  <FileText className="h-4 w-4 mr-2 text-primary/70" />
                  Paper Type
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-background border-input/40">
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
                <FormLabel className="flex items-center text-sm font-medium text-foreground/90">
                  <GraduationCap className="h-4 w-4 mr-2 text-primary/70" />
                  Subject Area
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-background border-input/40">
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
                <FormLabel className="flex items-center text-sm font-medium text-foreground/90">
                  <BookText className="h-4 w-4 mr-2 text-primary/70" />
                  Number of Pages
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 bg-background border-input/40">
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
                <FormLabel className="flex items-center text-sm font-medium text-foreground/90">
                  <Clock className="h-4 w-4 mr-2 text-primary/70" />
                  Deadline
                </FormLabel>
                <FormControl>
                  <DateTimePicker 
                    date={field.value} 
                    onDateChange={field.onChange}
                    time={form.watch('deadlineTime') || '11:59 PM'}
                    onTimeChange={(time) => form.setValue('deadlineTime', time)}
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground/80">
                  Select when you need your paper delivered
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
