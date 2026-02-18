import React, { useState } from 'react';
import type { Quote, Client, Product } from '../types';
import QuoteForm from './QuoteForm';
import QuotePreview from './QuotePreview';
import PrintIcon from './icons/PrintIcon';
import CheckIcon from './icons/CheckIcon';

interface QuotesPageProps {
  quote: Quote;
  setQuote: React.Dispatch<React.SetStateAction<Quote>>;
  clients: Client[];
  products: Product[];
  onAddClient: (clientData: Omit<Client, 'id'>) => Client;
  onSaveQuote: (quote: Quote) => void;
  onReset: () => void;
  setCurrentPage: (page: 'history' | 'production') => void;
}

const QuotesPage: React.FC<QuotesPageProps> = ({ quote, setQuote, clients, products, onAddClient, onSaveQuote, onReset, setCurrentPage }) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndPromptDownload = () => {
    onSaveQuote(quote);
    setIsSaveModalOpen(true);
  };

  const selectedClient = clients.find(c => c.id === quote.clientId);
  const isInProduction = quote.status === 'Aceptada';

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{quote.id ? 'Editar' : 'Crear'} Cotización</h1>
          <p className="text-sm text-gray-500">Rellena el formulario y previsualiza el resultado al instante.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-wrap justify-center">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm font-medium"
          >
            Nueva Cotización
          </button>
           <button
            onClick={handleSaveAndPromptDownload}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm font-medium"
          >
            Guardar Cotización
          </button>
          {isInProduction && (
             <button
                onClick={() => {
                    onSaveQuote(quote);
                    setCurrentPage('production');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium"
                >
                Guardar y Volver a Producción
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
          >
            <PrintIcon className="w-5 h-5" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="no-print">
          <QuoteForm 
            quote={quote} 
            setQuote={setQuote} 
            clients={clients} 
            products={products}
            onAddClient={onAddClient}
          />
        </div>
        <div className="w-full">
          <h2 className="text-xl font-bold mb-4 text-gray-700 no-print">Previsualización</h2>
          <QuotePreview quote={quote} client={selectedClient} />
        </div>
      </div>

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 no-print animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 text-center animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mt-4">¡Cotización Guardada!</h2>
                <p className="text-gray-600 mt-2 mb-6">La cotización ha sido guardada en tu historial. ¿Deseas descargarla como PDF ahora?</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => {
                            setIsSaveModalOpen(false);
                            setCurrentPage('history');
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={() => {
                            handlePrint();
                            setIsSaveModalOpen(false);
                            setCurrentPage('history');
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors"
                    >
                        Descargar PDF
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;