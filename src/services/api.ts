import axios from 'axios';

// --- CONFIGURATION ---
const API_BASE_URL = 'https://backend-api-886029565568.asia-southeast1.run.app/api/v1';

// ⚠️ HARDCODED TOKEN FOR DEV/TESTING (Replace with real logic later)
// เอา Token ที่ได้จาก test_phase5.py หรือยิง curl มาใส่ตรงนี้ครับ
const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbl9nb29nbGVfaWRfMTIzIiwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc2Njk4MDc1OSwiZXhwIjoxNzY2OTg0MzU5fQ.4GHalNBMpbvjAp1ysNh5jKg0wkzBYVs4XLqVLEel0NY"; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || DEV_TOKEN; // ถ้าไม่มีใน storage ให้ใช้ตัว Hardcode
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

// API Calls
export const getDashboardData = async (year: number): Promise<DashboardData> => {
  const response = await api.get(`/dashboard?year=${year}`);
  // Backend ส่งมาในรูปแบบ { success: true, data: { ... } }
  return response.data.data; 
};