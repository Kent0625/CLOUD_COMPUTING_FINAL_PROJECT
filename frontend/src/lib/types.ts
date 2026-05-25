export interface Product {
  id: number;
  archive_id: string;
  name: string;
  era: string;
  brand: string;
  srp: number;
  price: number;
  size: string;
  color: string;
  status: "available" | "reserved" | "sold";
  images: string[];
  fit_details: string;
  fabric_details: string;
  condition_details: string;
  is_locked?: boolean;
  lock_ttl?: number;
}

export interface AnalyticsSummary {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
}

export interface SalesPoint {
  date: string;
  total_orders: number;
  total_revenue: number;
}

export interface TopProduct {
  name: string;
  sold_count: number;
}

export interface CustomerPoint {
  date: string;
  new_customers: number;
}
