'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { ModeSelector } from '@/components/ModeSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { UserMode, ChatMessage } from '@/types/session';
import { createConversationSession, appendMessage } from '@/lib/firebase';

export default function ChatPage() {
  const router = useRouter();
  const [mode, setMode] = useState<UserMode | null>(null);
  const [sessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleModeSelect = async (selectedMode: UserMode) => {
    setMode(selectedMode);

    // Create conversation session in Firebase
    await createConversationSession(sessionId, {
      mode: selectedMode,
      status: 'active'
    });
  };

  const handleMessageSent = async (role: string, content: string) => {
    const message: ChatMessage = {
      role: role as 'user' | 'ai',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);

    // Save message to Firebase
    await appendMessage(sessionId, message);
  };

  const handleFinished = () => {
    router.push('/');
  };

  if (!mode) {
    return <ModeSelector onModeSelect={handleModeSelect} />;
  }

  return (
    <div className="min-h-screen bg-sage-50 p-6">
      <div className="max-w-5xl mx-auto">
        <ChatInterface
          group={mode}
          chatLog={messages}
          onMessageSent={handleMessageSent}
          onFinished={handleFinished}
        />
      </div>
    </div>
  );
}
