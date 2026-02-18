
import React, { useState, useEffect, useCallback } from 'react';
import type { Quote, Client, Product, Collaborator, ProductionTask, AppNotification, QuoteStatus } from './types';
import { apiService } from './services/apiService';
import { storageService, STORAGE_KEYS } from './services/storageService';
import HomePage from './components/HomePage';
import QuotesPage from './components/QuotesPage';
import ClientsPage from './components/ClientsPage';
import HistoryPage from './components/HistoryPage';
import ProductsPage from './components/ProductsPage';
import ProductionPage from './components/ProductionPage';
import CollaboratorsPage from './components/CollaboratorsPage';
import ContabilidadPage from './components/ContabilidadPage';
import NotificationPanel from './components/NotificationPanel';

import DocumentTextIcon from './components/icons/DocumentTextIcon';
import WrenchScrewdriverIcon from './components/icons/WrenchScrewdriverIcon';
import PhotoIcon from './components/icons/PhotoIcon';
import BanknotesIcon from './components/icons/BanknotesIcon';
import UsersIcon from './components/icons/UsersIcon';
import TagIcon from './components/icons/TagIcon';
import UserGroupIcon from './components/icons/UserGroupIcon';
import Bars3Icon from './components/icons/Bars3Icon'; 
import XMarkIcon from './components/icons/XMarkIcon';
import ArchiveBoxIcon from './components/icons/ArchiveBoxIcon';
import TrashIcon from './components/icons/TrashIcon';
import BellIcon from './components/icons/BellIcon';

type Page = 'home' | 'quotes' | 'clients' | 'history' | 'products' | 'production' | 'collaborators' | 'contabilidad';

const initialQuote: Omit<Quote, 'id' | 'quoteNumber' | 'items' | 'clientId' | 'status' | 'payments' | 'paymentCondition'> = {
  date: new Date().toISOString().split('T')[0],
  expires: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  company: {
    name: 'KENSAI CORP',
    address: 'Base de Datos Centralizada MySQL',
    phone: '',
    email: '',
    logo: ''
  },
  notes: 'Términos y condiciones estándar.',
  taxRate: 16,
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser] = useState<Collaborator>({ id: 'sys-1', name: 'Administrador SQL', email: 'admin@kensai.com', role: 'Administrador' }); 
  const [isSaving, setIsSaving] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [productionTasks, setProductionTasks] = useState<ProductionTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // CARGA HÍBRIDA (SERVER -> LOCAL)
  useEffect(() => {
    const initData = async () => {
        try {
            // Intento 1: Servidor Real
            const serverData = await apiService.fetchAll();
            if (serverData) {
                setClients(serverData.clients || []);
                setQuotes(serverData.quotes || []);
                setProductionTasks(serverData.tasks || []);
                setProducts(serverData.products || []);
                setCollaborators(serverData.collaborators || []);
                setDbConnected(true);
                return;
            }
        } catch (e) {
            console.warn("Servidor no disponible, cargando de LocalStorage");
        }

        // Intento 2: LocalStorage (Offline Mode)
        const savedClients = storageService.getData(STORAGE_KEYS.CLIENTS, []);
        const savedQuotes = storageService.getData(STORAGE_KEYS.QUOTES, []);
        const savedTasks = storageService.getData(STORAGE_KEYS.PRODUCTION_TASKS, []);
        const savedProducts = storageService.getData(STORAGE_KEYS.PRODUCTS, []);
        const savedCollabs = storageService.getData(STORAGE_KEYS.COLLABORATORS, []);
        const savedNotifs = storageService.getData(STORAGE_KEYS.NOTIFICATIONS, []);
        setNotifications(savedNotifs);

        if (savedClients.length > 0 || savedQuotes.length > 0) {
            setClients(savedClients);
            setQuotes(savedQuotes);
            setProductionTasks(savedTasks);
            setProducts(savedProducts);
            setCollaborators(savedCollabs);
        }
        setDbConnected(false); // Indica que estamos en modo local
    };
    initData();
  }, []);

  // Persistencia automática local
  useEffect(() => {
    storageService.saveAll({
        clients,
        products,
        quotes,
        collaborators,
        productionTasks,
        notifications
    });
  }, [clients, products, quotes, collaborators, productionTasks, notifications]);

  const addNotification = useCallback((message: string, taskId?: string, customId?: string) => {
    const newNotification: AppNotification = {
        id: customId || crypto.randomUUID(),
        message,
        read: false,
        timestamp: new Date().toISOString(),
        taskId,
    };
    setNotifications(prev => {
        if (customId && prev.some(n => n.id === customId)) return prev;
        return [newNotification, ...prev].slice(0, 50); 
    });
  }, []);

  // GENERADOR DE ALERTAS AUTOMÁTICAS (Vencimientos)
  useEffect(() => {
    const checkDeadlines = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        productionTasks.forEach(task => {
            if (task.deliveryDate && !task.delivered) {
                const dueDate = new Date(task.deliveryDate.replace(/-/g, '/'));
                if (dueDate <= tomorrow) {
                    const notifId = `alert-due-task-${task.id}-${now.toDateString()}`;
                    addNotification(
                        `URGENTE: Entrega de ${task.quoteNumber} vence pronto.`,
                        task.id,
                        notifId
                    );
                }
            }
        });
    };

    const timer = setTimeout(checkDeadlines, 3000); 
    return () => clearTimeout(timer);
  }, [productionTasks, addNotification]);

  const handleClearAllData = () => {
    if (window.confirm("¿ESTÁS SEGURO? Esto borrará tus datos locales. Los datos en el servidor MySQL permanecerán intactos.")) {
      storageService.clearAll();
      window.location.reload();
    }
  };

  const [currentQuote, setCurrentQuote] = useState<Quote>(() => {
     const nextQuoteNumber = `COT-${new Date().getFullYear()}-001`;
     return {...initialQuote, id: '', quoteNumber: nextQuoteNumber, items: [], clientId: '', status: 'Pendiente', payments: [], paymentCondition: 'Contado' };
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleSaveQuote = async (quote: Quote) => {
    setIsSaving(true);
    try {
        if (quote.id) {
            setQuotes(prev => prev.map(q => q.id === quote.id ? quote : q));
        } else {
            const newQuote = { ...quote, id: crypto.randomUUID(), salespersonId: currentUser.id };
            setQuotes(prev => [...prev, newQuote]);
            addNotification(`Nueva cotización ${newQuote.quoteNumber} generada.`);
        }
        // Intentamos guardar en el servidor
        await apiService.saveQuote(quote);
    } finally {
        setTimeout(() => setIsSaving(false), 800);
    }
  };

  const handleUpdateQuoteStatus = (quoteId: string, status: QuoteStatus, assignmentData?: any) => {
    setQuotes(prev => prev.map(q => {
        if (q.id === quoteId) {
            const updated = { ...q, status, acceptanceDate: status === 'Aceptada' ? new Date().toISOString() : undefined };
            if (status === 'Aceptada') {
                const newTask: ProductionTask = {
                    id: quoteId,
                    quoteId: quoteId,
                    quoteNumber: q.quoteNumber,
                    clientId: q.clientId,
                    items: q.items,
                    status: 'PENDIENTE DE PAGO',
                    taxRate: q.taxRate,
                    designerId: assignmentData?.designerId,
                    deliveryDate: assignmentData?.deliveryDate,
                };
                setProductionTasks(current => [...current, newTask]);
                addNotification(`¡Cotización ${q.quoteNumber} ACEPTADA!`);
            }
            return updated;
        }
        return q;
    }));
  };

  const handleUpdateTask = async (updatedTask: ProductionTask) => {
    setProductionTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    await apiService.saveTask(updatedTask);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const renderPage = () => {
    switch (currentPage) {
      case 'quotes':
        return <QuotesPage quote={currentQuote} setQuote={setCurrentQuote} clients={clients} products={products} onAddClient={(c) => {const nc = {...c, id: crypto.randomUUID()}; setClients([...clients, nc as Client]); return nc as Client;}} onSaveQuote={handleSaveQuote} onReset={() => {}} setCurrentPage={setCurrentPage as any} />;
      case 'production':
          return <ProductionPage tasks={productionTasks} quotes={quotes} clients={clients} collaborators={collaborators} currentUser={currentUser} onUpdateTask={handleUpdateTask} addNotification={addNotification} />;
      case 'contabilidad':
          return <ContabilidadPage quotes={quotes} clients={clients} productionTasks={productionTasks} onUpdateTask={handleUpdateTask} onUpdateQuote={handleSaveQuote} addNotification={addNotification} />
      case 'clients':
          return <ClientsPage clients={clients} setClients={setClients} onAddClient={(c) => setClients([...clients, {...c, id: crypto.randomUUID()}])} />
      case 'products':
          return <ProductsPage products={products} onAddProduct={(p) => setProducts([...products, {...p, id: crypto.randomUUID()}])} />
      case 'collaborators':
          return <CollaboratorsPage collaborators={collaborators} onAddCollaborator={(c) => setCollaborators([...collaborators, {...c, id: crypto.randomUUID()}])} onDeleteCollaborator={(id) => setCollaborators(collaborators.filter(c => c.id !== id))} />
      case 'history':
          return <HistoryPage quotes={quotes} clients={clients} collaborators={collaborators} tasks={productionTasks} onUpdateStatus={handleUpdateQuoteStatus} onDelete={() => {}} onEdit={() => {}} />;
      case 'home':
      default:
        return <HomePage setCurrentPage={setCurrentPage as any} currentUser={currentUser} tasks={productionTasks} quotes={quotes} clients={clients} collaborators={collaborators} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden font-inter">
      {/* HEADER MÓVIL */}
      <div className="lg:hidden bg-white p-4 border-b flex justify-between items-center z-[80]">
        <h1 className="text-xl font-black tracking-tighter uppercase">KENSAI <span className="text-blue-600">SQL</span></h1>
        <div className="flex items-center gap-4">
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2 bg-gray-50 rounded-xl">
                <BellIcon className="w-6 h-6 text-gray-600" />
                {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                        {unreadNotificationsCount}
                    </span>
                )}
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-50 rounded-xl">
            {isSidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
        </div>
      </div>

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-[70] flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl'}`}>
        <div className="h-24 flex items-center px-8 border-b border-gray-50">
            <h1 className="text-2xl font-black tracking-tighter uppercase">KENSAI <span className="text-blue-600">SQL</span></h1>
        </div>
        
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">Menú Principal</p>
            <button onClick={() => {setCurrentPage('home'); setIsSidebarOpen(false);}} className={`w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all duration-200 ${currentPage === 'home' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}>
                <PhotoIcon className="w-5 h-5 mr-3" /> Inicio
            </button>
            <button onClick={() => {setCurrentPage('quotes'); setIsSidebarOpen(false);}} className={`w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all duration-200 ${currentPage === 'quotes' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}>
                <DocumentTextIcon className="w-5 h-5 mr-3" /> Cotizar
            </button>
            <button onClick={() => {setCurrentPage('production'); setIsSidebarOpen(false);}} className={`w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all duration-200 ${currentPage === 'production' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}>
                <WrenchScrewdriverIcon className="w-5 h-5 mr-3" /> Producción
            </button>
            <button onClick={() => {setCurrentPage('contabilidad'); setIsSidebarOpen(false);}} className={`w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all duration-200 ${currentPage === 'contabilidad' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}>
                <BanknotesIcon className="w-5 h-5 mr-3" /> Contabilidad
            </button>
            <button onClick={() => {setCurrentPage('history'); setIsSidebarOpen(false);}} className={`w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all duration-200 ${currentPage === 'history' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}>
                <ArchiveBoxIcon className="w-5 h-5 mr-3" /> Historial
            </button>

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 mt-8 ml-2">Catálogos</p>
            <button onClick={() => {setCurrentPage('clients'); setIsSidebarOpen(false);}} className={`w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all ${currentPage === 'clients' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}>
                <UsersIcon className="w-5 h-5 mr-3" /> Clientes
            </button>
            <button onClick={() => {setCurrentPage('products'); setIsSidebarOpen(false);}} className={`w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all ${currentPage === 'products' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}>
                <TagIcon className="w-5 h-5 mr-3" /> Productos
            </button>
            <button onClick={() => {setCurrentPage('collaborators'); setIsSidebarOpen(false);}} className={`w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all ${currentPage === 'collaborators' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}>
                <UserGroupIcon className="w-5 h-5 mr-3" /> Equipo
            </button>

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 mt-8 ml-2">Sistema</p>
            <button onClick={handleClearAllData} className="w-full flex items-center p-3.5 text-[11px] font-black uppercase rounded-2xl transition-all text-red-400 hover:bg-red-50 hover:text-red-600">
                <TrashIcon className="w-5 h-5 mr-3" /> Borrar Caché Local
            </button>
        </nav>

        <div className="p-8 border-t border-gray-50 space-y-4">
            <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${dbConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-orange-500'}`} />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">Status Server</span>
                    <span className="text-[10px] font-bold text-gray-800">{dbConnected ? 'Online (SQL)' : 'Offline (Local)'}</span>
                </div>
            </div>
            {isSaving && (
                <div className="flex items-center gap-2 py-2 px-3 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[9px] font-black uppercase text-indigo-600 tracking-tighter">Guardando...</span>
                </div>
            )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar relative">
        {/* BELL ICON TOP RIGHT DESKTOP */}
        <div className="hidden lg:flex absolute top-10 right-10 z-[60] items-center gap-4">
            <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                className={`relative p-3.5 rounded-2xl transition-all duration-300 shadow-sm ${isNotificationOpen ? 'bg-indigo-600 text-white shadow-indigo-200 scale-110' : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-100'}`}
            >
                <BellIcon className="w-6 h-6" />
                {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadNotificationsCount}
                    </span>
                )}
            </button>
            {isNotificationOpen && (
                <NotificationPanel 
                    notifications={notifications} 
                    onMarkAsRead={handleMarkAsRead} 
                    onClearAll={handleClearNotifications}
                    onClose={() => setIsNotificationOpen(false)}
                />
            )}
        </div>

        <div className="max-w-7xl mx-auto animate-fade-in-up">
            {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
