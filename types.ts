
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  FORM = 'FORM',
  INSIGHTS = 'INSIGHTS',
  PROFIT_LOSS = 'PROFIT_LOSS',
  CHAT_VIEW = 'CHAT_VIEW'
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

export interface MonthlyData {
  name: string;
  value: number;
  highlight?: boolean;
}

export interface Category {
  id: string;
  name_th: string;
  type: 'EXPENSE' | 'INCOME' | 'ASSET';
  accout_type: string;
  is_active: boolean;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  position?: string;
}

export interface BankAccount {
  id: string;
  account_number: string;
  account_name: string;
  bank_name: string;
}

export interface CasePayload {
  category_id: string;
  requested_amount: number;
  purpose: string;
  department_id?: string;
  cost_center_id?: string;
  funding_type: 'OPERATING' | 'GOV_BUDGET';
}

export interface CaseResponse {
  id: string;
  case_no: string;
  status: string;
  // ... fields อื่นๆ
}