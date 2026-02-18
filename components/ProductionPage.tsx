
import React, { useState, useRef, useEffect } from 'react';
import type { ProductionTask, Client, Collaborator, Role, ProductionStatus, HandoffFile, LineItem, ChatMessage, Quote } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import PhotoIcon from './icons/PhotoIcon';
import CheckIcon from './icons/CheckIcon';
import ClockIcon from './icons/ClockIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';

interface ProductionPageProps {
  tasks: ProductionTask[];
  quotes: Quote[];
  clients: Client[];
  collaborators: Collaborator[];
  currentUser: Collaborator;
  onUpdateTask: (task: ProductionTask) => void;
  addNotification: (message: string, taskId?: string) => void;
}

const useTimer = (start?: string, end?: string) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (start && !end) {
      const interval = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(interval);
    }
  }, [start, end]);

  if (!start) return '--';
  
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : now;
  let diff = endDate.getTime() - startDate.getTime();

  if (diff < 0) return '0s';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor(diff / 1000);

  let result = [];
  if (days > 0) result.push(`${days}d`);
  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}m`);
  if (seconds > 0 || result.length === 0) result.push(`${seconds}s`);
  
  return result.join(' ');
};

const TimerBlock: React.FC<{ label: string, start?: string, end?: string, active: boolean, color?: string }> = ({ label, start, end, active, color = 'indigo' }) => {
  const time = useTimer(start, end);
  const bgColor = active ? `bg-${color}-600` : 'bg-white';
  const textColor = active ? 'text-white' : 'text-gray-800';
  const labelColor = active ? `text-${color}-200` : 'text-gray-400';

  return (
    <div className={`p-4 rounded-2xl border transition-all ${active ? `${bgColor} border-${color}-700 shadow-xl scale-105` : 'bg-white border-gray-100 text-gray-800'}`}>
      <p className={`text-[9px] font-black uppercase mb-1 tracking-widest ${labelColor}`}>{label}</p>
      <div className="flex items-center justify-between">
        <span className={`text-base font-black tracking-tight ${textColor}`}>{time}</span>
        {active && <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>}
      </div>
      {start && <p className={`text-[8px] mt-2 font-bold opacity-40 italic ${textColor}`}>Iniciado: {new Date(start).toLocaleTimeString()}</p>}
    </div>
  );
};

const ChatSection: React.FC<{ task: ProductionTask, currentUser: Collaborator, collaborators: Collaborator[], onUpdateTask: (task: ProductionTask) => void, addNotification: (msg: string, id?: string) => void }> = ({
    task, currentUser, collaborators, onUpdateTask, addNotification
}) => {
    const [msg, setMsg] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [task.chat]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msg.trim()) return;

        const newMessage: ChatMessage = {
            id: crypto.randomUUID(),
            senderId: currentUser.id,
            message: msg.trim(),
            timestamp: new Date().toISOString()
        };

        const updatedChat = [...(task.chat || []), newMessage];
        onUpdateTask({ ...task, chat: updatedChat });
        
        addNotification(`Nuevo mensaje en ${task.quoteNumber} de ${currentUser.name}: "${msg.substring(0, 30)}..."`, task.id);
        setMsg('');
    };

    const getSenderName = (id: string) => collaborators.find(c => c.id === id)?.name || 'Usuario';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-indigo-500" /> Chat de Coordinación
                </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {(task.chat || []).length === 0 && (
                    <div className="text-center py-10 opacity-30">
                        <ChatBubbleLeftRightIcon className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase">Sin mensajes aún</p>
                    </div>
                )}
                {task.chat?.map((c) => (
                    <div key={c.id} className={`flex flex-col ${c.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                        <span className="text-[9px] font-black text-gray-400 uppercase mb-1 px-1">
                            {getSenderName(c.senderId)} • {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                            c.senderId === currentUser.id 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-700 rounded-tl-none'
                        }`}>
                            {c.message}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2">
                <input 
                    type="text" 
                    value={msg} 
                    onChange={e => setMsg(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    <PaperAirplaneIcon className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

const TaskCard: React.FC<{ task: ProductionTask, quotes: Quote[] } & Omit<ProductionPageProps, 'tasks' | 'quotes'>> = ({
  task,
  quotes,
  clients,
  collaborators,
  currentUser,
  onUpdateTask,
  addNotification,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [handoffComments, setHandoffComments] = useState('');
  const [handoffFile, setHandoffFile] = useState<HandoffFile | null>(null);
  
  const [assigneeId, setAssigneeId] = useState(task.designerId || '');
  const [workshopAssigneeId, setWorkshopAssigneeId] = useState(task.workshop1AssigneeId || '');
  const [deliveryDate, setDeliveryDate] = useState(task.deliveryDate || '');

  const isAdmin = currentUser.role === 'Administrador';
  const isDesigner = currentUser.role === 'Diseñador';
  const isProducer = currentUser.role === 'Productor';

  const designers = collaborators.filter(c => c.role === 'Diseñador' || c.role === 'Administrador');
  const producers = collaborators.filter(c => c.role === 'Productor' || c.role === 'Administrador');

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';
  const getCollaboratorName = (id?: string) => collaborators.find(c => c.id === id)?.name || 'Sin Asignar';

  const getQuoteBalance = () => {
    const quote = quotes.find(q => q.id === task.quoteId || q.quoteNumber === task.quoteNumber);
    if (!quote) return 999999; // Error fallback: assumes not paid if quote not found
    
    const subtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const total = subtotal + (subtotal * quote.taxRate) / 100;
    const paid = (quote.payments || []).reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, total - paid);
  };

  const balance = getQuoteBalance();
  const isFullyPaid = balance <= 0.05;

  const handleUpdateAssignment = () => {
    if (!assigneeId || !deliveryDate) return alert("Selecciona diseñador y fecha de entrega");
    onUpdateTask({
      ...task,
      designerId: assigneeId,
      workshop1AssigneeId: workshopAssigneeId,
      deliveryDate: deliveryDate,
      status: task.status === 'PENDIENTE DE ASIGNACIÓN' ? 'DISEÑO_ESPERA' : task.status,
      designAssignmentDate: task.designAssignmentDate || new Date().toISOString()
    });
    addNotification(`Tarea ${task.quoteNumber} actualizada.`);
  };

  const handleStartDesign = () => {
    onUpdateTask({
      ...task,
      status: 'DISEÑO_PROCESO',
      designStartedWorkingDate: new Date().toISOString()
    });
    addNotification(`Diseño iniciado para ${task.quoteNumber}`);
  };

  const handleFinishInitialDesign = () => {
    if (!handoffFile) return alert("Debes subir el diseño para revisión");
    onUpdateTask({
      ...task,
      status: 'DISEÑO_REVISION',
      designHandoffDate: new Date().toISOString(),
      designReferenceFile: handoffFile,
      designHandoffComments: handoffComments
    });
    setHandoffFile(null);
    setHandoffComments('');
    addNotification(`Diseño enviado a revisión para ${task.quoteNumber}`);
  };

  const handleClientDecision = (approved: boolean) => {
    const now = new Date().toISOString();
    if (approved) {
      onUpdateTask({
        ...task,
        clientApprovalDate: now,
        designEndDate: now,
        status: 'TALLER 1',
        workshop1StartDate: now
      });
      addNotification(`Diseño APROBADO. ${task.quoteNumber} pasa a taller.`);
    } else {
      onUpdateTask({
        ...task,
        status: 'DISEÑO_PROCESO',
        designHandoffDate: undefined,
        revisionCount: (task.revisionCount || 0) + 1
      });
      addNotification(`Cliente solicitó cambios en ${task.quoteNumber}`);
    }
  };

  const handleFinishWorkshop = () => {
    const now = new Date().toISOString();
    onUpdateTask({
      ...task,
      status: 'LISTO PARA ENTREGAR',
      workshop1EndDate: now
    });
    addNotification(`Producción finalizada para ${task.quoteNumber}`);
  };

  const handleMarkAsDelivered = () => {
    if (!isFullyPaid) {
        alert("No se puede marcar como entregado. El cliente tiene un saldo pendiente de " + new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(balance));
        return;
    }
    const now = new Date().toISOString();
    onUpdateTask({
      ...task,
      delivered: true,
      deliveryDateFinal: now,
      deliveredById: currentUser.id
    });
    addNotification(`Orden ${task.quoteNumber} entregada por ${currentUser.name}.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setHandoffFile({ name: file.name, dataUrl: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const statusInfo = {
    'PENDIENTE DE PAGO': { color: 'yellow', label: 'Espera Pago' },
    'PENDIENTE DE ASIGNACIÓN': { color: 'orange', label: 'Por Asignar' },
    'DISEÑO_ESPERA': { color: 'indigo', label: 'Asignado (Espera)' },
    'DISEÑO_PROCESO': { color: 'purple', label: 'Diseñando' },
    'DISEÑO_REVISION': { color: 'pink', label: 'En Revisión Cliente' },
    'TALLER 1': { color: 'blue', label: 'En Producción / Taller' },
    'LISTO PARA ENTREGAR': { color: 'green', label: 'Terminado / Almacén' },
    'TALLER 2': { color: 'teal', label: 'Taller 2' }
  }[task.status];

  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 border-${statusInfo.color}-500 mb-4 overflow-hidden transition-all border border-gray-100`}>
      <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex gap-4 items-center">
          <div className="bg-gray-100 p-2 rounded-lg">
             <ClockIcon className={`w-5 h-5 text-${statusInfo.color}-500`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{task.quoteNumber}</h3>
            <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{getClientName(task.clientId)}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Responsable Actual</p>
            <p className="text-xs font-bold text-gray-700">
                {task.status === 'TALLER 1' ? getCollaboratorName(task.workshop1AssigneeId) : getCollaboratorName(task.designerId)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Estado Fase</p>
            <span className={`text-xs font-black uppercase text-${statusInfo.color}-600`}>{statusInfo.label}</span>
          </div>
          <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-gray-50/30 border-t border-gray-100 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TimerBlock label="1. En Cola" start={task.designAssignmentDate} end={task.designStartedWorkingDate} active={task.status === 'DISEÑO_ESPERA'} />
            <TimerBlock label="2. Diseño" start={task.designStartedWorkingDate} end={task.designHandoffDate} active={task.status === 'DISEÑO_PROCESO'} />
            <TimerBlock label="3. Revisión" start={task.designHandoffDate} end={task.clientApprovalDate} active={task.status === 'DISEÑO_REVISION'} />
            <TimerBlock label="4. Producción" start={task.workshop1StartDate} end={task.workshop1EndDate} active={task.status === 'TALLER 1'} color="blue" />
          </div>

          {isAdmin && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2 tracking-widest">
                <UserGroupIcon className="w-4 h-4"/> Control de Asignaciones
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Diseñador</label>
                  <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-gray-50">
                    <option value="">Seleccionar...</option>
                    {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Productor (Taller)</label>
                  <select value={workshopAssigneeId} onChange={e => setWorkshopAssigneeId(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-gray-50">
                    <option value="">Seleccionar...</option>
                    {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha Entrega</label>
                  <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-gray-50" />
                </div>
                <div className="flex items-end">
                  <button onClick={handleUpdateAssignment} className="w-full bg-gray-800 text-white font-black py-2.5 rounded-xl text-[10px] uppercase hover:bg-black transition-all shadow-md">
                    Actualizar Orden
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Ítems de la Cotización</h4>
                    <div className="space-y-4">
                    {task.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{item.description}</p>
                            {item.detailedDescription && <p className="text-xs text-gray-500 italic mt-1 leading-relaxed">{item.detailedDescription}</p>}
                        </div>
                        <div className="text-right ml-4">
                            <span className="px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600">CANT: {item.quantity}</span>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>

                {task.status === 'DISEÑO_REVISION' && task.designReferenceFile && (
                  <div className="bg-white p-6 rounded-2xl border border-pink-200 shadow-xl animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Propuesta de Diseño Actual</h4>
                        <button onClick={() => window.open(task.designReferenceFile?.dataUrl)} className="text-[10px] font-black text-indigo-600 underline uppercase">Ampliar Imagen</button>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                        <img 
                          src={task.designReferenceFile.dataUrl} 
                          alt="Propuesta" 
                          className="w-full max-h-[500px] object-contain mx-auto"
                        />
                    </div>
                    {task.designHandoffComments && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border-l-4 border-indigo-400">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Comentarios del Diseñador:</p>
                        <p className="text-sm text-gray-700 italic">"{task.designHandoffComments}"</p>
                      </div>
                    )}
                  </div>
                )}

                <ChatSection 
                    task={task} 
                    currentUser={currentUser} 
                    collaborators={collaborators} 
                    onUpdateTask={onUpdateTask} 
                    addNotification={addNotification}
                />
            </div>

            <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full sticky top-4">
                    {task.status === 'DISEÑO_ESPERA' && (isAdmin || (isDesigner && task.designerId === currentUser.id)) && (
                    <div className="text-center space-y-4 py-4">
                        <p className="text-sm text-gray-600 font-bold">Nueva Tarea Asignada</p>
                        <button onClick={handleStartDesign} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg transition-all uppercase tracking-widest text-xs">
                        Iniciar Diseño
                        </button>
                    </div>
                    )}

                    {task.status === 'DISEÑO_PROCESO' && (isAdmin || (isDesigner && task.designerId === currentUser.id)) && (
                    <div className="space-y-4">
                        <h4 className="font-black text-gray-800 uppercase text-[10px] tracking-widest">Entrega de Propuesta</h4>
                        <textarea value={handoffComments} onChange={e => setHandoffComments(e.target.value)} placeholder="Notas para el cliente..." className="w-full p-3 border rounded-xl text-sm h-24 bg-gray-50"></textarea>
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 cursor-pointer hover:bg-indigo-50 transition">
                            <PhotoIcon className="w-5 h-5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{handoffFile ? 'Imagen Lista' : 'Subir Diseño'}</span>
                            <input type="file" onChange={handleFileChange} className="hidden" />
                        </label>
                        <button onClick={handleFinishInitialDesign} className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg">Enviar a Revisión</button>
                    </div>
                    )}

                    {task.status === 'DISEÑO_REVISION' && (isAdmin || currentUser.role === 'Ventas') && (
                    <div className="text-center space-y-4">
                        <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">¿Aprobar este diseño?</p>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleClientDecision(true)} className="w-full py-4 bg-green-600 text-white font-black rounded-xl shadow-lg hover:bg-green-700 uppercase text-xs transition-all transform hover:scale-[1.02]">Aprobar Propuesta</button>
                            <button onClick={() => handleClientDecision(false)} className="w-full py-3 text-red-600 font-bold rounded-xl hover:bg-red-50 uppercase text-[10px]">Solicitar Ajustes</button>
                        </div>
                    </div>
                    )}

                    {task.status === 'TALLER 1' && (isAdmin || (isProducer && task.workshop1AssigneeId === currentUser.id)) && (
                        <div className="text-center space-y-4 py-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                <WrenchScrewdriverIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Fase de Producción</p>
                            </div>
                            <button onClick={handleFinishWorkshop} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg uppercase tracking-widest text-xs">
                                Finalizar Taller
                            </button>
                        </div>
                    )}

                    {task.status === 'LISTO PARA ENTREGAR' && (
                    <div className="text-center py-6 space-y-6">
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                             <p className="text-[10px] font-black text-green-600 uppercase mb-2">Salida de Almacén</p>
                             <p className={`text-xs font-bold ${isFullyPaid ? 'text-gray-600' : 'text-red-500'}`}>
                                {isFullyPaid ? '✅ Totalmente Pagado' : '❌ Saldo Pendiente: ' + new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(balance)}
                             </p>
                        </div>
                        
                        <button 
                            disabled={!isFullyPaid}
                            onClick={handleMarkAsDelivered} 
                            className={`w-full py-4 font-black rounded-xl uppercase tracking-widest text-xs shadow-lg transition-all
                                ${isFullyPaid ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                            `}
                        >
                            Marcar como Entregado
                        </button>
                        
                        {!isFullyPaid && (
                            <p className="text-[9px] text-red-400 font-bold uppercase italic">* Liquide el saldo en Contabilidad para entregar</p>
                        )}
                    </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductionPage: React.FC<ProductionPageProps> = (props) => {
  const { tasks, currentUser, quotes } = props;
  
  const visibleTasks = tasks.filter(task => {
    if (task.delivered) return false;
    if (currentUser.role === 'Administrador') return true;
    if (currentUser.role === 'Diseñador') return task.designerId === currentUser.id;
    if (currentUser.role === 'Productor') return task.workshop1AssigneeId === currentUser.id;
    return false;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-end bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Módulo de Producción</h1>
          <p className="text-gray-500 font-medium">Control total del flujo: Diseño -> Aprobación -> Taller.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Órdenes Activas</p>
          <p className="text-3xl font-black text-indigo-600">{visibleTasks.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {visibleTasks.map(task => <TaskCard key={task.id} task={task} {...props} />)}
        {visibleTasks.length === 0 && (
          <div className="bg-white p-20 text-center rounded-3xl border-2 border-dashed border-gray-200">
             <ClockIcon className="w-16 h-16 mx-auto text-gray-100 mb-4" />
             <p className="text-gray-400 font-bold uppercase tracking-widest">No hay tareas pendientes en tu área</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionPage;
