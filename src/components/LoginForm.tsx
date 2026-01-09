import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';
import { login } from '../services/api'; 

interface LoginFormProps {
  onLogin: () => void;
  onSwitchToSignUp: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToSignUp }) => {
  // เปลี่ยนชื่อ state จาก username เป็น email เพื่อให้ตรงกับ Backend
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. เรียก API Login ของจริง
      const response = await login({ email, password });
      console.log("Login Response Debug:", response);

      if (response.success && response.data?.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        localStorage.setItem('user', JSON.stringify(response.data.user));

        onLogin();
      } else {
        // Show actual error from backend
        const errorMessage = response.error?.message || response.message || 'Login failed. Please try again.';
        setError(errorMessage);
      }
    } catch (err: any) {
      // 4. จัดการ Error (เช่น รหัสผิด หรือ Server ล่ม)
      console.error("Login Error:", err);
      if (err.isHtmlError) {
         setError(err.message);
      } else if (err.response?.status === 401) {
        // Sometimes 401 response has a message
        const msg = err.response.data?.error?.message || err.response.data?.message || 'Invalid email or password.';
        setError(msg);
      } else if (err.response?.data?.message) {
         setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white text-slate-900 transition-colors duration-200">
      <div className="w-full max-w-md p-8 animate-fade-in-up">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 backdrop-blur-sm">
          
          <div className="p-8 text-center border-b border-gray-100">
            <div className="flex w-full justify-center items-center mb-6 transition-transform hover:scale-105 duration-300">
              <img src="/metta-logo.png" alt="METTA Logo" className="h-24 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Welcome METTA</h1>
            <p className="text-gray-500 text-sm">Sign in to METTA</p>
          </div>

          <div className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500 pl-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={18} />
                  </div>
                  {/* เปลี่ยน Input เป็น Email */}
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500 pl-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign In <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Project METTA &copy; 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};