import React from 'react';
import Navbar from './components/Navbar';
import RouterConfig from './routes/RouterConfig';
import { BookOpen } from 'lucide-react';

export const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <RouterConfig />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">MiniAula</span>
            <span>— Plataforma de Micro-aprendizaje</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Aprende a tu ritmo, una lección a la vez</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
