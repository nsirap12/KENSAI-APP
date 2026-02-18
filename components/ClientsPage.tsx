import React, { useState } from 'react';
import type { Client } from '../types';

interface ClientsPageProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  onAddClient: (clientData: Omit<Client, 'id'>) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, setClients, onAddClient }) => {
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({ name: '', address: '', email: '', phone: '', creditStatus: 'Contado', creditDays: 0 });

  const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: name === 'creditDays' ? Number(value) : value }));
  };

  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name && newClient.email) {
      onAddClient(newClient);
      setNewClient({ name: '', address: '', email: '', phone: '', creditStatus: 'Contado', creditDays: 0 });
      setIsAddingClient(false);
    } else {
      alert("El nombre y el email del cliente son obligatorios.");
    }
  };

  const InputField = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        required={props.type !== 'number'} // creditDays is not required
      />
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
        <button
          onClick={() => setIsAddingClient(!isAddingClient)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
        >
          {isAddingClient ? 'Cancelar' : 'Agregar Nuevo Cliente'}
        </button>
      </div>
      
      {isAddingClient && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Nuevo Cliente</h2>
          <form onSubmit={handleSaveNewClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nombre del Cliente" name="name" value={newClient.name} onChange={handleNewClientChange} />
              <InputField label="Email" name="email" type="email" value={newClient.email} onChange={handleNewClientChange} />
              <InputField label="Teléfono" name="phone" value={newClient.phone} onChange={handleNewClientChange} />
              <InputField label="Dirección" name="address" value={newClient.address} onChange={handleNewClientChange} />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Estado de Crédito</label>
                <select name="creditStatus" value={newClient.creditStatus} onChange={handleNewClientChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Contado">Contado</option>
                    <option value="Credito">Crédito</option>
                </select>
              </div>
              {newClient.creditStatus === 'Credito' && (
                <InputField label="Días de Crédito" name="creditDays" type="number" value={newClient.creditDays} onChange={handleNewClientChange} />
              )}
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition shadow-sm">
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Lista de Clientes</h2>
        <div className="space-y-4">
          {clients.length > 0 ? (
            clients.map(client => (
              <div key={client.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-800">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <p className="text-sm text-gray-600">{client.phone}</p>
                        <p className="text-sm text-gray-500 mt-1">{client.address}</p>
                    </div>
                    <div>
                        {client.creditStatus === 'Credito' ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800">
                                Crédito ({client.creditDays} días)
                            </span>
                        ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                Contado
                            </span>
                        )}
                    </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No hay clientes registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;