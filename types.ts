
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  FORM = 'FORM',
  INSIGHTS = 'INSIGHTS',
  PROFIT_LOSS = 'PROFIT_LOSS',
  CHAT_VIEW = 'CHAT_VIEW',
  ADMIN_APPROVAL = 'ADMIN_APPROVAL', // เพิ่ม Case ใหม่ สำหรับ approval list for documents
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
  type: 'EXPENSE' | 'REVENUE' | 'ASSET';
  account_code: string;
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
  // [new] เพิ่มฟิลด์นี้สำหรับ RV (ระบุว่าจะเอาเงินเข้าบัญชีไหน)
  deposit_account_id?: string;
}

export interface CaseResponse {
  id: string;
  case_no: string;
  category_id: string;
  requester_id: string;
  requested_amount: number;
  purpose: string;
  status: string;
  created_at: string;
  is_receipt_uploaded: boolean;
  // ... fields อื่นๆ
}