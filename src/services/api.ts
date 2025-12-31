import axios from 'axios';
import { Category, DashboardData, CasePayload, CaseResponse } from '../types';

// --- CONFIGURATION ---
const API_BASE_URL = 'https://backend-api-886029565568.asia-southeast1.run.app/api/v1';

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

// --- AUTH TYPES ---
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: {
      user_id: string;
      email: string;
      name: string;
    };
  };
}

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