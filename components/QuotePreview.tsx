
import React from 'react';
import type { Quote, Client } from '../types';

interface QuotePreviewProps {
  quote: Quote;
  client: Client | undefined;
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ quote, client }) => {
  const subtotal = quote.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = (subtotal * quote.taxRate) / 100;
  const total = subtotal + taxAmount;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString.replace(/-/g, '/'));
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 print-area print:shadow-none print:p-0">
      <header className="flex justify-between items-start pb-6 border-b-2 border-gray-100">
        <div className="flex-1">
          {quote.company.logo ? (
            <img src={quote.company.logo} alt="Logo" className="h-16 max-w-[200px] object-contain mb-4" />
          ) : (
            <h1 className="text-2xl font-bold text-gray-800 uppercase">{quote.company.name}</h1>
          )}
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>{quote.company.address}</p>
            <p>Tel: {quote.company.phone}</p>
            <p>{quote.company.email}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black text-blue-600 uppercase tracking-tighter">Cotización</h2>
          <div className="mt-2 text-sm">
            <p className="font-bold text-gray-800">Nº {quote.quoteNumber}</p>
            <p className="text-gray-500">Fecha: {formatDate(quote.date)}</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-8 my-10">
        <div>
          <h3 className="text-[10px] font-black uppercase text-blue-600 mb-2 border-b border-blue-100 pb-1">Datos del Cliente</h3>
          {client ? (
            <div className="space-y-0.5">
              <p className="font-bold text-gray-800 text-base">{client.name}</p>
              <p className="text-sm text-gray-600">{client.address}</p>
              <p className="text-sm text-gray-600">{client.email}</p>
              <p className="text-sm text-gray-600">{client.phone}</p>
            </div>
          ) : (
             <p className="text-sm text-gray-400 italic">No se ha seleccionado un cliente</p>
          )}
        </div>
        <div className="text-right flex flex-col justify-end gap-3">
           <div className="inline-block bg-gray-50 p-3 rounded-lg border border-gray-100">
              <h3 className="text-[10px] font-black uppercase text-gray-400 mb-1">Vencimiento</h3>
              <p className="font-bold text-gray-800">{formatDate(quote.expires)}</p>
           </div>
           <div className="inline-block bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="text-[10px] font-black uppercase text-blue-400 mb-1">Condición de Pago</h3>
              <p className="font-black text-blue-700 uppercase">{quote.paymentCondition}</p>
           </div>
        </div>
      </section>

      <section className="mb-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white print:bg-blue-600 print:text-white">
              <th className="p-3 text-[11px] font-bold uppercase rounded-l-lg">Descripción del Servicio / Producto</th>
              <th className="p-3 text-[11px] font-bold uppercase text-center w-20">Cant.</th>
              <th className="p-3 text-[11px] font-bold uppercase text-right w-28">P. Unitario</th>
              <th className="p-3 text-[11px] font-bold uppercase text-right w-28 rounded-r-lg">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quote.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 align-top">
                  <p className="font-bold text-gray-800 text-sm">{item.description}</p>
                  {item.detailedDescription && (
                    <p className="text-[11px] text-gray-500 mt-1 whitespace-pre-wrap leading-relaxed">
                      {item.detailedDescription}
                    </p>
                  )}
                </td>
                <td className="p-3 text-gray-700 text-center align-top text-sm">{item.quantity}</td>
                <td className="p-3 text-gray-700 text-right align-top text-sm">{formatCurrency(item.price)}</td>
                <td className="p-3 font-bold text-gray-800 text-right align-top text-sm">{formatCurrency(item.quantity * item.price)}</td>
              </tr>
            ))}
             {quote.items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400 italic">Sin conceptos agregados</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="flex justify-end pt-4">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="text-gray-800 font-bold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">IVA ({quote.taxRate}%)</span>
            <span className="text-gray-800 font-bold">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-t-2 border-blue-600 mt-2">
            <span className="text-base font-black text-gray-900 uppercase">Total Final</span>
            <span className="text-xl font-black text-blue-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </section>

      {quote.notes && (
        <section className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-100 print:bg-transparent print:border-none print:p-0">
          <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2">Observaciones y Condiciones</h3>
          <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed italic">{quote.notes}</p>
        </section>
      )}

      <footer className="mt-20 pt-8 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
          Documento generado electrónicamente por {quote.company.name}
        </p>
      </footer>
    </div>
  );
};

export default QuotePreview;
