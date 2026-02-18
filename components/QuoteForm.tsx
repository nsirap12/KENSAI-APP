
import React, { useState, useEffect, useRef } from 'react';
import type { Quote, LineItem, Client, Product, PaymentCondition } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import SparklesIcon from './icons/SparklesIcon';
import { suggestDescriptions } from '../services/geminiService';

interface QuoteFormProps {
  quote: Quote;
  setQuote: React.Dispatch<React.SetStateAction<Quote>>;
  clients: Client[];
  products: Product[];
  onAddClient: (clientData: Omit<Client, 'id'>) => void;
}

const ManagedInput = ({ 
  label, 
  value, 
  onCommit, 
  onChange,
  type = "text",
  placeholder = "",
  rows = 1,
  className = ""
}: { 
  label: string; 
  value: string | number; 
  onCommit: (val: string) => void; 
  onChange?: (val: string) => void;
  type?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}) => {
  const [localValue, setLocalValue] = useState(String(value));

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const isTextArea = type === "textarea";

  return (
    <div className={className}>
      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{label}</label>
      {isTextArea ? (
        <textarea
          value={localValue}
          placeholder={placeholder}
          rows={rows}
          onChange={(e) => {
            setLocalValue(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          onBlur={() => onCommit(localValue)}
          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition custom-scrollbar"
        />
      ) : (
        <input
          type={type}
          value={localValue}
          placeholder={placeholder}
          onChange={(e) => {
            setLocalValue(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          onBlur={() => onCommit(localValue)}
          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition"
        />
      )}
    </div>
  );
};

const QuoteForm: React.FC<QuoteFormProps> = ({ quote, setQuote, clients, products, onAddClient }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({ name: '', address: '', email: '', phone: '', creditStatus: 'Contado', creditDays: 0 });
  
  // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid environment-specific type issues
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateCompanyField = (field: string, value: string) => {
    setQuote(prev => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };

  const updateQuoteField = (field: string, value: any) => {
    setQuote(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setQuote(prev => ({ 
      ...prev, 
      clientId, 
      paymentCondition: client ? client.creditStatus : prev.paymentCondition 
    }));
  };

  const updateItemField = (index: number, field: keyof LineItem, value: any) => {
    setQuote(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Lógica de IA al escribir
  const handleDescriptionChange = (index: number, val: string) => {
    // Primero actualizamos el estado principal para que el item tenga el valor actual
    updateItemField(index, 'description', val);

    // Cancelamos cualquier timer previo (debounce)
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Si el texto es muy corto, limpiamos sugerencias
    if (val.trim().length < 3) {
      setSuggestions([]);
      setActiveSuggestionIndex(null);
      return;
    }

    // Iniciamos el timer para llamar a la IA
    debounceTimer.current = setTimeout(async () => {
      setActiveSuggestionIndex(index);
      setSuggestionLoading(true);
      try {
        const results = await suggestDescriptions(val);
        setSuggestions(results);
      } catch (e) {
        console.error("Fallo al obtener sugerencias", e);
      } finally {
        setSuggestionLoading(false);
      }
    }, 800); 
  };

  const addItem = () => {
    setQuote(prev => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), description: '', detailedDescription: '', quantity: 1, price: 0 }],
    }));
  };

  const addProductAsItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setQuote(prev => ({
        ...prev,
        items: [...prev.items, { 
          id: crypto.randomUUID(), 
          description: product.name, 
          detailedDescription: product.description, 
          quantity: 1, 
          price: product.price,
          productId: product.id 
        }],
      }));
    }
  };

  const removeItem = (index: number) => {
    setQuote(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          updateCompanyField('logo', event.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter border-b border-gray-50 pb-4">Emisor</h2>
          <ManagedInput label="Empresa" value={quote.company.name} onCommit={(v) => updateCompanyField('name', v)} />
          <ManagedInput label="Dirección Legal" value={quote.company.address} onCommit={(v) => updateCompanyField('address', v)} />
          <div className="grid grid-cols-2 gap-4">
            <ManagedInput label="Teléfono" value={quote.company.phone} onCommit={(v) => updateCompanyField('phone', v)} />
            <ManagedInput label="Email Corporativo" value={quote.company.email} type="email" onCommit={(v) => updateCompanyField('email', v)} />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Logo de Empresa</label>
            <label className="flex items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 cursor-pointer hover:border-indigo-300 transition-all group">
                <div className="text-center">
                    <PlusIcon className="w-6 h-6 mx-auto text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[10px] font-bold text-gray-400 mt-2 block uppercase">Subir Archivo</span>
                </div>
                <input type="file" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter border-b border-gray-50 pb-4">Receptor</h2>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Seleccionar Cliente</label>
            <div className="flex gap-2">
              <select
                value={quote.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="" disabled>-- Lista de Clientes SQL --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={() => setIsAddingClient(!isAddingClient)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition shadow-sm">
                <PlusIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <ManagedInput label="Condiciones de Pago" type="text" value={quote.paymentCondition} onCommit={(v) => updateQuoteField('paymentCondition', v)} />

          {isAddingClient && (
            <div className="p-8 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 space-y-4 animate-fade-in-up">
              <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Nuevo Registro</h4>
              <input placeholder="Nombre Completo" className="w-full p-3 bg-white/10 border-none rounded-xl text-white placeholder:text-indigo-300 outline-none" onChange={e => setNewClient({...newClient, name: e.target.value})} />
              <input placeholder="Email" className="w-full p-3 bg-white/10 border-none rounded-xl text-white placeholder:text-indigo-300 outline-none" onChange={e => setNewClient({...newClient, email: e.target.value})} />
              <button onClick={() => { onAddClient(newClient); setIsAddingClient(false); }} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Guardar en DB</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
        <ManagedInput label="Nº Folio" value={quote.quoteNumber} onCommit={(v) => updateQuoteField('quoteNumber', v)} />
        <ManagedInput label="Fecha Emisión" type="date" value={quote.date} onCommit={(v) => updateQuoteField('date', v)} />
        <ManagedInput label="Vencimiento" type="date" value={quote.expires} onCommit={(v) => updateQuoteField('expires', v)} />
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-50 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Partidas</h2>
          <div className="flex gap-4">
            <select onChange={(e) => addProductAsItem(e.target.value)} value="" className="p-3 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none">
              <option value="" disabled>Catálogo SQL</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={addItem} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
              <PlusIcon className="w-4 h-4" /> Item Manual
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {quote.items.map((item, index) => (
            <div key={item.id} className="p-8 bg-gray-50/50 border border-gray-50 rounded-[2rem] space-y-6 relative group transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100">
              <div className="grid grid-cols-12 gap-6 items-end">
                <div className="col-span-12 md:col-span-6 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Descripción del Ítem</label>
                    {suggestionLoading && activeSuggestionIndex === index && (
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      onBlur={() => updateItemField(index, 'description', item.description)}
                      placeholder="Escribe para recibir sugerencias de la IA..."
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400">
                        <SparklesIcon className={`w-5 h-5 ${suggestionLoading && activeSuggestionIndex === index ? 'animate-pulse' : ''}`} />
                    </div>
                  </div>

                  {/* PANEL DE SUGERENCIAS IA */}
                  {activeSuggestionIndex === index && suggestions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-3 p-3 bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-3xl shadow-2xl animate-fade-in-up">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                        <SparklesIcon className="w-3 h-3" /> IA Sugiere:
                      </p>
                      <div className="space-y-1.5">
                        {suggestions.map((s, i) => (
                          <button 
                            key={i} 
                            onClick={() => { 
                              updateItemField(index, 'description', s); 
                              setSuggestions([]); 
                              setActiveSuggestionIndex(null);
                            }} 
                            className="w-full text-left px-4 py-3 rounded-2xl text-[11px] font-bold text-gray-700 hover:bg-indigo-600 hover:text-white transition-all duration-200"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-span-6 md:col-span-2">
                  <ManagedInput label="Cantidad" type="number" value={item.quantity} onCommit={(v) => updateItemField(index, 'quantity', Number(v))} />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <ManagedInput label="Precio Unitario" type="number" value={item.price} onCommit={(v) => updateItemField(index, 'price', Number(v))} />
                </div>
                <div className="col-span-12 md:col-span-1 flex justify-end">
                  <button onClick={() => removeItem(index)} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition shadow-sm"><TrashIcon className="w-5 h-5" /></button>
                </div>
              </div>
              <ManagedInput 
                label="Especificaciones Adicionales" 
                type="textarea"
                value={item.detailedDescription} 
                onCommit={(v) => updateItemField(index, 'detailedDescription', v)} 
                rows={1}
                placeholder="Detalles técnicos, medidas, acabados..."
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-12">
        <ManagedInput 
          label="Términos y Condiciones / Notas" 
          type="textarea"
          value={quote.notes} 
          onCommit={(v) => updateQuoteField('notes', v)} 
          rows={5}
        />
        <div className="flex flex-col justify-end space-y-6">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cálculo de Impuestos</p>
                    <p className="text-xl font-black text-gray-900">IVA Aplicable</p>
                </div>
                <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        value={quote.taxRate} 
                        onChange={(e) => updateQuoteField('taxRate', Number(e.target.value))} 
                        className="w-20 p-3 bg-white border-none rounded-xl text-center font-black text-indigo-600 shadow-sm outline-none" 
                    />
                    <span className="font-black text-gray-400">%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteForm;
