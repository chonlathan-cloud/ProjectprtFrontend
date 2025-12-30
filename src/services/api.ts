import axios from 'axios';
import { Category, DashboardData } from '../types';
// --- CONFIGURATION ---
const API_BASE_URL = 'https://backend-api-886029565568.asia-southeast1.run.app/api/v1';

// ⚠️ HARDCODED TOKEN FOR DEV/TESTING (Replace with real logic later)
// เอา Token ที่ได้จาก test_phase5.py หรือยิง curl มาใส่ตรงนี้ครับ
const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbl9nb29nbGVfaWRfMTIzIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc2NzA5MTgxMCwiZXhwIjoxNzY3MDk1NDEwfQ.S8hqSFVA4B83-rxqokyc_wHalh0V6u3vSNoUuq5G5B8"; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
// นิยาม TYPE สำหรับส่งข้อมูล
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
  return response.data.data;
};

// 2. Categories (อันใหม่ แก้ไขแล้ว)
export const getCategories = async (type?: 'EXPENSE' | 'REVENUE' | 'ASSET'): Promise<Category[]> => {
  const query = type ? `?type=${type}` : '';
  const response = await api.get(`/categories${query}`);
  return response.data.data;
=======
  // Backend ส่งมาในรูปแบบ { success: true, data: { ... } }
  return response.data.data; 
};