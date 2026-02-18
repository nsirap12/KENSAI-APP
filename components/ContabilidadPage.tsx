
import React, { useState, useMemo } from 'react';
import type { Quote, Client, ProductionTask, PaymentMethod, ProductionStatus } from '../types';

interface ContabilidadPageProps {
  quotes: Quote[];
  clients: Client[];
  productionTasks: ProductionTask[];
  onUpdateTask: (task: ProductionTask) => void;
  onUpdateQuote: (quote: Quote) => void;
  addNotification: (message: string, taskId?: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

const calculateQuoteTotal = (quote: Quote) => {
    const subtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const taxAmount = (subtotal * quote.taxRate) / 100;
    return subtotal + taxAmount;
};

const ContabilidadPage: React.FC<ContabilidadPageProps> = ({ quotes, clients, productionTasks, onUpdateTask, onUpdateQuote, addNotification }) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [paymentModalQuote, setPaymentModalQuote] = useState<Quote | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia');
  const [withInvoice, setWithInvoice] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<'Anticipo' | 'Finiquito' | 'Credito'>('Anticipo');

  const acceptedQuotes = useMemo(() => quotes.filter(q => q.status === 'Aceptada'), [quotes]);

  const salesData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const filteredQuotes = acceptedQuotes.filter(quote => {
      const quoteDate = new Date(quote.date.replace(/-/g, '/'));
      switch (timeframe) {
        case 'day': return quoteDate >= today;
        case 'week': return quoteDate >= startOfWeek;
        case 'month': return quoteDate >= startOfMonth;
        case 'year': return quoteDate >= startOfYear;
        default: return true;
      }
    });

    return filteredQuotes.reduce((total, quote) => total + calculateQuoteTotal(quote), 0);
  }, [acceptedQuotes, timeframe]);
  
  // 1. Tareas que requieren anticipo (Solo las que NO tienen pagos aún o tienen muy poco)
  const pendingAdvanceTasks = useMemo(() => {
    return productionTasks.filter(t => {
      const quote = quotes.find(q => q.id === t.quoteId || q.quoteNumber === t.quoteNumber);
      if (!quote || quote.paymentCondition !== 'Contado') return false;
      const total = calculateQuoteTotal(quote);
      const paid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0);
      return paid < (total * 0.45); // Si no ha pagado al menos el 45%, sigue pendiente de anticipo
    });
  }, [productionTasks, quotes]);
  
  // 2. Tareas de contado terminadas que requieren finiquito para entregar
  const pendingDeliveryLiquidation = useMemo(() => {
    return productionTasks.filter(t => {
        if (t.delivered) return false;
        const quote = quotes.find(q => q.id === t.quoteId || q.quoteNumber === t.quoteNumber);
        if (!quote || quote.paymentCondition !== 'Contado') return false;
        
        const total = calculateQuoteTotal(quote);
        const paid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0);
        return (total - paid) > 0.05; // Tiene saldo pendiente
    });
  }, [productionTasks, quotes]);

  // 3. Cuentas por cobrar de créditos
  const creditAccountsReceivable = useMemo(() => {
    return acceptedQuotes
        .map(quote => {
            const client = clients.find(c => c.id === quote.clientId);
            if (!client || client.creditStatus !== 'Credito') return null;

            const total = calculateQuoteTotal(quote);
            const paid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0);
            const balance = total - paid;

            if (balance <= 0.05) return null;

            const issueDate = new Date(quote.date.replace(/-/g, '/'));
            const dueDate = new Date(issueDate);
            dueDate.setDate(issueDate.getDate() + (client.creditDays || 0));
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return {
                quoteId: quote.id,
                quoteNumber: quote.quoteNumber,
                clientName: client.name,
                total,
                paid,
                balance,
                dueDate,
                status: (dueDate < today) ? 'Vencido' : 'Por Vencer',
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [acceptedQuotes, clients]);

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';
  
  const openPaymentModal = (quoteId: string, type: 'Anticipo' | 'Finiquito' | 'Credito') => {
      const quote = quotes.find(q => q.id === quoteId);
      if(quote) {
        const total = calculateQuoteTotal(quote);
        const paid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const balance = total - paid;
        
        setPaymentType(type);
        setPaymentAmount(type === 'Anticipo' ? total / 2 : balance);
        setPaymentModalQuote(quote);
        setWithInvoice(false);
      }
  };

  const handleRegisterPayment = () => {
    if (!paymentModalQuote || paymentAmount <= 0) return;

    const newPayment = { id: crypto.randomUUID(), amount: paymentAmount, date: new Date().toISOString(), method: paymentMethod, withInvoice: withInvoice };
    const updatedQuote = { ...paymentModalQuote, payments: [...(paymentModalQuote.payments || []), newPayment] };
    onUpdateQuote(updatedQuote);

    const totalPaid = (updatedQuote.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const totalQuote = calculateQuoteTotal(updatedQuote);
    const isFullyPaid = totalPaid >= totalQuote - 0.05;

    if (paymentType === 'Anticipo') {
        const task = productionTasks.find(t => t.quoteId === paymentModalQuote.id || t.quoteNumber === paymentModalQuote.quoteNumber);
        if (task && totalPaid >= totalQuote / 2) {
            const nextStatus: ProductionStatus = (task.designerId && task.deliveryDate) ? 'DISEÑO_ESPERA' : 'PENDIENTE DE ASIGNACIÓN';
            onUpdateTask({ ...task, status: nextStatus, designAssignmentDate: new Date().toISOString() });
            addNotification(`Anticipo de '${paymentModalQuote.quoteNumber}' recibido. Producción iniciada.`);
        }
    } else if (paymentType === 'Finiquito') {
        if (isFullyPaid) {
            addNotification(`Orden '${paymentModalQuote.quoteNumber}' liquidada al 100%. Lista para entrega física.`);
        } else {
            addNotification(`Abono de finiquito registrado para '${paymentModalQuote.quoteNumber}'. Aún resta ${formatCurrency(totalQuote - totalPaid)}`);
        }
    } else {
        addNotification(`Pago de crédito registrado para '${paymentModalQuote.quoteNumber}'.`);
    }

    setPaymentModalQuote(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Contabilidad</h1>
                <p className="text-gray-500 font-medium">Gestión de anticipos, finiquitos y créditos.</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total {timeframe}</p>
                <p className="text-4xl font-black text-indigo-600">{formatCurrency(salesData)}</p>
            </div>
        </div>

        {/* 1. SECCIÓN DE ANTICIPOS (INICIO) */}
        <section className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
                <h2 className="text-sm font-black text-orange-800 uppercase tracking-widest">Anticipos Pendientes (Liberar Diseño)</h2>
                <span className="bg-orange-600 text-white text-[10px] px-2 py-1 rounded-full font-black">{pendingAdvanceTasks.length}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black uppercase text-gray-400 bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4">Orden</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Anticipo Req. (50%)</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pendingAdvanceTasks.map(task => {
                            const quote = quotes.find(q => q.id === task.quoteId || q.quoteNumber === task.quoteNumber);
                            if (!quote) return null;
                            const total = calculateQuoteTotal(quote);
                            return (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{task.quoteNumber}</td>
                                    <td className="px-6 py-4 text-gray-600">{getClientName(task.clientId)}</td>
                                    <td className="px-6 py-4 text-gray-600">{formatCurrency(total)}</td>
                                    <td className="px-6 py-4 font-black text-orange-600">{formatCurrency(total / 2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openPaymentModal(quote.id, 'Anticipo')} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 shadow-md">Cobrar Anticipo</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {pendingAdvanceTasks.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold uppercase text-[10px]">Sin anticipos pendientes</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        {/* 2. SECCIÓN DE FINIQUITOS (ENTREGA) */}
        <section className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 bg-green-50/50 border-b border-green-100 flex justify-between items-center">
                <h2 className="text-sm font-black text-green-800 uppercase tracking-widest">Liquidaciones para Entrega (Finiquitos)</h2>
                <span className="bg-green-600 text-white text-[10px] px-2 py-1 rounded-full font-black">{pendingDeliveryLiquidation.length}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black uppercase text-gray-400 bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4">Orden</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Ya Pagado</th>
                            <th className="px-6 py-4">Saldo a Liquidar</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pendingDeliveryLiquidation.map(task => {
                            const quote = quotes.find(q => q.id === task.quoteId || q.quoteNumber === task.quoteNumber);
                            if (!quote) return null;
                            const total = calculateQuoteTotal(quote);
                            const paid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0);
                            return (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{task.quoteNumber}</td>
                                    <td className="px-6 py-4 text-gray-600">{getClientName(task.clientId)}</td>
                                    <td className="px-6 py-4 text-gray-600">{formatCurrency(total)}</td>
                                    <td className="px-6 py-4 text-indigo-500 font-bold">{formatCurrency(paid)}</td>
                                    <td className="px-6 py-4 font-black text-red-600">{formatCurrency(total - paid)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openPaymentModal(quote.id, 'Finiquito')} className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-md">Liquidar para Entrega</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {pendingDeliveryLiquidation.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-bold uppercase text-[10px]">Sin trabajos pendientes de finiquito</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>

        {/* 3. CRÉDITOS */}
        <section className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center">
                <h2 className="text-sm font-black text-indigo-800 uppercase tracking-widest">Cartera de Clientes (Créditos)</h2>
                <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full font-black">{creditAccountsReceivable.length}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black uppercase text-gray-400 bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4">Orden</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Saldo Pendiente</th>
                            <th className="px-6 py-4">Vencimiento</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {creditAccountsReceivable.map(item => (
                            <tr key={item.quoteId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{item.quoteNumber}</td>
                                <td className="px-6 py-4 text-gray-600">{item.clientName}</td>
                                <td className="px-6 py-4 font-black text-red-600">{formatCurrency(item.balance)}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${item.status === 'Vencido' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {item.status} ({item.dueDate.toLocaleDateString()})
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openPaymentModal(item.quoteId, 'Credito')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md">Registrar Pago</button>
                                </td>
                            </tr>
                        ))}
                        {creditAccountsReceivable.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold uppercase text-[10px]">Sin créditos pendientes</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
        
        {paymentModalQuote && (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md m-4 animate-fade-in-up space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Registrar {paymentType}</h2>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full ${paymentType === 'Anticipo' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {paymentModalQuote.quoteNumber}
                        </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Cliente</p>
                        <p className="font-bold text-gray-800">{getClientName(paymentModalQuote.clientId)}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Monto del Pago (MXN)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">$</span>
                                <input 
                                    type="number" 
                                    value={paymentAmount} 
                                    onChange={(e) => setPaymentAmount(Number(e.target.value))} 
                                    className="w-full pl-8 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-2xl font-black focus:border-indigo-500 outline-none transition" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Método</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-xs">
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta de Crédito">T. Crédito</option>
                                    <option value="Tarjeta de Débito">T. Débito</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-2xl w-full border border-gray-100">
                                    <input type="checkbox" checked={withInvoice} onChange={e => setWithInvoice(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                                    <span className="text-[10px] font-black uppercase text-gray-600">Requiere Factura</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setPaymentModalQuote(null)} className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition uppercase text-[10px] tracking-widest">Cancelar</button>
                        <button onClick={handleRegisterPayment} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition uppercase tracking-widest text-[10px]">Confirmar Registro</button>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};

export default ContabilidadPage;
