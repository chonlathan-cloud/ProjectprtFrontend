
import React, { useState, useEffect } from 'react';
import { Sidebar } from './src/components/Sidebar';
import { Dashboard } from './src/components/Dashboard';
import { ChatView } from './src/components/ChatView';
import { ViewType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const renderView = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      case ViewType.CHAT_VIEW:
        return <ChatView />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-2xl text-gray-400">Section "{currentView}" is coming soon...</h2>
          </div>
        );
    }
  };

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
