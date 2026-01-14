import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

interface VoiceRecorderProps {
    onTranscript: (text: string) => void;
    isProcessing: boolean;
}

// Minimal type definitions for Web Speech API
interface SpeechRecognitionEvent {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
        };
    };
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
    interface Window {
        webkitSpeechRecognition: {
            new(): SpeechRecognition;
        };
    }
}

export function VoiceRecorder({ onTranscript, isProcessing }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'tr-TR';

            recognition.onstart = () => setIsRecording(true);
            recognition.onend = () => setIsRecording(false);
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                if (transcript.trim()) {
                    onTranscript(transcript);
                }
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Web Speech API not supported in this browser.");
        }
    }, [onTranscript]);

    const toggleRecording = () => {
        if (isProcessing) return;

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = () => {
        if (recognitionRef.current && !isRecording) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Mic start error", e);
            }
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div
                className={`relative flex items-center justify-center w-32 h-32 rounded-full cursor-pointer transition-all duration-300 ${isRecording
                    ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                    : isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 shadow-lg'
                    }`}
                onClick={toggleRecording}
            >
                <div className={`transition-transform duration-300 ${isRecording ? 'scale-75' : 'scale-100'}`}>
                    {isRecording ? <div className="w-10 h-10 bg-white rounded-md" /> : <Mic className="w-12 h-12 text-white" />}
                </div>

                {/* Pulsing rings when recording */}
                {isRecording && (
                    <>
                        <div className="absolute w-full h-full rounded-full border-4 border-red-400 opacity-60 animate-[ping_1.5s_ease-in-out_infinite]" />
                        <div className="absolute w-full h-full rounded-full border-4 border-red-300 opacity-40 animate-[ping_2s_ease-in-out_infinite]" />
                    </>
                )}
            </div>

            <p className="mt-6 text-center text-gray-600 font-medium select-none">
                {isProcessing ? (
                    <span className="animate-pulse">Chiron düşünüyor...</span>
                ) : isRecording ? (
                    <span className="text-red-600 font-bold">Dinliyor... (Bitirmek için tıkla)</span>
                ) : (
                    "Başlamak için tıkla"
                )}
            </p>
        </div>
    );
}
