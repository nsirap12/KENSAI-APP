import React, { useState } from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface CalendarProps {
  selectedDate: string | undefined;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate.replace(/-/g, '/')) : new Date());

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-5 h-5" /></button>
      <div className="font-semibold text-gray-700">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
      <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5" /></button>
    </div>
  );

  const renderDaysOfWeek = () => (
    <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
      {daysOfWeek.map(day => <div key={day}>{day}</div>)}
    </div>
  );

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const selected = selectedDate ? new Date(selectedDate.replace(/-/g, '/')) : null;

    const days = [];
    // Blank days for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`blank-${i}`} className="p-1"></div>);
    }
    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = selected && date.toDateString() === selected.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      const dayClasses = `
        w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors text-sm
        ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
        ${!isSelected && isToday ? 'bg-blue-100 text-blue-700' : ''}
        ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}
      `;
      
      days.push(
        <div key={day} className="flex justify-center items-center">
            <div
            className={dayClasses}
            onClick={() => {
                const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                onDateSelect(localDate.toISOString().split('T')[0]);
                onClose();
            }}
            >
            {day}
            </div>
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-y-1">{days}</div>;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-2xl border border-gray-200 w-72 animate-fade-in-up">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCalendarDays()}
    </div>
  );
};

export default Calendar;