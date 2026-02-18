
import { Quote, Client, Product, Collaborator, ProductionTask } from '../types';

// URL de tu servidor backend. En desarrollo suele ser localhost:8000
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api' 
  : '/api'; 

export const apiService = {
  /**
   * Intenta cargar datos del servidor. Si falla, el App.tsx 
   * debería recurrir a storageService (LocalStorage).
   */
  async fetchAll() {
    try {
        const response = await fetch(`${API_BASE_URL}/init`);
        if (!response.ok) throw new Error('Servidor no responde');
        return await response.json();
    } catch (error) {
        console.warn("Usando base de datos local (Offline Mode)");
        throw error;
    }
  },

  async saveQuote(quote: Quote) {
    try {
        const method = quote.id ? 'PUT' : 'POST';
        const url = quote.id ? `${API_BASE_URL}/quotes/${quote.id}` : `${API_BASE_URL}/quotes`;
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quote)
        });
        if (!response.ok) throw new Error('Error al guardar cotización');
        return await response.json();
    } catch (error) {
        console.error("Error en API, guardando solo localmente");
        return { status: 'local_only' };
    }
  },

  async saveTask(task: ProductionTask) {
    const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return await response.json();
  },

  async addClient(client: Omit<Client, 'id'>) {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    if (!response.ok) throw new Error('Error al crear cliente en servidor');
    return await response.json();
  }
};
