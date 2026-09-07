export type ReferralStatus = "submitted" | "contacted" | "in_progress" | "closed_won" | "closed_lost";
export type UserRole = "admin" | "partner";
export type UserStatus = "active" | "pending" | "deactivated";

export interface Referral {
  id: string;
  partnerId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  notes: string | null;
  status: ReferralStatus;
  dealValueCents: number | null;
  estimatedCommissionCents: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReferralInput {
  status?: ReferralStatus;
  dealValueCents?: number;
  estimatedCommissionCents?: number;
}

export interface UpdateUserInput {
  role?: UserRole;
  status?: UserStatus;
}
