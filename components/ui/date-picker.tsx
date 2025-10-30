"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
  className?: string;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Select date",
  disabled,
  fromYear = 1950,
  toYear = new Date().getFullYear(),
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-12 justify-start text-left font-normal border-gray-200 hover:bg-[#F4F5F7] hover:border-[#007FFF]/30 transition-colors",
            !date && "text-[#363942]/50",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 text-[#363942]/40" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
          <ChevronDown className="ml-auto h-4 w-4 text-[#363942]/40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect?.(selectedDate);
            if (selectedDate) {
              setOpen(false);
            }
          }}
          disabled={disabled}
          defaultMonth={date}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
