
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setView: (view: AppView) => void;
  hasApiKey: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, hasApiKey }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView(AppView.SEARCH)}
          >
            <div className="bg-red-600 p-1.5 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">YT Insights <span className="text-red-600 underline decoration-2 underline-offset-4">AI</span></h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => setView(AppView.SEARCH)}
              className={`text-sm font-medium transition-colors ${activeView === AppView.SEARCH ? 'text-red-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Search
            </button>
            <button 
              onClick={() => setView(AppView.SETTINGS)}
              className={`text-sm font-medium transition-colors ${activeView === AppView.SETTINGS ? 'text-red-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Settings
            </button>
            {!hasApiKey && (
               <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-xs">
        <p>&copy; 2024 YT Insights AI Dashboard. Powered by Gemini Flash.</p>
      </footer>
    </div>
  );
};

export default Layout;
