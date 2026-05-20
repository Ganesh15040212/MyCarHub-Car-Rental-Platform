import * as React from "react";
import { format, parse, isValid, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";

interface DatePickerProps {
  value: string; // Stored in dd/mm/yyyy format
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  className?: string;
  id?: string;
  required?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  minDate,
  className,
  id,
  required = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  // Sync internal input value with props
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle keyboard typing with automatic slashes (DD/MM/YYYY mask)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanVal = e.target.value.replace(/\D/g, ""); // digits only

    if (cleanVal.length > 8) {
      cleanVal = cleanVal.substring(0, 8);
    }

    let formattedVal = "";
    if (cleanVal.length > 0) {
      formattedVal += cleanVal.substring(0, 2);
    }
    if (cleanVal.length > 2) {
      formattedVal += "/" + cleanVal.substring(2, 4);
    }
    if (cleanVal.length > 4) {
      formattedVal += "/" + cleanVal.substring(4, 8);
    }

    setInputValue(formattedVal);
    onChange(formattedVal); // Pass value up immediately so state matches typing
  };

  // Handle input blur (reverts to last valid value or clears if invalid)
  const handleInputBlur = () => {
    if (inputValue.length === 10) {
      const parsedDate = parse(inputValue, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        if (minDate && isBefore(startOfDay(parsedDate), startOfDay(minDate))) {
          setInputValue("");
          onChange("");
        } else {
          setInputValue(inputValue);
          onChange(inputValue);
        }
      } else {
        setInputValue("");
        onChange("");
      }
    } else if (inputValue.length > 0) {
      setInputValue("");
      onChange("");
    }
  };

  // Handle calendar day selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "dd/MM/yyyy");
      setInputValue(formatted);
      onChange(formatted);
      setIsOpen(false);
    } else {
      // Clear if date is de-selected
      setInputValue("");
      onChange("");
      setIsOpen(false);
    }
  };

  // Parse current value for visual calendar highlighted state
  const calendarDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parse(value, "dd/MM/yyyy", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => setIsOpen(true)}
        onClick={() => setIsOpen(true)}
        className="w-full pr-12 bg-gray-50/50 border-gray-200 focus:ring-red-500 focus:border-red-500 rounded-lg py-5 cursor-pointer"
        required={required}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100/50"
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 border border-gray-200 shadow-xl rounded-2xl bg-white z-50" 
            align="end"
          >
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={handleCalendarSelect}
              initialFocus
              disabled={(date) =>
                minDate ? isBefore(startOfDay(date), startOfDay(minDate)) : false
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
