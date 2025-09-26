export interface MenuItem {
  id: number;        // original menu item ID
  key: string;       // unique instance key, e.g. "2-1"
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

export interface SplitResult {
  [guestName: string]: number;
}

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