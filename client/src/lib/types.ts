
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

export interface ResidentInfo {
  id: number | string;
  residentCode?: string;
  name: string;
  dob: string | null;
  phoneNumber: string | null;
  email: string | null;
  relationship: string;
  isHost: boolean;
  status: string | null;
  cccd: string | null;
  roomNumber: string;
  building: string | null;
  hasAccount: boolean;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Invoice related types
export interface InvoiceDetail {
  id: number;
  feeName: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  amount: number;
}

export interface Invoice {
  id: number;
  title: string;
  roomNumber: string;
  month: number;
  year: number;
  dueDate: string;
  totalAmount: number;
  status: 'paid' | 'unpaid';
  details?: InvoiceDetail[] | null;
}

export interface FeeDefinition {
  id: number;
  name: string;
  description: string;
  unitPrice: number;
  unit: string;
  billingCycle: string;
  isMandatory: boolean;
}

// Added missing Fee interface
export interface Fee {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  status: 'PENDING' | 'PAID';
  householdId: string;
  month: string;
}

// Added missing RequestChange interface
export interface RequestChange {
  key: string;
  label: string;
  oldValue: string | number;
  newValue: string | number;
}

// Added missing RequestTicket interface
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

export interface Transaction {
  id: string;
  feeId: string;
  feeName: string;
  amount: number;
  date: string;
  method: 'VNPAY' | 'MOMO' | 'BANKING';
  status: 'SUCCESS' | 'FAILED';
}

export interface StatData {
  month: string;
  revenue: number;
  debt: number;
}

// --- Registration Types ---
export enum RegistrationType {
  TAM_TRU = 'TAM_TRU',
  TAM_VANG = 'TAM_VANG'
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Registration {
  id: number;
  residentId: number; // Added for editing
  houseId: number;    // Added for editing
  residentName: string;
  roomNumber: string;
  type: RegistrationType;
  startDate: string;
  endDate: string;
  reason: string;
  status: RegistrationStatus;
  adminNote?: string | null;
}

export interface CreateRegistrationRequest {
  residentId: number | string;
  houseId: number | string;
  type: RegistrationType;
  startDate: string;
  endDate: string;
  reason: string;
  note?: string; // Admin note
}
