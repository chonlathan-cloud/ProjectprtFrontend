import axios from 'axios';
import { Category, CasePayload, CaseResponse, User, BankAccount } from '../../types';

// --- CONFIGURATION ---
const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
export interface WorkflowResponse {
  message: string;
  case_id: string;
  status: string;
  doc_no?: string;
}

// Auto-inject Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Types
export interface DashboardData {
  summary: {
    expenses: number;
    income: number;
    balance: number;
  };
  monthlyStats: Array<{ name: string; value: number; highlight?: boolean }>;
  activityStats: Array<{ name: string; value: number; fill: string }>;
  latestTransactions: Array<{ id: string; initial: string; name: string; description: string; amount: number }>;
}

export interface InsightsData {
  summary: {
    normal_count: number;
    normal_amount: number;
    pending_count: number;
    pending_amount: number;
    approved_count: number;
    approved_amount: number;
  };
  transactions: Array<{
    id: string;
    doc_no: string;
    date: string;
    creator_id: string;
    user_code: string;
    purpose: string;
  }>;
}

// --- AUTH TYPES ---
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  position: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
    details: any;
  };
  data: {
    access_token: string;
    user: {
      user_id: string;
      email: string;
      name: string;
      position?: string;
    };
  };
}

// Interceptor to handle HTML responses (Proxy failure)
api.interceptors.response.use(
  (response) => {
    // Check if we got HTML instead of JSON
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      const error = new Error('Invalid API Response: Received HTML. Check API Base URL or Proxy configuration.');
      (error as any).isHtmlError = true;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API Calls
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
  const response = await api.post('/auth/signup', payload);
  return response.data;
}

export const getDashboardData = async (year: number): Promise<DashboardData> => {
  const response = await api.get(`/dashboard?year=${year}`);
  // Dashboard API ห่อด้วย data envelope
  return response.data.data;
};

// --- แก้ไขตรงนี้ ---
export const getCategories = async (type?: 'EXPENSE' | 'INCOME' | 'ASSET'): Promise<Category[]> => {
  const query = type ? `?type=${type}` : '';
  
  // 1. เพิ่ม / ปิดท้าย เพื่อแก้ 307
  const response = await api.get(`/categories/${query}`);
  
  // 2. ใช้ response.data ตรงๆ เพราะ Backend ส่ง Array มาเลย
  if (Array.isArray(response.data)) {
      return response.data;
  }
  
  // กันเหนียวเผื่อ Backend เปลี่ยน format
  return response.data.data || [];
}

// สร้าง Case ใหม่
export const createCase = async (payload: CasePayload): Promise<CaseResponse> => {
  const response = await api.post('/cases/', payload);
  return response.data;
};

// Submit Case
export const submitCase = async (caseId: string): Promise<WorkflowResponse> => {
  const response = await api.post(`/cases/${caseId}/submit`);
  return response.data;
};

// Fetch Users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/auth/users/'); // Assuming this endpoint based on auth context
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};

// Fetch Bank Accounts
export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const response = await api.get('/bank-accounts/'); // Assuming this endpoint
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};

// Fetch Insights Data
export const getInsights = async (userId?: string, month?: string): Promise<InsightsData> => {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  if (month) params.append('month', month);
  
  const response = await api.get(`/insights?${params.toString()}`);
  return response.data.data;
};

// Search Documents by Doc No (for JV Consolidation)
export const searchDocumentsByNo = async (docNo: string): Promise<any[]> => {
  const response = await api.get(`/cases/search?doc_no=${encodeURIComponent(docNo)}`);
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};