import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { ConfigPanel } from './components/ConfigPanel';
import { ChatPanel } from './components/ChatPanel';
import { useChat } from './hooks/useChat';
import { Mode, ClassroomConfig } from './types';
import { loadConfig } from './utils/storage';

function App() {
  const [mode, setMode] = useState<Mode>('teacher');
  const [config, setConfig] = useState<ClassroomConfig>(loadConfig());
  const [configPanelOpen, setConfigPanelOpen] = useState(true);
  const [debugOpen, setDebugOpen] = useState(false);

  const {
    messages,
    isLoading,
    error,
    debugInfo,
    artifacts,
    sendMessage,
    clearChat,
    clearAllArtifacts,
    removeArtifact
  } = useChat();

  const handleSendMessage = (content: string) => {
    sendMessage(content, mode, config);
  };

  // Update panel visibility on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setConfigPanelOpen(false);
      } else {
        setConfigPanelOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Classroom Copilot</h1>
            <p className="text-xs sm:text-sm text-gray-600">AI-powered teaching and learning assistant</p>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        <ConfigPanel
          config={config}
          onConfigChange={setConfig}
          isOpen={configPanelOpen}
          onToggle={() => setConfigPanelOpen(!configPanelOpen)}
          artifacts={artifacts}
          onClearAllArtifacts={clearAllArtifacts}
          onRemoveArtifact={removeArtifact}
        />

        <ChatPanel
          mode={mode}
          onModeChange={setMode}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          config={config}
        />
      </div>

      {/* API Debug Panel */}
      {debugInfo && (
        <div className="fixed bottom-20 right-4 max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-40">
          <button
            type="button"
            onClick={() => setDebugOpen(prev => !prev)}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 border-b border-gray-100"
          >
            API Debug {debugInfo.ok ? '✅' : '❌'} ({debugInfo.status}) {debugOpen ? '▲' : '▼'}
          </button>

          {debugOpen && (
            <div className="px-4 py-3 text-xs text-gray-700 space-y-1">
              <p><span className="font-semibold">Endpoint:</span> {debugInfo.endpoint}</p>
              <p><span className="font-semibold">Time:</span> {new Date(debugInfo.timestamp).toLocaleTimeString()}</p>
              <p><span className="font-semibold">Message:</span> {debugInfo.message}</p>
              {debugInfo.code && <p><span className="font-semibold">Code:</span> {debugInfo.code}</p>}
              {debugInfo.type && <p><span className="font-semibold">Type:</span> {debugInfo.type}</p>}
              {debugInfo.retryAfter && <p><span className="font-semibold">Retry-After:</span> {debugInfo.retryAfter}</p>}
              {debugInfo.functionVersion && <p><span className="font-semibold">Function Version:</span> {debugInfo.functionVersion}</p>}
            </div>
          )}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;
