
export interface LineItem {
  id: string;
  description: string;
  detailedDescription: string;
  quantity: number;
  price: number;
  productId?: string;
}

export interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
}

export type QuoteStatus = 'Pendiente' | 'Aceptada' | 'Rechazada';
export type PaymentCondition = 'Contado' | 'Credito';
export type PaymentMethod = 'Transferencia' | 'Efectivo' | 'Tarjeta de Crédito' | 'Tarjeta de Débito';

export interface Payment {
    id: string;
    amount: number;
    date: string;
    method: PaymentMethod;
    withInvoice: boolean;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  date: string;
  expires: string;
  clientId: string;
  items: LineItem[];
  company: Company;
  notes: string;
  taxRate: number;
  status: QuoteStatus;
  paymentCondition: PaymentCondition;
  payments: Payment[];
  salespersonId?: string;
  acceptanceDate?: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  creditStatus: 'Contado' | 'Credito';
  creditDays?: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
}

export type Role = 'Administrador' | 'Ventas' | 'Diseñador' | 'Productor';

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type ProductionStatus = 
  | 'PENDIENTE DE PAGO' 
  | 'PENDIENTE DE ASIGNACIÓN' 
  | 'DISEÑO_ESPERA' 
  | 'DISEÑO_PROCESO' 
  | 'DISEÑO_REVISION' 
  | 'TALLER 1' 
  | 'TALLER 2' 
  | 'LISTO PARA ENTREGAR';

export interface HandoffFile {
  name: string;
  dataUrl: string;
}

export interface AssignmentLog {
    assignerId: string;
    timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
}

export interface ProductionTask {
  id: string; 
  quoteId: string;
  quoteNumber: string;
  clientId: string;
  items: LineItem[];
  status: ProductionStatus;
  taxRate: number;
  deliveryDate?: string;
  delivered?: boolean;
  deliveryDateFinal?: string;
  deliveredById?: string;
  designerId?: string;
  designAssignmentDate?: string; 
  designStartedWorkingDate?: string; 
  designHandoffDate?: string; 
  clientApprovalDate?: string; 
  designEndDate?: string; 
  designHandoffComments?: string;
  designReferenceFile?: HandoffFile;
  designAssignmentLog?: AssignmentLog;
  revisionCount?: number;
  workshop1AssigneeId?: string;
  workshop1StartDate?: string;
  workshop1EndDate?: string;
  workshop2AssigneeId?: string;
  workshop2StartDate?: string;
  workshop2EndDate?: string;
  chat?: ChatMessage[];
}

export interface AppNotification {
    id: string;
    message: string;
    read: boolean;
    timestamp: string;
    taskId?: string;
}
