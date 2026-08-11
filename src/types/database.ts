export interface Party {
  id: string;
  admin_id: string;
  name: string;
  event_date: string;
  total_amount: number;
  number_of_months: number;
  start_date: string;
  due_day: number;
  share_token: string;
  pix_key?: string;
  created_at?: string;
}

export interface Participant {
  id: string;
  party_id: string;
  name: string;
  phone?: string;
  created_at?: string;
}

export interface Payment {
  id: string;
  participant_id: string;
  month_number: number;
  amount_due: number;
  amount_paid: number;
  payment_date?: string | null;
  notes?: string | null;
  status: "Pago" | "Parcial" | "Pendente" | "Adiantado";
  updated_at?: string;
}

export interface ParticipantSummary extends Participant {
  total_due: number;
  total_paid: number;
  remaining_balance: number;
  overall_status: "Pago" | "Parcial" | "Pendente" | "Adiantado";
  payments: Record<number, Payment>;
}

export interface Expense {
  id: string;
  party_id: string;
  category: string;
  description: string;
  amount: number;
  is_paid: boolean;
}

export interface AppUser {
  uid: string;
  email: string;
  created_at?: string;
}

// Public, non-sensitive subset of a Party, exposed via /public_parties/{share_token}
// so a party can be shared through a link without exposing admin data.
export interface PublicParty {
  party_id: string;
  name: string;
  event_date: string;
  total_amount: number;
  number_of_months: number;
  start_date: string;
  due_day: number;
  share_token: string;
  pix_key?: string;
}

export interface PartySummary {
  total_amount: number;
  total_collected: number;
  total_pending: number;
  total_expenses: number;
  expenses_paid: number;
  expenses_pending: number;
  balance: number;
  participant_count: number;
  participants_paid: number;
  participants_partial: number;
  participants_pending: number;
}
