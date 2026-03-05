import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Wand2, User, Bot, ChevronDown } from 'lucide-react';
import { Mode, ChatMessage, ClassroomConfig } from '../types';
import { TEACHER_STARTERS, STUDENT_STARTERS } from '../utils/constants';

interface ChatPanelProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  config: ClassroomConfig;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  mode,
  onModeChange,
  messages,
  onSendMessage,
  isLoading,
  config
}) => {
  const [input, setInput] = useState('');
  const [showStarters, setShowStarters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const starters = mode === 'teacher' ? TEACHER_STARTERS : STUDENT_STARTERS;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleStarterSelect = (starter: string) => {
    setInput(starter);
    setShowStarters(false);
    textareaRef.current?.focus();
  };

  const formatMessage = (content: string) => {
    // Simple markdown formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Mode Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 max-w-fit">
          <button
            onClick={() => onModeChange('teacher')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'teacher'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👩‍🏫 Teacher Assistant
          </button>
          <button
            onClick={() => onModeChange('student')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'student'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎓 Student Helper
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className={`inline-flex p-3 rounded-full ${
              mode === 'teacher' ? 'bg-blue-100' : 'bg-green-100'
            } mb-4`}>
              <Bot className={`h-8 w-8 ${
                mode === 'teacher' ? 'text-blue-600' : 'text-green-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {mode === 'teacher' ? 'Ready to assist with teaching materials!' : 'Ready to help you learn!'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {mode === 'teacher' 
                ? 'I can help you create lesson plans, quizzes, projects, and more. Try one of the starter prompts or ask me anything.'
                : 'Ask me questions about your studies. I\'ll provide helpful guidance and explanations tailored to your learning level.'
              }
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <div className={`flex-shrink-0 ${
                message.role === 'user' ? 'ml-3' : 'mr-3'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gray-200' 
                    : mode === 'teacher' 
                      ? 'bg-blue-100' 
                      : 'bg-green-100'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Bot className={`h-5 w-5 ${
                      mode === 'teacher' ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  )}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-gray-100 text-gray-900'
                  : mode === 'teacher'
                    ? 'bg-blue-50 text-blue-900'
                    : 'bg-green-50 text-green-900'
              }`}>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
                {message.timestamp && (
                  <div className="text-xs opacity-60 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex mr-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                mode === 'teacher' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                <Bot className={`h-5 w-5 animate-pulse ${
                  mode === 'teacher' ? 'text-blue-600' : 'text-green-600'
                }`} />
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              mode === 'teacher' ? 'bg-blue-50' : 'bg-green-50'
            }`}>
              <div className="flex space-x-1">
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  mode === 'teacher' ? 'bg-blue-400' : 'bg-green-400'
                }`} style={{ animationDelay: '0ms' }} />
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  mode === 'teacher' ? 'bg-blue-400' : 'bg-green-400'
                }`} style={{ animationDelay: '150ms' }} />
                <div className={`w-2 h-2 rounded-full animate-bounce ${
                  mode === 'teacher' ? 'bg-blue-400' : 'bg-green-400'
                }`} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative mb-2">
          <button
            onClick={() => setShowStarters(!showStarters)}
            className={`flex items-center gap-2 text-sm px-3 py-1 rounded-md transition-colors ${
              mode === 'teacher'
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            <Wand2 className="h-4 w-4" />
            Starter Prompts
            <ChevronDown className={`h-4 w-4 transform transition-transform ${
              showStarters ? 'rotate-180' : ''
            }`} />
          </button>

          {showStarters && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {starters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterSelect(starter)}
                  className="w-full text-left p-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  {starter.length > 100 ? starter.substring(0, 100) + '...' : starter}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              mode === 'teacher' 
                ? 'Ask me to create lesson plans, quizzes, projects, or any teaching materials...'
                : 'Ask me questions about your studies. I\'m here to help you learn!'
            }
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'teacher'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};