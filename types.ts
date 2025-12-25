export interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  confidence: number; // 0 to 1
}

export interface CartItem extends ProductItem {
  quantity: number;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
}

export interface DetectionResponse {
  itemFound: boolean;
  name?: string;
  price?: number;
  category?: string;
  reason?: string;
}