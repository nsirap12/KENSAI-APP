
import React, { useState, useMemo } from 'react';
import type { Quote, Client, Collaborator, ProductionTask } from '../types';
import TrashIcon from './icons/TrashIcon';
import CheckIcon from './icons/CheckIcon';
import XMarkIcon from './icons/XMarkIcon';
import PencilIcon from './icons/PencilIcon';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';
import EyeIcon from './icons/EyeIcon';
import QuotePreview from './QuotePreview';
import PrintIcon from './icons/PrintIcon';

interface HistoryPageProps {
  quotes: Quote[];
  clients: Client[];
  collaborators: Collaborator[];
  tasks: ProductionTask[];
  onUpdateStatus: (quoteId: string, status: Quote['status'], assignmentData?: any) => void;
  onDelete: (quoteId: string) => void;
  onEdit: (quote: Quote) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ quotes, clients, collaborators, tasks, onUpdateStatus, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [assignmentModalQuote, setAssignmentModalQuote] = useState<Quote | null>(null);
  
  const [assignmentData, setAssignmentData] = useState({
    designerId: '',
    deliveryDate: '',
    observations: ''
  });

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Cliente Desconocido';
  };

  const getCollaboratorName = (id?: string) => {
    return collaborators.find(c => c.id === id)?.name || 'N/A';
  };

  const filteredQuotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return quotes;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return quotes.filter(quote =>
      quote.quoteNumber.toLowerCase().includes(lowercasedFilter) ||
      getClientName(quote.clientId).toLowerCase().includes(lowercasedFilter)
    );
  }, [quotes, clients, searchTerm]);
  
  const calculateTotal = (quote: Quote) => {
    const subtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const taxAmount = (subtotal * quote.taxRate) / 100;
    return subtotal + taxAmount;
  };

  const getPaymentStatus = (quote: Quote) => {
    const total = calculateTotal(quote);
    const paid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0);
    if (paid >= total - 0.05) return { label: 'Pagado', color: 'green' };
    if (paid > 0) return { label: 'Parcial', color: 'blue' };
    return { label: 'Pendiente', color: 'red' };
  };

  const getProductionStatus = (quoteId: string) => {
    const task = tasks.find(t => t.id === quoteId);
    if (!task) return { label: 'Sin Proceso', color: 'gray', delivered: false };
    
    const statusLabels: Record<string, string> = {
      'PENDIENTE DE PAGO': 'Espera Pago',
      'PENDIENTE DE ASIGNACIÓN': 'Por Asignar',
      'DISEÑO_ESPERA': 'En Cola Diseño',
      'DISEÑO_PROCESO': 'En Diseño',
      'DISEÑO_REVISION': 'Revisión Cliente',
      'TALLER 1': 'En Taller',
      'LISTO PARA ENTREGAR': 'Terminado',
    };

    return { 
        label: statusLabels[task.status] || task.status, 
        color: 'indigo',
        delivered: task.delivered,
        deliveredBy: task.deliveredById ? getCollaboratorName(task.deliveredById) : null,
        deliveryDate: task.deliveryDateFinal
    };
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const designers = collaborators.filter(c => c.role === 'Diseñador' || c.role === 'Administrador');

  const handleOpenAssignment = (quote: Quote) => {
    setAssignmentModalQuote(quote);
    setAssignmentData({
      designerId: '',
      deliveryDate: '',
      observations: ''
    });
  };

  const handleConfirmAssignment = () => {
    if (!assignmentData.designerId || !assignmentData.deliveryDate) {
      alert("Por favor asigne un responsable y una fecha de entrega.");
      return;
    }
    onUpdateStatus(assignmentModalQuote!.id, 'Aceptada', assignmentData);
    setAssignmentModalQuote(null);
  };

  const StatusBadge: React.FC<{ status: Quote['status'] }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-wider";
    const statusClasses = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      Aceptada: "bg-green-100 text-green-800",
      Rechazada: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-fade-in">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase">Historial</h1>
          <p className="text-gray-500 font-medium">Control y seguimiento de cotizaciones emitidas.</p>
        </div>
        <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar folio o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {filteredQuotes.map(quote => {
            const pay = getPaymentStatus(quote);
            const prod = getProductionStatus(quote.id);
            return (
                <div key={quote.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex justify-between items-start">
                        <div onClick={() => setViewingQuote(quote)} className="cursor-pointer">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{quote.quoteNumber}</p>
                            <h3 className="text-base font-black text-gray-800">{getClientName(quote.clientId)}</h3>
                        </div>
                        <StatusBadge status={quote.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-50">
                        <div className="text-[9px] uppercase font-bold text-gray-400">
                             Pago: <span className={`text-${pay.color}-600`}>{pay.label}</span>
                        </div>
                        <div className="text-[9px] uppercase font-bold text-gray-400">
                             Producción: <span className="text-indigo-600">{prod.label}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end pt-2">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
                            <p className="text-lg font-black text-indigo-600">{formatCurrency(calculateTotal(quote))}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                              onClick={() => setViewingQuote(quote)} 
                              className="flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-indigo-100 transition"
                            >
                                <EyeIcon className="w-4 h-4"/> Detalles
                            </button>
                            {quote.status === 'Pendiente' && (
                                <button onClick={() => handleOpenAssignment(quote)} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100"><CheckIcon className="w-5 h-5"/></button>
                            )}
                            <button onClick={() => onEdit(quote)} className="p-2.5 bg-gray-50 text-blue-600 rounded-xl"><PencilIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black uppercase text-gray-400 bg-gray-50/50">
              <tr>
                <th className="px-8 py-5">Folio</th>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Pago</th>
                <th className="px-8 py-5">Producción</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredQuotes.map(quote => {
                const pay = getPaymentStatus(quote);
                const prod = getProductionStatus(quote.id);
                return (
                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => setViewingQuote(quote)}
                        className="font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tight text-left"
                      >
                        {quote.quoteNumber}
                      </button>
                    </td>
                    <td className="px-8 py-5 font-bold text-gray-700">{getClientName(quote.clientId)}</td>
                    <td className="px-8 py-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-${pay.color}-100 text-${pay.color}-700`}>
                            {pay.label}
                        </span>
                    </td>
                    <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase">{prod.label}</span>
                            <span className={`text-[9px] font-black uppercase ${prod.delivered ? 'text-green-600' : 'text-orange-400'}`}>
                                {prod.delivered ? `✅ Entregado` : '⏳ Pendiente'}
                            </span>
                        </div>
                    </td>
                    <td className="px-8 py-5 font-black text-indigo-600">{formatCurrency(calculateTotal(quote))}</td>
                    <td className="px-8 py-5"><StatusBadge status={quote.status} /></td>
                    <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setViewingQuote(quote)} 
                              title="Previsualización Detallada" 
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-indigo-600 font-black uppercase text-[10px] rounded-xl hover:bg-indigo-50 shadow-sm transition-all"
                            >
                                <EyeIcon className="w-4 h-4"/> Detalles
                            </button>
                            {quote.status === 'Pendiente' && (
                                <button onClick={() => handleOpenAssignment(quote)} title="Aceptar y Asignar" className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"><CheckIcon className="w-5 h-5"/></button>
                            )}
                            <button onClick={() => onEdit(quote)} title="Editar" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => onDelete(quote.id)} title="Eliminar" className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </td>
                    </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {assignmentModalQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Asignar Producción</h2>
            <p className="text-sm text-gray-500 mb-8 font-medium">Define responsable y fecha para la orden <span className="text-indigo-600 font-black">{assignmentModalQuote.quoteNumber}</span></p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Responsable</label>
                <select 
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                  value={assignmentData.designerId}
                  onChange={(e) => setAssignmentData({...assignmentData, designerId: e.target.value})}
                >
                  <option value="">Selecciona...</option>
                  {designers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.role})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Fecha Entrega</label>
                <input 
                  type="date"
                  className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                  value={assignmentData.deliveryDate}
                  onChange={(e) => setAssignmentData({...assignmentData, deliveryDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-10">
              <button onClick={() => setAssignmentModalQuote(null)} className="flex-1 py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 rounded-2xl transition">Cerrar</button>
              <button onClick={handleConfirmAssignment} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Asignar Orden</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-start z-[100] p-0 md:p-6 overflow-y-auto animate-fade-in no-print">
          <div className="bg-white rounded-none md:rounded-[2.5rem] shadow-2xl w-full max-w-4xl my-0 md:my-8 animate-fade-in-up overflow-hidden">
            <div className="bg-white px-8 py-6 border-b flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Vista Previa Detallada</h2>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{viewingQuote.quoteNumber}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${getPaymentStatus(viewingQuote).label === 'Pagado' ? 'text-green-500' : 'text-orange-500'}`}>
                    • {getPaymentStatus(viewingQuote).label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 text-[10px] font-black uppercase tracking-widest">
                    <PrintIcon className="w-4 h-4" />
                    PDF / Imprimir
                  </button>
                 <button onClick={() => setViewingQuote(null)} className="p-3 text-gray-400 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
              </div>
            </div>
            <div className="p-4 md:p-10">
               <QuotePreview quote={viewingQuote} client={clients.find(c => c.id === viewingQuote.clientId)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
