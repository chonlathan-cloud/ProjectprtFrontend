
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Lightbulb, 
  TrendingUp, 
  MessageSquare,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { ViewType } from '../types';
import mylogo from '../src/mylogo.png';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

// MenuItem definition
const MENU_ITEMS = [
  { id: ViewType.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { id: ViewType.FORM, label: 'Form', icon: FileText },
  { id: ViewType.INSIGHTS, label: 'Insights', icon: Lightbulb },
  { id: ViewType.PROFIT_LOSS, label: 'Profit and loss', icon: TrendingUp },
  { id: ViewType.CHAT_VIEW, label: 'Chat View', icon: MessageSquare },
];

interface NavButtonProps {
  item: typeof MENU_ITEMS[0];
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      isActive
        ? 'bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg'
        : 'text-slate-800 dark:text-sky-100 hover:bg-white/20 dark:hover:bg-sky-800'
    }`}
  >
    <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-800 dark:text-sky-100'} />
    <span className="font-medium text-sm">{item.label}</span>
  </button>
);

const UserProfile: React.FC = () => (
  <div className="bg-sky-500 dark:bg-sky-800 rounded-xl p-4 flex items-center gap-3 shadow-inner">
    <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-white/50 dark:border-sky-600">
      <img
        src="https://picsum.photos/seed/user123/100"
        alt="User"
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex-1 overflow-hidden">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">Tharatep Khanbanjong</h3>
      <p className="text-xs text-blue-900 dark:text-sky-200 font-medium">จัดการบัญชี</p>
    </div>
  </div>
);

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <aside className="w-64 bg-sky-400 dark:bg-sky-950 dark:border-r dark:border-sky-900 flex flex-col h-screen sticky top-0 transition-colors duration-200">
      {/* Logo Section */}
      <div className="p-8">
        <div className="flex items-center gap-2">
          <img src={mylogo} alt="PRT Logo" className="w-32 h-20 object-contain" />
        </div>
      </div>

      <div className="px-4">
        <p className="text-xs font-semibold text-slate-600 dark:text-sky-200 mb-4 px-4 uppercase tracking-wider">Manage</p>
        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activeView === item.id}
              onClick={() => onViewChange(item.id)}
            />
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="mt-auto p-4">
        <UserProfile />
      </div>
    </aside>
  );
};
