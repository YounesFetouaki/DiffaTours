'use client';

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { useTranslations } from '@/lib/i18n/hooks';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface Activity {
  id: string;
  name: string;
  duration: string;
  priceMAD: number;
  description: string;
  availableTimes: string[];
}

interface ReservationCalendarProps {
  activities: Activity[];
}

// Helper function to safely get string value from field that might be a translation object
const getStringValue = (field: any, locale: string = 'en'): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null) {
    return field[locale] || field.en || field.fr || field.es || field.it || '';
  }
  return String(field);
};

export const ReservationCalendar = ({ activities }: ReservationCalendarProps) => {
  const t = useTranslations();
  const { formatPrice } = useCurrency();
  const params = useParams();
  const locale = params.locale as string || 'en';
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [participants, setParticipants] = useState(1);

  const monthNames = [
    t('months.january'), t('months.february'), t('months.march'),
    t('months.april'), t('months.may'), t('months.june'),
    t('months.july'), t('months.august'), t('months.september'),
    t('months.october'), t('months.november'), t('months.december')
  ];

  const dayNames = [
    t('days.sunday'), t('days.monday'), t('days.tuesday'),
    t('days.wednesday'), t('days.thursday'), t('days.friday'), t('days.saturday')
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isDatePast = (date: Date | null) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleBooking = () => {
    if (!selectedActivity || !selectedDate || !selectedTime) {
      toast.error(t('calendar.select_all_fields'));
      return;
    }

    const totalPrice = selectedActivity.priceMAD * participants;
    const activityName = getStringValue(selectedActivity.name, locale);
    
    toast.success(
      `${t('calendar.booking_confirmed')}\n${activityName}\n${t('calendar.date')}: ${selectedDate.toLocaleDateString()}\n${t('calendar.time')}: ${selectedTime}\n${t('calendar.participants')}: ${participants}\n${t('calendar.total')}: ${formatPrice(totalPrice)}`
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
      <h3 className="text-2xl font-display font-semibold mb-6 text-foreground">
        {t('calendar.select_activity')}
      </h3>

      {/* Activity Selection */}
      <div className="mb-8">
        <div className="grid gap-4 md:grid-cols-2">
          {activities.map((activity) => {
            const activityName = getStringValue(activity.name, locale);
            const activityDescription = getStringValue(activity.description, locale);
            const activityDuration = getStringValue(activity.duration, locale);
            
            return (
              <button
                key={activity.id}
                onClick={() => {
                  setSelectedActivity(activity);
                  setSelectedTime('');
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                  selectedActivity?.id === activity.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <h4 className="font-semibold text-lg mb-1 text-foreground">{activityName}</h4>
                <p className="text-sm text-muted mb-2">{activityDescription}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted">
                    <Clock className="w-4 h-4" />
                    {activityDuration}
                  </span>
                  <span className="font-semibold text-primary">
                    {formatPrice(activity.priceMAD)} / {t('calendar.price_per_person')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedActivity && (
        <>
          {/* Calendar */}
          <div className="mb-8">
            <h4 className="text-xl font-display font-semibold mb-4 text-foreground">
              {t('calendar.select_date_time')}
            </h4>
            
            <div className="border border-border rounded-lg p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h5 className="text-lg font-semibold text-foreground">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h5>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                  <button
                    key={index}
                    disabled={!day || isDatePast(day)}
                    onClick={() => {
                      if (day) {
                        setSelectedDate(day);
                        setSelectedTime('');
                      }
                    }}
                    className={`
                      aspect-square p-2 rounded-lg text-center transition-all
                      ${!day ? 'invisible' : ''}
                      ${isDatePast(day) ? 'text-muted/40 cursor-not-allowed' : 'hover:bg-secondary cursor-pointer text-foreground'}
                      ${isSameDay(day, selectedDate) ? 'bg-primary text-white hover:bg-primary' : ''}
                    `}
                  >
                    {day?.getDate()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-8">
              <h5 className="text-lg font-semibold mb-3 text-foreground">{t('calendar.select_time')}</h5>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {selectedActivity.availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 px-4 rounded-lg border-2 transition-all ${
                      selectedTime === time
                        ? 'border-primary bg-primary text-white'
                        : 'border-border hover:border-primary text-foreground'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Participants Selection */}
          {selectedTime && (
            <div className="mb-8">
              <h5 className="text-lg font-semibold mb-3 text-foreground">{t('calendar.participants')}</h5>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setParticipants(Math.max(1, participants - 1))}
                  className="w-10 h-10 rounded-full border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-foreground"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center text-foreground">
                  {participants}
                </span>
                <button
                  onClick={() => setParticipants(participants + 1)}
                  className="w-10 h-10 rounded-full border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-foreground"
                >
                  +
                </button>
                <span className="ml-4 text-muted">
                  <Users className="inline w-5 h-5 mr-2" />
                  {participants} {participants === 1 ? t('calendar.person') : t('calendar.persons')}
                </span>
              </div>
            </div>
          )}

          {/* Booking Summary & Button */}
          {selectedTime && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted mb-1">{t('calendar.total')}</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(selectedActivity.priceMAD * participants)}
                  </p>
                </div>
                <Button
                  onClick={handleBooking}
                  size="lg"
                  className="px-8 py-6 text-lg group relative overflow-hidden"
                >
                  <span className="relative z-10">{t('calendar.book_now')}</span>
                  <div className="absolute inset-0 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Button>
              </div>
              <div className="text-sm text-muted space-y-1">
                <p>📅 {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</p>
                <p>🕐 {selectedTime}</p>
                <p>👥 {participants} {participants === 1 ? t('calendar.person') : t('calendar.persons')}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};