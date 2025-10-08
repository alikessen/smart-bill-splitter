export interface MenuItem {
  id: number;        
  key: string;      
  name: string;
  category: string;
  description: string;
  price: number;
}

export interface BillBreakdown {
  subtotal: number;
  tax: number;
  service: number;
  tip: number;
  total: number;
}

export interface GuestBreakdown {
  subtotal: number;
  tax: number;
  service: number;
  tip: number;
  total: number;
}

export type SplitResult = Record<string, GuestBreakdown | number>;

export interface ItemSplitPayload {
  [guestName: string]: {
    items?: string[];                 // list of unique item keys
    shared?: Record<string, number>;  // key: fraction
  };
}

export interface EqualSplitPayload {
  num_guests: number;
}

export interface AmountSplitPayload {
  [guestName: string]: number;
}

export interface OrderPayload {
  items: number[];
}