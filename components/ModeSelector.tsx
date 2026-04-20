'use client';

import React from 'react';
import { UserMode } from '@/types/session';

interface ModeSelectorProps {
  onModeSelect: (mode: UserMode) => void;
}

export function ModeSelector({ onModeSelect }: ModeSelectorProps) {
  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-light text-sage-800 mb-2">Chiron</h1>
          <p className="text-sage-600">Nasıl iletişim kurmak istersin?</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onModeSelect('text')}
            className="w-full p-6 bg-white rounded-2xl shadow-sm border border-sage-200 hover:border-sage-400 transition-colors text-left"
          >
            <div className="text-lg font-medium text-sage-800">Yazarak</div>
            <p className="text-sage-500 text-sm mt-1">Mesajlaşarak sohbet et</p>
          </button>

          <button
            onClick={() => onModeSelect('voice')}
            className="w-full p-6 bg-white rounded-2xl shadow-sm border border-sage-200 hover:border-sage-400 transition-colors text-left"
          >
            <div className="text-lg font-medium text-sage-800">Konuşarak</div>
            <p className="text-sage-500 text-sm mt-1">Sesli sohbet et</p>
          </button>
        </div>
      </div>
    </div>
  );
}
