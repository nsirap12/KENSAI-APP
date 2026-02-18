
import React from 'react';
import type { Collaborator, Role, ProductionTask, Quote, Client } from '../types';
import UsersIcon from './icons/UsersIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import ClipboardCheckIcon from './icons/ClipboardCheckIcon';
// Fix: Import ClockIcon from icons folder
import ClockIcon from './icons/ClockIcon';

interface HomePageProps {
  setCurrentPage: (page: 'quotes' | 'clients' | 'production' | 'collaborators') => void;
  currentUser: Collaborator;
  tasks: ProductionTask[];
  quotes: Quote[];
  clients: Client[];
  collaborators: Collaborator[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

const calculateQuoteTotal = (quote: Quote) => {
  const subtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = (subtotal * quote.taxRate) / 100;
  return subtotal + taxAmount;
};


const HomePage: React.FC<HomePageProps> = ({ setCurrentPage, currentUser, tasks, quotes, clients, collaborators }) => {
  const hasPermission = (allowedRoles: Role[]): boolean => {
    return allowedRoles.includes(currentUser.role);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const isDateInWeek = (dateStr: string | undefined) => {
      if (!dateStr) return false;
      const date = new Date(dateStr.replace(/-/g, '/'));
      return date >= startOfWeek && date <= endOfWeek;
  };

  const tasksDueThisWeek = tasks
    .filter(t => t.deliveryDate && isDateInWeek(t.deliveryDate))
    .sort((a, b) => new Date(a.deliveryDate!.replace(/-/g, '/')).getTime() - new Date(b.deliveryDate!.replace(/-/g, '/')).getTime());

  const quotesAcceptedThisWeek = quotes.filter(q => q.status === 'Aceptada' && isDateInWeek(q.acceptanceDate));
  const totalWeeklySales = quotesAcceptedThisWeek.reduce((sum, q) => sum + calculateQuoteTotal(q), 0);
  
  const tasksCompletedThisWeek = tasks.filter(t => 
      t.status === 'LISTO PARA ENTREGAR' &&
      (isDateInWeek(t.designEndDate) || isDateInWeek(t.workshop1EndDate) || isDateInWeek(t.workshop2EndDate))
  );

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';
  
  const getCurrentAssignee = (task: ProductionTask) => {
    let assigneeId: string | undefined;
    switch(task.status) {
      case 'DISEÑO_ESPERA': 
      case 'DISEÑO_PROCESO':
      case 'DISEÑO_REVISION':
        assigneeId = task.designerId; 
        break;
      case 'TALLER 1': assigneeId = task.workshop1AssigneeId; break;
      case 'TALLER 2': assigneeId = task.workshop2AssigneeId; break;
      default: return 'N/A';
    }
    return collaborators.find(c => c.id === assigneeId)?.name || 'Sin Asignar';
  };
  
  const StatusBadge: React.FC<{ status: ProductionTask['status'] }> = ({ status }) => {
    const statusConfig: Record<ProductionTask['status'], { color: string; }> = {
      'PENDIENTE DE PAGO': { color: 'yellow' },
      'PENDIENTE DE ASIGNACIÓN': { color: 'orange' },
      'DISEÑO_ESPERA': { color: 'indigo' },
      'DISEÑO_PROCESO': { color: 'purple' },
      'DISEÑO_REVISION': { color: 'pink' },
      'TALLER 1': { color: 'blue' },
      'TALLER 2': { color: 'teal' },
      'LISTO PARA ENTREGAR': { color: 'green' },
    };
    const { color } = statusConfig[status] || { color: 'gray' };
    return <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-${color}-100 text-${color}-800`}>{status}</span>;
  };
  
  const ActionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
  }> = ({ icon, title, description, onClick }) => (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-gray-100 group"
    >
      <div className="flex items-center gap-5">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">{icon}</div>
        <div>
          <h3 className="text-base font-black text-gray-900 uppercase tracking-tighter">{title}</h3>
          <p className="text-xs text-gray-400 font-medium">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 animate-fade-in">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-3">Hola, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-gray-500 font-medium">Aquí tienes el estatus de tus operaciones de esta semana.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Folios Aceptados</p>
                <p className="text-3xl font-black text-indigo-700">{quotesAcceptedThisWeek.length}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Alerts & Tasks */}
        <div className="lg:col-span-2 space-y-8">
            <section>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-6">Próximas Entregas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {tasksDueThisWeek.map(task => (
                        <div key={task.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{task.quoteNumber}</p>
                                    <h3 className="text-lg font-black text-gray-800 leading-tight mt-1">{getClientName(task.clientId)}</h3>
                                </div>
                                <StatusBadge status={task.status} />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-red-600">
                                    <ClockIcon className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-tight">
                                        {new Date(task.deliveryDate!.replace(/-/g, '/')).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <UserGroupIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">{getCurrentAssignee(task)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {tasksDueThisWeek.length === 0 && (
                        <div className="col-span-full bg-gray-50 p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                            <ClipboardCheckIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sin entregas para esta semana</p>
                        </div>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-6">Accesos Rápidos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hasPermission(['Administrador', 'Ventas']) && (
                        <ActionCard
                            icon={<DocumentTextIcon className="w-6 h-6" />}
                            title="Cotizar"
                            description="Nueva orden de venta"
                            onClick={() => setCurrentPage('quotes')}
                        />
                    )}
                    {hasPermission(['Administrador', 'Diseñador', 'Productor']) && (
                        <ActionCard
                            icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
                            title="Producción"
                            description="Control de taller"
                            onClick={() => setCurrentPage('production')}
                        />
                    )}
                </div>
            </section>
        </div>

        {/* Right Column: Stats */}
        <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white space-y-8">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">Ventas de la Semana</h3>
                    <p className="text-4xl font-black">{formatCurrency(totalWeeklySales)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                        <p className="text-[9px] font-black uppercase text-indigo-100 opacity-60">Aceptadas</p>
                        <p className="text-xl font-black">{quotesAcceptedThisWeek.length}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                        <p className="text-[9px] font-black uppercase text-indigo-100 opacity-60">Terminadas</p>
                        <p className="text-xl font-black">{tasksCompletedThisWeek.length}</p>
                    </div>
                </div>
                <button onClick={() => setCurrentPage('quotes')} className="w-full py-4 bg-white text-indigo-600 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg">Nueva Cotización</button>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                    <TrendingUpIcon className="w-4 h-4 text-green-500" /> Rendimiento Equipo
                </h3>
                <div className="space-y-5">
                    {collaborators.slice(0, 5).map(c => {
                        const score = Math.floor(Math.random() * 40) + 60; // Mock score for aesthetics
                        return (
                            <div key={c.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-500 text-[10px]">{c.name.charAt(0)}</div>
                                    <p className="text-xs font-bold text-gray-700 truncate max-w-[100px]">{c.name}</p>
                                </div>
                                <div className="flex-1 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${score}%` }}></div>
                                </div>
                                <p className="text-[10px] font-black text-indigo-600">{score}%</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
