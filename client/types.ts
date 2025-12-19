
export enum Role {
  GUEST = 'GUEST',
  RESIDENT = 'RESIDENT',
  ADMIN = 'ADMIN'
}

export enum ApartmentStatus {
  EMPTY = 'EMPTY',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum ApartmentType {
  NORMAL = 'NORMAL',
  PENTHOUSE = 'PENTHOUSE',
  KIOT = 'KIOT',
  OFFICE = 'OFFICE'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatar?: string;
  householdId?: string; // Link to a household if resident
}

export interface Household {
  id: string;
  roomNumber: string; // e.g., "1204"
  ownerName: string;
  area: number; // m2
  memberCount: number;
  phoneNumber: string;
  email?: string;
  building?: string;
  floor?: number;
  status?: ApartmentStatus;
  type?: ApartmentType;
}

export interface ResidentMember {
  id: string;
  householdId: string;
  fullName: string;
  dateOfBirth: string;
  relationToOwner: string; // e.g., "Chủ hộ", "Vợ/Chồng", "Con"
  cccd?: string; // Identity card
  residentCode?: string; // For registration verification
  phoneNumber?: string; // For registration verification
  email?: string;
  status?: string; // e.g. "THUONG_TRU", "TAM_TRU"
}

// New interface for the flat resident list response
export interface ResidentInfo {
  id: number | string;
  residentCode?: string; // Added resident code
  name: string;
  dob: string | null;
  phoneNumber: string | null;
  relationship: string;
  isHost: boolean;
  status: string | null;
  cccd: string | null;
  roomNumber: string;
  building: string | null;
}

// Generic Page interface for Spring Boot pagination
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page index (0-based)
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Represents a bill/invoice assigned to a household
export interface Fee {
  id: string;
  name: string; // e.g., "Phí dịch vụ T10", "Tiền điện"
  amount: number;
  deadline: string;
  status: 'PENDING' | 'PAID';
  householdId: string;
  month: string; // "10/2025"
}

// Represents the definition/category of a fee (Admin manages this)
export interface FeeDefinition {
  id: number;
  name: string;        // Mapped from 'feename'
  description: string;
  unitPrice: number;   // Mapped from 'unitprice'
  unit: string;        // e.g., 'm2', 'household', 'person'
  billingCycle: string;// Mapped from 'billingcycle' (e.g., 'monthly')
  isMandatory: boolean;// Mapped from '_mandatory'
}

export interface Transaction {
  id: string;
  feeId: string;
  feeName: string;
  amount: number;
  date: string;
  method: 'VNPAY' | 'MOMO' | 'BANKING';
  status: 'SUCCESS' | 'FAILED';
}

export interface RequestChange {
  key: string;
  label: string;
  oldValue: string | number;
  newValue: string | number;
}

export interface RequestTicket {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  householdId: string;
  createdAt: string;
  changes?: RequestChange[];
  rejectReason?: string;
}

export interface StatData {
  month: string;
  revenue: number;
  debt: number;
}
