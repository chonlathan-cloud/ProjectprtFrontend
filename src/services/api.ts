import axios from 'axios';
import { Category, CasePayload, CaseResponse, User, BankAccount } from '../../types';
const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = `${BASE_URL}/api/v1`;
// --- CONFIGURATION ---
export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`, // ต่อท้ายด้วย /api/v1 เสมอ
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
  position?: string;
}

export interface AuthResponse {
  success: boolean;
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

export interface ChatResponse {
  reply: string;
}

// [NEW] ฟังก์ชันสำหรับคุยกับ AI ผ่าน Backend
export const chatWithAI = async (message: string): Promise<string> => {
  try {
    // ยิง POST ไปที่ /api/v1/chat
    // สังเกตว่าเราส่งไปแค่ { message: "ข้อความ" }
    const response = await api.post('/chat', { message }); 
    
    // Backend จะส่งกลับมาเป็น { "reply": "คำตอบจาก AI..." }
    return response.data.reply;
  } catch (error) {
    console.error("Chat API Error:", error);
    return "ขออภัยครับ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ในขณะนี้ (Backend Error)";
  }
};

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
export const getCategories = async (type?: 'EXPENSE' | 'REVENUE' | 'ASSET'): Promise<Category[]> => {
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
// [NEW] ดึงรายการ Case (รองรับการกรองสถานะ)
export const getCases = async (status?: string): Promise<CaseResponse[]> => {
  const query = status ? `?status=${status}` : '';
  const response = await api.get(`/cases/${query}`);
  // Backend อาจจะส่งเป็น Array ตรงๆ หรือห่อด้วย data envelope ให้เช็คดู (ตามโค้ด Backend ล่าสุดน่าจะส่ง Array ตรงๆ)
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};
// สั่งอนุมัติ Case
export const approveCase = async (caseId: string): Promise<WorkflowResponse> => {
  const response = await api.post(`/cases/${caseId}/approve`);
  return response.data;
};
// [NEW] เพิ่มฟังก์ชันสำหรับ Reject/Cancel
export const rejectCase = async (caseId: string, reason: string = ""): Promise<WorkflowResponse> => {
  const response = await api.post(`/cases/${caseId}/reject`, { note: reason });
  return response.data;
};

// Fetch Users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/auth/users/'); // Assuming this endpoint based on auth context
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};

// Fetch Bank Accounts
export const getBankAccounts = async (): Promise<BankAccount[]> => {
  try {
    //เรียก ร่างจาก category backend > bankAccounts Frontend
    const categories = await getCategories('ASSET');
    return categories.map(cat => ({
      id: cat.id,
      account_number: cat.account_code || '-', // สมมติว่าเก็บเลขบัญชีใน account_code
      account_name: cat.name_th,
      bank_name: cat.name_th
    }));
  } catch (error) {
    console.error("Error fetching bank accounts from categories:", error);
    return [];
  }
};