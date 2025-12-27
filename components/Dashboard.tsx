import React, { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Wallet, TrendingUp, CreditCard, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

// --- Interfaces for Data Structure ---
interface MonthlyData {
  name: string;
  value: number;
  highlight?: boolean;
}

interface ActivityData {
  name: string;
  value: number;
  fill: string;
}

interface TransactionItem {
  id: string;
  initial: string;
  name: string;
  description: string;
  amount: number;
}

interface DashboardData {
  summary: {
    expenses: number;
    income: number;
    balance: number;
  };
  monthlyStats: MonthlyData[];
  activityStats: ActivityData[];
  latestTransactions: TransactionItem[];
}

interface DashboardProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// --- Initial Empty State (Ready for Backend) ---
const INITIAL_DATA: DashboardData = {
  summary: {
    expenses: 0,
    income: 0,
    balance: 0,
  },
  monthlyStats: [],
  activityStats: [],
  latestTransactions: []
};

export const Dashboard: React.FC<DashboardProps> = ({ isDarkMode, toggleTheme }) => {
  // State for data - initialized with empty structure
  const [data, setData] = useState<DashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  
  // State for UI interaction
  const [activeCard, setActiveCard] = useState<'expenses' | 'income' | 'balance' | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  // Connect to Backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/dashboard?year=${selectedYear}`);
        const result = await response.json();
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Fallback to empty/initial data if failed
        setData(INITIAL_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  // Helper to determine card styling
  const getCardStyle = (cardType: 'expenses' | 'income' | 'balance') => {
    const isActive = activeCard === cardType;
    const baseStyle = "rounded-3xl p-6 relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer border";
    
    if (isActive) {
      return `${baseStyle} bg-sky-200 border-sky-300 dark:bg-sky-900 dark:border-sky-500`;
    }
    return `${baseStyle} bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <div className="flex gap-4">
          <button className="p-2 hover:bg-white rounded-full transition-colors dark:hover:bg-slate-700">
            <Search size={24} className="text-slate-600 dark:text-slate-300" />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-white rounded-full transition-colors dark:hover:bg-slate-700"
          >
            {isDarkMode ? (
              <Sun size={24} className="text-slate-600 dark:text-slate-300" />
            ) : (
              <Moon size={24} className="text-slate-600 dark:text-slate-300" />
            )}
          </button>
          <button className="p-2 hover:bg-white rounded-full transition-colors">
            <MoreHorizontal size={24} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Expenses */}
        <div 
          className={getCardStyle('expenses')}
          onClick={() => setActiveCard('expenses')}
        >
           <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl shadow-sm ${activeCard === 'expenses' ? 'bg-white/50 dark:bg-slate-700/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
               <Wallet className={activeCard === 'expenses' ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"} />
            </div>
            <button className={`${activeCard === 'expenses' ? 'text-slate-600 hover:bg-white/30' : 'text-slate-400 hover:bg-slate-50'} rounded-full p-1`}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          <p className={`text-lg font-medium ${activeCard === 'expenses' ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>รายจ่าย</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{data.summary.expenses.toLocaleString()}</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">บาท</span>
          </div>
        </div>

        {/* Card: Income */}
        <div 
          className={getCardStyle('income')}
          onClick={() => setActiveCard('income')}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${activeCard === 'income' ? 'bg-white/50 dark:bg-slate-700/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
               <TrendingUp className={activeCard === 'income' ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"} />
            </div>
            <button className={`${activeCard === 'income' ? 'text-slate-600 hover:bg-white/30' : 'text-slate-400 hover:bg-slate-50'} rounded-full p-1`}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          <p className={`text-lg font-medium ${activeCard === 'income' ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>รายรับ</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{data.summary.income.toLocaleString()}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">บาท</span>
          </div>
        </div>

        {/* Card: Balance */}
        <div 
          className={getCardStyle('balance')}
          onClick={() => setActiveCard('balance')}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${activeCard === 'balance' ? 'bg-white/50 dark:bg-slate-700/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
               <CreditCard className={activeCard === 'balance' ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"} />
            </div>
            <button className={`${activeCard === 'balance' ? 'text-slate-600 hover:bg-white/30' : 'text-slate-400 hover:bg-slate-50'} rounded-full p-1`}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          <p className={`text-lg font-medium ${activeCard === 'balance' ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>เงินคงเหลือ</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{data.summary.balance.toLocaleString()}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">บาท</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Overview</h2>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <ChevronLeft size={20} className="text-blue-400 cursor-pointer hover:scale-110 transition-transform" onClick={handlePrevYear} />
              <span className="min-w-[40px] text-center">{selectedYear}</span>
              <ChevronRight size={20} className="text-blue-400 cursor-pointer hover:scale-110 transition-transform" onClick={handleNextYear} />
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-xl">
             {data.monthlyStats.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.monthlyStats}>
                   <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 500 }}
                     dy={10}
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#94a3b8' }}
                     tickFormatter={(val) => `${val / 1000}k`}
                   />
                   <Tooltip 
                     cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }}
                     contentStyle={{ 
                       borderRadius: '12px', 
                       border: 'none', 
                       boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                       backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                       color: isDarkMode ? '#fff' : '#000'
                     }}
                   />
                   <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                     {data.monthlyStats.map((entry, index) => (
                       <Cell 
                         key={`cell-${index}`} 
                         fill={entry.highlight ? '#82b1ff' : '#e2e8f0'} 
                       />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             ) : (
                <p>Waiting for data...</p>
             )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Activity</h2>
            <button className="text-slate-400"><MoreHorizontal size={20} /></button>
          </div>
          <div className="h-[300px] flex flex-col justify-center items-center">
             {data.activityStats.length > 0 ? (
               <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.activityStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend placeholder */}
                <div className="flex gap-4 mt-4 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-400"></div> Shopping</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-300"></div> Food</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-300"></div> Rent</div>
                </div>
               </>
             ) : (
                <div className="flex items-center justify-center text-slate-400 h-full w-full bg-slate-50 rounded-xl">
                  <p>No activity data</p>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Latest Items List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Latest item</h2>
        <div className="space-y-6">
          {data.latestTransactions.length > 0 ? (
            data.latestTransactions.map((item) => (
              <div key={item.id} className="flex items-center justify-between group cursor-pointer border-b border-slate-50 dark:border-slate-700 pb-4 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{item.name}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-800 dark:text-white">{item.amount.toLocaleString()} บาท</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
