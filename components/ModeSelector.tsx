'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mic } from 'lucide-react';
import { UserMode } from '@/types/session';

interface ModeSelectorProps {
  onModeSelect: (mode: UserMode) => void;
}

export function ModeSelector({ onModeSelect }: ModeSelectorProps) {
  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-sage-800 mb-4">
            Nasıl iletişim kurmak istersin?
          </h1>
          <p className="text-lg text-slate-600">
            Kendini en rahat hissettiğin yolu seç
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Text Mode */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onModeSelect('text')}
            className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-sage-500"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 group-hover:bg-sage-500 group-hover:text-white transition-colors">
                <MessageSquare size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-sage-800 mb-2">Yazarak</h3>
                <p className="text-slate-600 text-sm">
                  Düşüncelerini yazarak ifade et
                </p>
              </div>
            </div>
          </motion.button>

          {/* Voice Mode */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onModeSelect('voice')}
            className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-lavender-500"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-lavender-100 rounded-full flex items-center justify-center text-lavender-600 group-hover:bg-lavender-500 group-hover:text-white transition-colors">
                <Mic size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-sage-800 mb-2">Konuşarak</h3>
                <p className="text-slate-600 text-sm">
                  Sesli olarak paylaş
                </p>
              </div>
            </div>
          </motion.button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          İstediğin zaman modu değiştirebilirsin
        </p>
      </motion.div>
    </div>
  );
}
