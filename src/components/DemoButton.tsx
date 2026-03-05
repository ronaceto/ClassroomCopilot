import React from 'react';
import { Play } from 'lucide-react';

interface DemoButtonProps {
  onRunDemo: () => void;
  isLoading: boolean;
}

export const DemoButton: React.FC<DemoButtonProps> = ({ onRunDemo, isLoading }) => {
  return (
    <button
      onClick={onRunDemo}
      disabled={isLoading}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed z-40 flex items-center gap-2"
    >
      <Play className="h-5 w-5" />
      Run Demo
    </button>
  );
};