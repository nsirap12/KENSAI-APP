
import React, { useState } from 'react';
import type { Collaborator, Role } from '../types';
import TrashIcon from './icons/TrashIcon';

interface CollaboratorsPageProps {
  collaborators: Collaborator[];
  onAddCollaborator: (collaboratorData: Omit<Collaborator, 'id'>) => void;
  onDeleteCollaborator: (collaboratorId: string) => void;
}

const CollaboratorsPage: React.FC<CollaboratorsPageProps> = ({ collaborators, onAddCollaborator, onDeleteCollaborator }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({ name: '', email: '', role: 'Ventas' as Role });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCollaborator({ ...newCollaborator, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollaborator.name && newCollaborator.email) {
      onAddCollaborator(newCollaborator);
      setNewCollaborator({ name: '', email: '', role: 'Ventas' });
      setIsAdding(false);
    } else {
      alert("El nombre y el email son obligatorios.");
    }
  };
  
  const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    const roleClasses = {
      'Administrador': "bg-red-100 text-red-800",
      'Ventas': "bg-green-100 text-green-800",
      'Diseñador': "bg-purple-100 text-purple-800",
      'Productor': "bg-blue-100 text-blue-800",
    };
    return <span className={`${baseClasses} ${roleClasses[role]}`}>{role}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Colaboradores</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
        >
          {isAdding ? 'Cancelar' : 'Agregar Colaborador'}
        </button>
      </div>
      
      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Nuevo Colaborador</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                <input name="name" value={newCollaborator.name} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input name="email" type="email" value={newCollaborator.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Rol</label>
                <select name="role" value={newCollaborator.role} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Ventas">Ventas</option>
                    <option value="Diseñador">Diseñador</option>
                    <option value="Productor">Productor</option>
                    <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition shadow-sm">
                Guardar Colaborador
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-700">Equipo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Rol</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
                {collaborators.map(collab => (
                    <tr key={collab.id} className="bg-white border-b hover:bg-gray-50">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{collab.name}</th>
                        <td className="px-6 py-4">{collab.email}</td>
                        <td className="px-6 py-4"><RoleBadge role={collab.role} /></td>
                        <td className="px-6 py-4 text-right">
                            {collab.role !== 'Administrador' && (
                                <button onClick={() => onDeleteCollaborator(collab.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsPage;
