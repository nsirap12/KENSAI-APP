
import React from 'react';
import type { AppNotification } from '../types';
import XMarkIcon from './icons/XMarkIcon';
import TrashIcon from './icons/TrashIcon';
import CheckIcon from './icons/CheckIcon';
import ClockIcon from './icons/ClockIcon';
import BellIcon from './icons/BellIcon';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onMarkAsRead, onClearAll, onClose }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-16 right-0 w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-gray-100 z-[100] flex flex-col max-h-[500px] overflow-hidden animate-fade-in-up">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Notificaciones</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{unreadCount} no leídas</p>
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <button onClick={onClearAll} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Borrar todo">
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <BellIcon className="w-10 h-10 text-gray-100 mx-auto mb-2" />
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Bandeja vacía</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 rounded-2xl border transition-all relative group ${n.read ? 'bg-white border-gray-50 opacity-60' : 'bg-indigo-50/30 border-indigo-100 shadow-sm'}`}
            >
              <div className="flex gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.message.toLowerCase().includes('venc') || n.message.toLowerCase().includes('urgente') ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`} />
                <div className="flex-1">
                  <p className={`text-xs leading-relaxed ${n.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <button 
                    onClick={() => onMarkAsRead(n.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 bg-white shadow-sm border border-gray-100 rounded-lg text-indigo-600 transition-all"
                  >
                    <CheckIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fin del historial</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
