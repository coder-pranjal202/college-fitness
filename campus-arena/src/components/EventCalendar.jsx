import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EventCalendar({ events }) {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const eventDates = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      if (event.date) {
        if (!map[event.date]) map[event.date] = [];
        map[event.date].push(event);
      }
    });
    return map;
  }, [events]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const formatDate = (day) => {
    const month = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${currentYear}-${month}-${dayStr}`;
  };

  const isToday = (day) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(day);
    const dayEvents = eventDates[dateStr] || [];
    const isTodayDate = isToday(day);

    days.push(
      <div
        key={day}
        className={`min-h-[60px] p-1 rounded-lg border transition cursor-pointer ${
          isTodayDate
            ? "bg-green-500/20 border-green-500/50"
            : dayEvents.length > 0
            ? "bg-white/5 border-white/20 hover:bg-white/10"
            : "bg-transparent border-transparent"
        }`}
        onClick={() => {
          if (dayEvents.length > 0) {
            navigate(`/event/${dayEvents[0].id}`);
          }
        }}
      >
        <div className={`text-xs font-semibold mb-1 ${isTodayDate ? "text-green-400" : "text-gray-400"}`}>
          {day}
        </div>
        {dayEvents.slice(0, 3).map((ev) => (
          <div
            key={ev.id}
            className="text-[10px] bg-green-500/30 text-green-300 rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer hover:bg-green-500/50"
            onClick={(e) => { e.stopPropagation(); navigate(`/event/${ev.id}`); }}
          >
            {ev.title?.slice(0, 15)}
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div className="text-[10px] text-gray-500">+{dayEvents.length - 3} more</div>
        )}
      </div>
    );
  }

  return (
    <div className="theme-card rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold theme-text-primary flex items-center gap-2">
          <CalendarIcon size={20} className="text-green-400" /> Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg transition">
            <ChevronLeft size={18} className="theme-text-muted" />
          </button>
          <span className="text-sm font-semibold theme-text-primary whitespace-nowrap">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg transition">
            <ChevronRight size={18} className="theme-text-muted" />
          </button>
          <button
            onClick={goToToday}
            className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-lg hover:bg-green-500/30 transition"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-semibold theme-text-muted py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      {Object.keys(eventDates).length > 0 && (
        <div className="mt-3 text-xs theme-text-muted">
          {Object.keys(eventDates).length} day{Object.keys(eventDates).length !== 1 ? "s" : ""} with events
        </div>
      )}
    </div>
  );
}