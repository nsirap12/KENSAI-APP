
import { Quote, Client, Product, Collaborator, ProductionTask, AppNotification } from '../types';

const STORAGE_KEYS = {
  CLIENTS: 'kensai_clients',
  PRODUCTS: 'kensai_products',
  QUOTES: 'kensai_quotes',
  COLLABORATORS: 'kensai_collaborators',
  PRODUCTION_TASKS: 'kensai_tasks',
  NOTIFICATIONS: 'kensai_notifications'
};

export const storageService = {
  saveData: <T>(key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  },

  getData: <T>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      return defaultValue;
    }
  },

  saveAll: (data: {
    clients: Client[],
    products: Product[],
    quotes: Quote[],
    collaborators: Collaborator[],
    productionTasks: ProductionTask[],
    notifications: AppNotification[]
  }) => {
    storageService.saveData(STORAGE_KEYS.CLIENTS, data.clients);
    storageService.saveData(STORAGE_KEYS.PRODUCTS, data.products);
    storageService.saveData(STORAGE_KEYS.QUOTES, data.quotes);
    storageService.saveData(STORAGE_KEYS.COLLABORATORS, data.collaborators);
    storageService.saveData(STORAGE_KEYS.PRODUCTION_TASKS, data.productionTasks);
    storageService.saveData(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  exportDatabase: () => {
    const data = {
      clients: storageService.getData(STORAGE_KEYS.CLIENTS, []),
      products: storageService.getData(STORAGE_KEYS.PRODUCTS, []),
      quotes: storageService.getData(STORAGE_KEYS.QUOTES, []),
      collaborators: storageService.getData(STORAGE_KEYS.COLLABORATORS, []),
      productionTasks: storageService.getData(STORAGE_KEYS.PRODUCTION_TASKS, []),
      notifications: storageService.getData(STORAGE_KEYS.NOTIFICATIONS, []),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kensai_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }
};

export { STORAGE_KEYS };
