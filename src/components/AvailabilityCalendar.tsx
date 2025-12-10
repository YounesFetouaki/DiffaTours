'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarDay {
  date: string;
  hasCapacityLimit: boolean;
  maxCapacity?: number;
  currentBookings?: number;
  availableSpots?: number;
  isAvailable?: boolean;
  availabilityStatus: 'available' | 'limited' | 'full';
  message?: string;
}

interface AvailabilityCalendarProps {
  excursionId: string;
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  locale?: string;
  availableDays?: string[];
}

export const AvailabilityCalendar = ({
  excursionId,
  selectedDate,
  onDateSelect,
  locale = 'fr',
  availableDays
}: AvailabilityCalendarProps) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  const monthNames = locale === 'fr'
    ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = locale === 'fr'
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (excursionId && currentMonth && currentYear) {
      fetchCalendar();
    }
  }, [currentMonth, currentYear, excursionId]);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const url = `/api/capacity/calendar/${encodeURIComponent(excursionId)}?month=${currentMonth}&year=${currentYear}`;
      console.log('Fetching calendar from:', url);

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setCalendar(data.calendar || []);
      } else {
        console.error('Calendar API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentYear, currentMonth - 1, 1).getDay();
  };

  const isPastDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if a day of week is available
  const isDayOfWeekAvailable = (dateString: string): boolean => {
    if (!availableDays || availableDays.length === 0 || availableDays.includes('everyday')) {
      return true;
    }

    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    return availableDays.includes(dayOfWeek);
  };

  const getAvailabilityColor = (day: CalendarDay) => {
    if (isPastDate(day.date)) {
      return 'bg-gray-200 text-gray-500 cursor-not-allowed';
    }

    // Check if this day of week is available for this excursion
    if (!isDayOfWeekAvailable(day.date)) {
      return 'bg-gray-200 text-gray-500 cursor-not-allowed';
    }

    switch (day.availabilityStatus) {
      case 'full':
        return 'bg-red-300 text-red-900 cursor-not-allowed';
      case 'limited':
        return 'bg-yellow-300 text-yellow-900 hover:bg-yellow-400 cursor-pointer';
      case 'available':
        if (day.hasCapacityLimit) {
          // Prioritize yellow for limited spots (even if available)
          return 'bg-yellow-100 text-yellow-900 border-2 border-yellow-300 hover:bg-yellow-200 cursor-pointer';
        }
        return 'bg-[#FFB73F] text-white hover:bg-[#e69d1a] cursor-pointer';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer';
    }
  };

  const getAvailabilityLabel = (day: CalendarDay) => {
    if (isPastDate(day.date)) return '';

    // Check if this day of week is not available
    if (!isDayOfWeekAvailable(day.date)) {
      return locale === 'fr' ? 'Non disponible' : 'Not available';
    }

    if (!day.hasCapacityLimit) {
      return locale === 'fr' ? 'Disponible' : 'Available';
    }

    switch (day.availabilityStatus) {
      case 'full':
        return locale === 'fr' ? 'Complet' : 'Full';
      case 'limited':
        return locale === 'fr' ? `${day.availableSpots} places` : `${day.availableSpots} spots`;
      case 'available':
        return locale === 'fr' ? 'Disponible' : 'Available';
      default:
        return '';
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    if (isPastDate(day.date)) return;
    if (!isDayOfWeekAvailable(day.date)) return;
    if (day.availabilityStatus === 'full') return;
    onDateSelect(day.date);
  };

  const firstDay = getFirstDayOfMonth();
  const emptyDays = Array(firstDay).fill(null);

  return (
    <div className="bg-white rounded-[20px] border-2 border-primary/20 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          disabled={loading}
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-primary">
            {monthNames[currentMonth - 1]} {currentYear}
          </h3>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          disabled={loading}
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-primary py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Empty days */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {calendar.map((day) => {
            const dayNumber = new Date(day.date).getDate();
            const isSelected = selectedDate === day.date;
            const isPast = isPastDate(day.date);
            const isClickable = !isPast && day.availabilityStatus !== 'full' && isDayOfWeekAvailable(day.date);

            return (
              <button
                key={day.date}
                onClick={() => handleDayClick(day)}
                disabled={!isClickable}
                className={cn(
                  'aspect-square p-2 rounded-xl border-2 transition-all font-semibold text-base',
                  getAvailabilityColor(day),
                  isSelected && 'border-primary ring-4 ring-primary/30 scale-105',
                  !isSelected && 'border-transparent',
                  isClickable && 'hover:scale-105'
                )}
                title={getAvailabilityLabel(day)}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-base font-bold">{dayNumber}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t-2 border-primary/20">
        <div className="flex flex-wrap gap-4 text-xs justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FFB73F] border-2 border-primary rounded-lg"></div>
            <span className="font-medium">{locale === 'fr' ? 'Disponible' : 'Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-300 border-2 border-yellow-400 rounded-lg"></div>
            <span className="font-medium">{locale === 'fr' ? 'Places limitées' : 'Limited spots'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-300 border-2 border-red-400 rounded-lg"></div>
            <span className="font-medium">{locale === 'fr' ? 'Complet' : 'Full'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 border-2 border-gray-300 rounded-lg"></div>
            <span className="font-medium">{locale === 'fr' ? 'Non disponible' : 'Not available'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};