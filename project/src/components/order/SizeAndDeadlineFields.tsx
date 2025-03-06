
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Clock } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { OrderFormValues, timeSlots } from './schema';
import { format, addDays, isToday, isTomorrow } from "date-fns";

interface SizeAndDeadlineFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  settings: {
    showPageCount: boolean;
    showWordCount: boolean;
    showDeadlineOptions: boolean;
  };
}

export function SizeAndDeadlineFields({ form, settings }: SizeAndDeadlineFieldsProps) {
  return (
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
  );
}
