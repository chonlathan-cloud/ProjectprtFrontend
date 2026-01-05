import React, { useState } from 'react';
import { Lock, User, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { signup } from '../services/api';

interface SignUpFormProps {
  onSignUpSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUpSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        position: formData.position
      });

      if (response.success) {
        onSignUpSuccess();
      } else {
        setError('Sign up failed. Please try again.');
      }
    } catch (err: any) {
      console.error("Sign Up Error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white text-slate-900 transition-colors duration-200 py-12">
      <div className="w-full max-w-md p-8 animate-fade-in-up">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 backdrop-blur-sm">
          
          <div className="p-8 text-center border-b border-gray-100">
             <div className="flex w-full justify-center items-center mb-6 transition-transform hover:scale-105 duration-300 translate-x-4">
               <img src="/prt-logo.png" alt="PRT Logo" className="h-12 w-auto object-contain" />
             </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-sm">Join PRT today</p>
          </div>

          <div className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-500 pl-1">
                  Name - Surname
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>



              <div className="space-y-1">
                <label htmlFor="position" className="text-xs font-semibold uppercase tracking-wider text-gray-500 pl-1">
                  Position
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Briefcase size={18} />
                  </div>
                  <input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm"
                    placeholder="Accountant"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500 pl-1">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm"
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>
              </div>

               <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-gray-500 pl-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm"
                    placeholder="Re-enter password"
                    required
                    minLength={8}
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
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign Up <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
            
             <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center w-full focus:outline-none"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Back to Login
              </button>
            </div>

          </div>
          
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Project PRT &copy; 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
