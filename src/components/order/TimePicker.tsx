
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [hours, setHours] = React.useState<string>("12");
  const [minutes, setMinutes] = React.useState<string>("00");
  const [period, setPeriod] = React.useState<"AM" | "PM">("PM");

  // Set initial values when component mounts or value changes
  React.useEffect(() => {
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
    <div className="grid gap-2">
      <div className="flex items-center space-x-2">
        <Input
          className="w-12"
          value={hours}
          onChange={handleHoursChange}
          placeholder="12"
          maxLength={2}
        />
        <span className="text-sm">:</span>
        <Input
          className="w-12"
          value={minutes}
          onChange={handleMinutesChange}
          placeholder="00"
          maxLength={2}
        />
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
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            // Ensure we have values before setting
            if (!hours) setHours("12");
            if (!minutes) setMinutes("00");
            updateTime(hours || "12", minutes || "00", period);
          }}
        >
          Set Time
        </Button>
      </div>
    </div>
  );
}
