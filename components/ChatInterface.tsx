import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, User, Bot } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';

interface ChatInterfaceProps {
    group: 'text' | 'voice';
    chatLog: any[];
    onMessageSent: (role: string, content: string) => void;
    onFinished: () => void;
}

export function ChatInterface({ group, onMessageSent, onFinished }: ChatInterfaceProps) {
    const chatConfig = {
        api: '/api/chat',
        body: {},
        onResponse: (response: Response) => {
            console.log('onResponse called:', response);
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
        },
        onFinish: (message: any) => {
            console.log('onFinish called with message:', message);
            console.log('Message role:', message?.role);
            console.log('Message content:', message?.content);
            console.log('Message parts:', message?.message?.parts);
            console.log('Full message object:', JSON.stringify(message, null, 2));
            // The message structure is nested in the response
            const actualMessage = message?.message || message;
            if (actualMessage && actualMessage.content) {
                onMessageSent('ai', actualMessage.content);
                if (group === 'voice' && typeof window !== 'undefined') {
                    const utterance = new SpeechSynthesisUtterance(actualMessage.content);
                    utterance.lang = 'tr-TR';
                    window.speechSynthesis.speak(utterance);
                }
            }
        },
        onError: (error: any) => {
            console.error('Chat error:', error);
        },
    };

    console.log('useChat config:', chatConfig);
    const { messages, status, sendMessage, input: chatInput, handleSubmit } = useChat(chatConfig);

    const [localInput, setLocalInput] = useState('');
    const isLoading = status === 'submitted' || status === 'streaming';
    const hasStarted = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-start session
    useEffect(() => {
        if (!hasStarted.current && messages.length === 0) {
            console.log('Starting session...');
            hasStarted.current = true;

            try {
                sendMessage({ role: 'user', content: 'START_SESSION' });
            } catch (err) {
                console.error('Auto-start error:', err);
            }
        }
    }, [messages.length, sendMessage]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle voice transcript
    const handleVoiceInput = (text: string) => {
        if (!isLoading) {
            try {
                sendMessage({ role: 'user', content: text });
                onMessageSent('user', text);
            } catch (e) {
                console.error('Voice send error:', e);
            }
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localInput.trim()) {
            const text = localInput;
            setLocalInput(''); // Clear input immediately
            onMessageSent('user', text);

            try {
                sendMessage({ role: 'user', content: text });
            } catch (e) {
                console.error('Form send error:', e);
            }
        }
    };

    // Filter out the system trigger message from UI
    // @ts-ignore
    const visibleMessages = messages.filter(m => m.content !== 'START_SESSION');

    console.log('Messages:', messages);
    console.log('Messages length:', messages.length);
    if (messages.length > 0) {
        console.log('First message:', messages[0]);
        console.log('Messages full:', JSON.stringify(messages, null, 2));
    }
    console.log('Visible Messages:', visibleMessages);
    console.log('Status:', status);

    return (
        <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-teal-50/50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-sm">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Chiron</h3>
                        <p className="text-xs text-teal-600 font-medium">İçgörü Rehberi</p>
                    </div>
                </div>
                <button
                    onClick={onFinished}
                    className="text-xs text-gray-500 hover:text-red-500 underline transition-colors"
                >
                    Oturumu Bitir
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
                {visibleMessages.length === 0 && isLoading && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        <p>Bağlanıyor...</p>
                    </div>
                )}

                {visibleMessages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${m.role === 'user' ? 'bg-gray-200 text-gray-700' : 'bg-teal-100 text-teal-800'
                                }`}
                        >
                            {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div
                            className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                ? 'bg-gray-800 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}
                        >
                            {m.content || (m.parts && m.parts.map((p: any) => p.text).join('')) || JSON.stringify(m)}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center"><Bot size={16} /></div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100">
                            <span className="flex space-x-1">
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                {group === 'voice' ? (
                    <VoiceRecorder onTranscript={handleVoiceInput} isProcessing={isLoading} />
                ) : (
                    <form onSubmit={handleFormSubmit} className="flex gap-2">
                        <input
                            className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm text-gray-700 placeholder-gray-400"
                            value={localInput}
                            placeholder="Mesajınızı yazın..."
                            onChange={(e) => setLocalInput(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!localInput.trim() || isLoading}
                            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-xl p-4 transition-colors shadow-sm"
                        >
                            <Send size={24} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
