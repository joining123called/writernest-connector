
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateTimePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date) => void;
  time: string;
  onTimeChange: (time: string) => void;
}

export function DateTimePicker({ date, onDateChange, time, onTimeChange }: DateTimePickerProps) {
  const [hours, setHours] = useState<string>("12");
  const [minutes, setMinutes] = useState<string>("00");
  const [period, setPeriod] = useState<"AM" | "PM">("PM");

  // Set initial values when component mounts or time changes
  useEffect(() => {
    if (time) {
      const [timeStr, ampm] = time.split(' ');
      if (timeStr && ampm) {
        const [h, m] = timeStr.split(':');
        setHours(h);
        setMinutes(m);
        setPeriod(ampm as "AM" | "PM");
      }
    }
  }, [time]);

  // Update the time when any part changes
  const updateTime = (newHours?: string, newMinutes?: string, newPeriod?: "AM" | "PM") => {
    const h = newHours || hours;
    const m = newMinutes || minutes;
    const p = newPeriod || period;
    
    const newTime = `${h}:${m} ${p}`;
    onTimeChange(newTime);
    return newTime;
  };

  // Handle hour change
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let h = e.target.value.replace(/\D/g, '');
    
    // Ensure valid hours (1-12)
    if (h === '') h = '';
    else {
      const hourNum = parseInt(h, 10);
      if (hourNum > 12) h = '12';
      else if (hourNum < 1) h = '1';
      else h = hourNum.toString();
    }
    
    setHours(h);
    if (h) updateTime(h);
  };

  // Handle minute change
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let m = e.target.value.replace(/\D/g, '');
    
    // Ensure valid minutes (0-59)
    if (m === '') m = '';
    else {
      const minNum = parseInt(m, 10);
      if (minNum > 59) m = '59';
      else m = minNum.toString().padStart(2, '0');
    }
    
    setMinutes(m);
    if (m) updateTime(undefined, m);
  };

  // Handle period change (AM/PM)
  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    updateTime(undefined, undefined, newPeriod);
  };

  // Common time presets
  const timePresets = [
    { label: "9:00 AM", value: "9:00 AM" },
    { label: "12:00 PM", value: "12:00 PM" },
    { label: "3:00 PM", value: "3:00 PM" },
    { label: "6:00 PM", value: "6:00 PM" },
    { label: "9:00 PM", value: "9:00 PM" },
    { label: "11:59 PM", value: "11:59 PM" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border border-input/60 bg-background/80 hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
            !date && "text-muted-foreground"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 opacity-70" />
              {date ? (
                <span>
                  {format(date, "MMM d, yyyy")} at {time || "00:00 AM"}
                </span>
              ) : (
                <span>Select date and time</span>
              )}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-0 bg-gradient-to-br from-white to-slate-50 dark:from-gray-950 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
          <Tabs defaultValue="date" className="w-[350px]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
              <TabsList className="grid grid-cols-2 w-full bg-muted/50">
                <TabsTrigger value="date" className="text-sm font-medium">Date</TabsTrigger>
                <TabsTrigger value="time" className="text-sm font-medium">Time</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="date" className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && onDateChange(newDate)}
                initialFocus
                disabled={(date) => date < new Date()}
                className="rounded-md border-none shadow-none"
              />
            </TabsContent>
            
            <TabsContent value="time" className="py-4 px-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none">
                      <Clock className="h-3.5 w-3.5 inline mr-1.5 opacity-70" />
                      Time
                    </label>
                    <div className="text-xs text-muted-foreground">24-hour format</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-background rounded-md border border-input overflow-hidden">
                      <Input
                        className="w-12 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={hours}
                        onChange={handleHoursChange}
                        placeholder="12"
                        maxLength={2}
                      />
                      <span className="text-sm text-muted-foreground px-1">:</span>
                      <Input
                        className="w-12 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={minutes}
                        onChange={handleMinutesChange}
                        placeholder="00"
                        maxLength={2}
                      />
                    </div>
                    <Select value={period} onValueChange={(val) => handlePeriodChange(val as "AM" | "PM")}>
                      <SelectTrigger className="w-16">
                        <SelectValue placeholder="AM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none mb-2">Common times</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timePresets.map((preset) => (
                      <Button 
                        key={preset.value} 
                        variant="outline" 
                        size="sm"
                        className={cn(
                          "text-xs h-8",
                          time === preset.value && "bg-primary/10 border-primary/30 text-primary"
                        )}
                        onClick={() => {
                          const [timeStr, ampm] = preset.value.split(' ');
                          const [h, m] = timeStr.split(':');
                          setHours(h);
                          setMinutes(m);
                          setPeriod(ampm as "AM" | "PM");
                          onTimeChange(preset.value);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="p-3 border-t border-border/40 bg-background">
          <Button 
            size="sm" 
            variant="premium"
            className="w-full"
            onClick={() => {
              // Make sure we have a valid time set
              if (!hours) setHours("12");
              if (!minutes) setMinutes("00");
              updateTime(hours || "12", minutes || "00", period);
            }}
          >
            <Clock className="h-3.5 w-3.5 mr-2" />
            Confirm Selection
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TimePicker({ value, onChange }: { value: string, onChange: (time: string) => void }) {
  const [hours, setHours] = useState<string>("12");
  const [minutes, setMinutes] = useState<string>("00");
  const [period, setPeriod] = useState<"AM" | "PM">("PM");

  // Set initial values when component mounts or value changes
  useEffect(() => {
    if (value) {
      const [time, ampm] = value.split(' ');
      if (time && ampm) {
        const [h, m] = time.split(':');
        setHours(h);
        setMinutes(m);
        setPeriod(ampm as "AM" | "PM");
      }
    }
  }, [value]);

  // Update the time when any part changes
  const updateTime = (newHours?: string, newMinutes?: string, newPeriod?: "AM" | "PM") => {
    const h = newHours || hours;
    const m = newMinutes || minutes;
    const p = newPeriod || period;
    
    const newTime = `${h}:${m} ${p}`;
    onChange(newTime);
    return newTime;
  };

  // Handle hour change
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let h = e.target.value.replace(/\D/g, '');
    
    // Ensure valid hours (1-12)
    if (h === '') h = '';
    else {
      const hourNum = parseInt(h, 10);
      if (hourNum > 12) h = '12';
      else if (hourNum < 1) h = '1';
      else h = hourNum.toString();
    }
    
    setHours(h);
    if (h) updateTime(h);
  };

  // Handle minute change
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let m = e.target.value.replace(/\D/g, '');
    
    // Ensure valid minutes (0-59)
    if (m === '') m = '';
    else {
      const minNum = parseInt(m, 10);
      if (minNum > 59) m = '59';
      else m = minNum.toString().padStart(2, '0');
    }
    
    setMinutes(m);
    if (m) updateTime(undefined, m);
  };

  // Handle period change (AM/PM)
  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    updateTime(undefined, undefined, newPeriod);
  };

  return (
    <div className="grid gap-3">
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-background rounded-md border border-input overflow-hidden">
          <Input
            className="w-12 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={hours}
            onChange={handleHoursChange}
            placeholder="12"
            maxLength={2}
          />
          <span className="text-sm text-muted-foreground px-1">:</span>
          <Input
            className="w-12 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={minutes}
            onChange={handleMinutesChange}
            placeholder="00"
            maxLength={2}
          />
        </div>
        <Select value={period} onValueChange={(val) => handlePeriodChange(val as "AM" | "PM")}>
          <SelectTrigger className="w-16">
            <SelectValue placeholder="AM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => {
          // Ensure we have values before setting
          if (!hours) setHours("12");
          if (!minutes) setMinutes("00");
          updateTime(hours || "12", minutes || "00", period);
        }}
      >
        <Clock className="h-3.5 w-3.5 mr-2" />
        Set Time
      </Button>
    </div>
  );
}
