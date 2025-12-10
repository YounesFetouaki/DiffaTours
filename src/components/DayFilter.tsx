'use client';

import { Calendar } from 'lucide-react';
import { useState } from 'react';

interface DayFilterProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
}

const DAYS = [
  { value: 'all', label: 'All Days' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const DayFilter = ({ selectedDay, onDayChange }: DayFilterProps) => {
  return (
    <div className="glass p-6 rounded-[20px]">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Filter by Day</h3>
      </div>

      <div className="space-y-2">
        {DAYS.map((day) => (
          <button
            key={day.value}
            onClick={() => onDayChange(day.value)}
            className={`w-full text-left px-4 py-3 rounded-full transition-all ${selectedDay === day.value
                ? 'bg-primary text-white font-semibold shadow-lg'
                : 'bg-white/50 hover:bg-white/80 text-foreground'
              }`}
          >
            {day.label}
          </button>
        ))}
      </div>
    </div>
  );
};
