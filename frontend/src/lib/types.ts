export type Role = 'admin' | 'owner' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Stall {
  id: number;
  ownerId: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avgRating: number | null;
  reviewCount: number | null;
  createdAt?: string;
}

export interface StallInput {
  name: string;
  category: string;
  location: string;
  description: string;
}

export interface StallQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

export interface StallPage {
  items: Stall[];
  total: number;
  page: number;
  limit: number;
}
