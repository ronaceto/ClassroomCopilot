import { useState, useCallback } from 'react';
import { ChatMessage, ChatResponse, ClassroomConfig, Mode, ArtifactType } from '../types';


const parseApiError = async (response: Response): Promise<string> => {
  const payload = await response.json().catch(() => ({}));

  const message =
    payload?.message ||
    payload?.details?.error?.message ||
    payload?.error ||
    `HTTP ${response.status}`;

  if (response.status === 429) {
    const retryHint = payload?.retryAfter ? ` Retry after ${payload.retryAfter} seconds.` : '';
    return `OpenAI rate limit/quota issue (429): ${message}.${retryHint} Check OpenAI billing and usage limits.`;
  }

  return message;
};

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<ChatDebugInfo | null>(null);
  const [artifacts, setArtifacts] = useState<Record<ArtifactType, string>>({
    lessonPlan: '',
    quiz: '',
    test: '',
    project: '',
    worksheet: '',
    rubric: '',
    parentNote: ''
  });

  const sendMessage = useCallback(async (
    content: string,
    mode: Mode,
    config: ClassroomConfig
  ): Promise<void> => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = JSON.stringify({
        mode,
        messages: [...messages, userMessage],
        config
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      // Fallback to Netlify function if /api/chat fails
      if (!response.ok && response.status === 404) {
        const netlifyResponse = await fetch('/.netlify/functions/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });

        if (!netlifyResponse.ok) {
          const errorMessage = await parseApiError(netlifyResponse);
          throw new Error(errorMessage);
        }

        const data: ChatResponse = await netlifyResponse.json();
        setDebugInfo({
          endpoint: '/.netlify/functions/chat',
          timestamp: Date.now(),
          status: netlifyResponse.status,
          ok: true,
          message: 'Request successful.',
          functionVersion: data?.meta?.functionVersion || null
        });

        if (data.assistantMessages && data.assistantMessages.length > 0) {
          const assistantMessage = {
            ...data.assistantMessages[0],
            timestamp: Date.now()
          };

          setMessages(prev => [...prev, assistantMessage]);
        }

        if (data.artifacts) {
          setArtifacts(prev => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(data.artifacts).filter(([_, value]) => value && value.trim())
            )
          }));
        }

        return;
      }

      if (!response.ok) {
        const errorMessage = await parseApiError(response);
        throw new Error(errorMessage);
      }

      const data: ChatResponse = await response.json();
      setDebugInfo({
        endpoint: '/api/chat',
        timestamp: Date.now(),
        status: response.status,
        ok: true,
        message: 'Request successful.',
        functionVersion: data?.meta?.functionVersion || null
      });

      if (data.assistantMessages && data.assistantMessages.length > 0) {
        const assistantMessage = {
          ...data.assistantMessages[0],
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

      if (data.artifacts) {
        setArtifacts(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(data.artifacts).filter(([_, value]) => value && value.trim())
          )
        }));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Chat error:', err);

      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again or simplify your request.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setArtifacts({
      lessonPlan: '',
      quiz: '',
      test: '',
      project: '',
      worksheet: '',
      rubric: '',
      parentNote: ''
    });
    setError(null);
    setDebugInfo(null);
  }, []);

  const clearAllArtifacts = useCallback(() => {
    setArtifacts({
      lessonPlan: '',
      quiz: '',
      test: '',
      project: '',
      worksheet: '',
      rubric: '',
      parentNote: ''
    });
  }, []);

  const removeArtifact = useCallback((type: ArtifactType) => {
    setArtifacts(prev => ({
      ...prev,
      [type]: ''
    }));
  }, []);

  const runDemo = useCallback(async (mode: Mode, config: ClassroomConfig) => {
    clearChat();

    const demoPrompt = mode === 'teacher'
      ? 'Create a 55-minute lesson for Grade 10 Economics on Supply & Demand. Include objectives with Bloom verbs, 3 activities (Do Now, Mini-Lesson, Practice), materials, checks for understanding, and an exit ticket. Align to TN and CCSS where applicable.'
      : 'Walk me through how to analyze a supply and demand graph step by step. Ask me 2 quick checks as we go.';

    await sendMessage(demoPrompt, mode, config);
  }, [sendMessage, clearChat]);

  return {
    messages,
    isLoading,
    error,
    debugInfo,
    artifacts,
    sendMessage,
    clearChat,
    clearAllArtifacts,
    removeArtifact,
    runDemo
  };
};
