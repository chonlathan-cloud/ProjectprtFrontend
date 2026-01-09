import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, TrendingUp } from 'lucide-react';
import { getUsers, getInsights, InsightsData } from '../services/api';
import { User } from '../../types';

const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const INITIAL_INSIGHTS: InsightsData = {
  summary: {
    normal_count: 0,
    normal_amount: 0,
    pending_count: 0,
    pending_amount: 0,
    approved_count: 0,
    approved_amount: 0,
  },
  transactions: []
};

export const Insights: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData>(INITIAL_INSIGHTS);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchInsightsData = async () => {
      setDataLoading(true);
      try {
        const result = await getInsights(selectedUserId, selectedMonth);
        if (result) {
          setInsights(result);
        }
      } catch (error) {
        console.error("Failed to fetch insights data:", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchInsightsData();
  }, [selectedUserId, selectedMonth]);

  const getCreatorName = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.name : 'Unknown User';
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M THB`;
    }
    return `${(amount / 1000).toFixed(1)}K THB`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-900">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Insights</h1>
          <p className="text-slate-500 mt-1">รายการสืบค้นและวิเคราะห์</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select 
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="pl-4 pr-10 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-sm font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">ผู้ทำรายการทั้งหมด</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>{u.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="relative">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-4 pr-10 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-sm font-medium text-slate-700 appearance-none cursor-pointer"
            >
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors bg-white">
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden bg-white border border-blue-50 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <TrendingUp size={20} />
              </div>
              <span className="font-bold text-slate-600">รายการปกติ</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{insights.summary.normal_count.toLocaleString()}</p>
            <p className="text-sm font-bold text-blue-500 mt-1">{formatCurrency(insights.summary.normal_amount)}</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white border border-sky-50 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full opacity-50 -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                <Filter size={20} />
              </div>
              <span className="font-bold text-slate-600">รอดำเนินการ</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{insights.summary.pending_count.toLocaleString()}</p>
            <p className="text-sm font-bold text-sky-500 mt-1">{formatCurrency(insights.summary.pending_amount)}</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-100 group transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Search size={20} className="text-white" />
              </div>
              <span className="font-bold opacity-90">อนุมัติแล้ว</span>
            </div>
            <p className="text-4xl font-black">{insights.summary.approved_count.toLocaleString()}</p>
            <p className="text-sm font-bold text-blue-100 mt-1">{formatCurrency(insights.summary.approved_amount)}</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="font-bold text-slate-800">รายการปส ทั้งหมด {selectedMonth && `ประจำเดือน${selectedMonth}`}</h2>
          <div className="flex gap-2">
             <button className="px-4 py-1.5 text-xs font-bold text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors">Export CSV</button>
             <button className="text-slate-400 hover:text-slate-600 transition-colors p-1"><MoreHorizontal size={20} /></button>
          </div>
        </div>
        
        <div className="overflow-x-auto relative">
          {dataLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-blue-600 animate-pulse">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          )}
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">เลขที่ใบ ปส</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">วันเดือนปี</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">ชื่อผู้ทำรายการ</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">จำนวนเงิน</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">วัตถุประสงค์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {insights.transactions.length > 0 ? (
                insights.transactions.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{item.doc_no}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-bold">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{getCreatorName(item.creator_id)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-sm font-medium">
                      {item.purpose}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Search size={48} strokeWidth={1} />
                      <p className="text-sm font-medium">ไม่พบข้อมูลในเงื่อนไขที่เลือก</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-6 border-t border-slate-50 flex items-center justify-between text-sm text-slate-500 font-medium bg-slate-50/10">
          <p>Showing {insights.transactions.length} entries</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
            <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
