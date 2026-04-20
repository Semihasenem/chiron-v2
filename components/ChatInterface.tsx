'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserMode, ChatMessage } from '@/types/session';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  group: UserMode;
  chatLog: ChatMessage[];
  onMessageSent: (role: string, content: string) => void;
  onFinished: () => void;
}

export function ChatInterface({
  group,
  chatLog,
  onMessageSent,
  onFinished,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<{ message: string; retry: () => void } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callApi = async (payloadMessages: Message[], isStartSession: boolean) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        let serverMessage = 'Bir şeyler ters gitti. Tekrar dener misin?';
        try {
          const body = await response.json();
          if (body?.error) serverMessage = body.error;
        } catch {
          // non-JSON body, fall back to default
        }
        throw new Error(serverMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
      };

      if (isStartSession) {
        setMessages([assistantMessage]);
      } else {
        setMessages([...payloadMessages, assistantMessage]);
      }

      onMessageSent('ai', assistantContent);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bağlantı hatası. Tekrar dener misin?';
      console.error('Chat error:', err);
      setError({
        message,
        retry: () => callApi(payloadMessages, isStartSession),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, isStartSession = false) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    const newMessages = [...messages, userMessage];
    if (!isStartSession) {
      setMessages(newMessages);
    }

    await callApi(newMessages, isStartSession);
  };

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      sendMessage('START_SESSION', true);
    }
  }, [hasStarted]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    onMessageSent('user', message);
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-sm border border-sage-200">
      <div className="p-4 border-b border-sage-100 flex justify-between items-center">
        <h2 className="text-sage-700 font-medium">Chiron</h2>
        <button
          onClick={onFinished}
          className="text-sm text-sage-500 hover:text-sage-700"
        >
          Bitir
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-sage-600 text-white'
                  : 'bg-sage-100 text-sage-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-sage-100 text-sage-800 px-4 py-3 rounded-2xl flex items-center gap-1.5">
              <span className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-sage-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl">
              <p className="text-sm">{error.message}</p>
              <button
                type="button"
                onClick={() => {
                  const retry = error.retry;
                  setError(null);
                  retry();
                }}
                className="mt-2 px-3 py-1.5 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                Tekrar dene
              </button>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className="p-4 border-t border-sage-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Mesajını yaz..."
            className="flex-1 p-3 rounded-xl border border-sage-200 focus:outline-none focus:border-sage-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gönder
          </button>
        </div>
      </form>
    </div>
  );
}
