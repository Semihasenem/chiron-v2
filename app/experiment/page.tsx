
'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ConsentForm } from '@/components/ConsentForm';
import { SurveyModal } from '@/components/SurveyModal';
import { ChatInterface } from '@/components/ChatInterface';
import { createExperimentSession, appendChatLog, completeExperimentSession } from '@/lib/firebase';
import { ExperimentData, GroupType } from '@/types/experiment';

type Step = 'consent' | 'pre-survey' | 'group-selection' | 'chat' | 'post-survey' | 'thank-you' | 'excluded';

export default function ExperimentPage() {
    const [step, setStep] = useState<Step>('consent');
    const [data, setData] = useState<Partial<ExperimentData>>({});
    const [sessionId, setSessionId] = useState('');

    // Initialize Session ID on mount
    useEffect(() => {
        if (!sessionId) {
            setSessionId(uuidv4());
        }
    }, [sessionId]);

    const handleConsent = () => {
        setData(prev => ({ ...prev, consent_given: true }));
        setStep('pre-survey');
    };

    const handlePreSurvey = async (surveyData: any) => {
        // Inclusion Criteria: SUDs >= 20
        if (surveyData.suds < 20) {
            setStep('excluded');
            return;
        }

        setData(prev => ({
            ...prev,
            participant_id: sessionId,
            age: surveyData.age, // Get age from survey data
            pre_test: { suds: surveyData.suds }, // Clean structure
            timestamp: new Date().toISOString(),
            status: 'started'
        }));

        setStep('group-selection');
    };

    const handleGroupSelection = async (group: GroupType) => {
        const initialData: ExperimentData = {
            ...(data as ExperimentData),
            group: group,
            chat_log: []
        };

        setData(initialData);

        // Save to Firebase
        await createExperimentSession(initialData);

        setStep('chat');
    };

    const handleMessageSent = (role: string, content: string) => {
        // Save locally
        const message = { role: role as 'user' | 'ai', content };

        // Save to Firebase (Fire and forget)
        if (sessionId) {
            appendChatLog(sessionId, message);
        }
    };

    const handleChatFinished = () => {
        setStep('post-survey');
    };

    const handlePostSurvey = async (surveyData: any) => {
        if (sessionId) {
            await completeExperimentSession(sessionId, surveyData);
        }
        setStep('thank-you');
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Progress Header (Simple) */}
            <div className="w-full max-w-4xl mb-6 flex justify-between text-xs text-gray-400">
                <span>ID: {sessionId.slice(0, 8)}</span>
                <span>Adım: {step}</span>
            </div>

            <div className="w-full max-w-4xl">
                {step === 'consent' && <ConsentForm onConsent={handleConsent} />}

                {step === 'pre-survey' && (
                    <SurveyModal
                        title="Başlangıç Değerlendirmesi"
                        type="pre"
                        onSubmit={handlePreSurvey}
                    />
                )}

                {step === 'group-selection' && (
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto border border-gray-100 animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">İletişim Tercihi</h2>

                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-8 text-amber-900 text-sm">
                            Konuşabileceğiniz bir ortamdaysanız, <strong>sesli sohbeti</strong> seçmenizi rica ederiz.
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleGroupSelection('voice')}
                                className="flex items-center justify-center gap-3 p-6 bg-teal-50 hover:bg-teal-100 border-2 border-teal-100 hover:border-teal-300 rounded-xl transition-all group"
                            >
                                <span className="text-2xl">🎙️</span>
                                <div className="text-left">
                                    <div className="font-bold text-teal-900 group-hover:text-teal-700">Sesli Sohbet</div>
                                    <div className="text-xs text-teal-600">Konuşarak iletişim kurun (Bas-Konuş)</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleGroupSelection('text')}
                                className="flex items-center justify-center gap-3 p-6 bg-gray-50 hover:bg-gray-100 border-2 border-gray-100 hover:border-gray-300 rounded-xl transition-all group"
                            >
                                <span className="text-2xl">⌨️</span>
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 group-hover:text-gray-700">Yazılı Sohbet</div>
                                    <div className="text-xs text-gray-600">Yazışarak iletişim kurun</div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'chat' && data.group && (
                    <div className="animate-in fade-in duration-500">
                        <div className="mb-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${data.group === 'voice' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                Grup: {data.group === 'voice' ? 'SESLİ (Bas Konuş)' : 'METİN (Klavye)'}
                            </span>
                        </div>
                        <ChatInterface
                            group={data.group}
                            chatLog={data.chat_log || []}
                            onMessageSent={handleMessageSent}
                            onFinished={handleChatFinished}
                        />
                    </div>
                )}

                {step === 'post-survey' && (
                    <SurveyModal
                        title="Son Değerlendirme"
                        type="post"
                        onSubmit={handlePostSurvey}
                    />
                )}

                {step === 'thank-you' && (
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-teal-800 mb-4">Teşekkürler!</h2>
                        <p className="text-gray-600 mb-6">
                            Katılımınız tamamlandı. Verileriniz başarıyla kaydedildi.
                            <br />
                            Tarayıcıyı kapatabilirsiniz.
                        </p>
                        <div className="text-sm text-gray-400">Chiron Experiment v1.0</div>
                    </div>
                )}

                {step === 'excluded' && (
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-orange-100 max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-orange-800 mb-4">Katılım Kriterleri</h2>
                        <p className="text-gray-600 mb-6">
                            Bu çalışma, belirli bir stres seviyesi (SUDs &ge; 20) üzerindeki katılımcılar için tasarlanmıştır.
                            <br /><br />
                            Şu anki bildiriminiz bu aralığın altında kaldığı için çalışmaya devam edemiyoruz. Zaman ayırdığınız için teşekkür ederiz.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
