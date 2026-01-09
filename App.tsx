
import React, { useState, useEffect } from 'react';
import { Sidebar } from './src/components/Sidebar';
import { Dashboard } from './src/components/Dashboard';
import { ChatView } from './src/components/ChatView';
import { LoginForm } from './src/components/LoginForm';
import { SignUpForm } from './src/components/SignUpForm';
import { Form } from './src/components/Form';
import { Insights } from './src/components/Insights';
import { ViewType } from './types';
import  AdminApproval  from './src/components/AdminApproval';
import { View } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      case ViewType.CHAT_VIEW:
        return <ChatView />;
      case ViewType.FORM:
        return <Form />;
      case ViewType.INSIGHTS:
        return <Insights />;
      case ViewType.ADMIN_APPROVAL:
        return <AdminApproval />;
      case ViewType.PROFIT_LOSS:
         return (
           <div className="flex items-center justify-center h-full">
             <h2 className="text-2xl text-gray-400">Profit & Loss Component is under construction</h2>
           </div>
         );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl text-gray-400">Section "{currentView}" is coming soon...</h2>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    if (isSigningUp) {
      return (
        <SignUpForm 
          onSwitchToLogin={() => setIsSigningUp(false)} 
          onSignUpSuccess={() => setIsSigningUp(false)} 
        />
      );
    }
    return (
      <LoginForm 
        onLogin={handleLogin} 
        onSwitchToSignUp={() => setIsSigningUp(true)} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar activeView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
