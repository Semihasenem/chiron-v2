'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Info, Shield, ArrowRight, User } from 'lucide-react';

export default function InfoPage() {
    return (
        <main className="min-h-screen bg-sage-50 font-sans text-slate-800 flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8 border border-sage-100"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Info size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-sage-900">Araştırma Hakkında</h1>
                    <p className="text-slate-500 text-lg">
                        Yapay Zeka Destekli Terapötik Uygulamalarda İletişim Modunun (Yazılı/Sözlü) Duygu Düzenleme Verimliliği Üzerindeki Etkisi Çalışması
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-sage-50 rounded-xl">
                        <User className="w-6 h-6 text-sage-600 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-sage-800">Araştırma Sorumlusu</h3>
                            <p className="text-slate-600">Semiha Çelik </p>
                            <p className="text-sm text-slate-500 mt-1">Marmara Üniversitesi Psikoloji (İngilizce) Bölümü 3. Sınıf</p>
                        </div>
                    </div>

                    <div className="prose prose-sage text-slate-600 leading-relaxed">
                        <p>
                            Bu çalışmanın amacı, yapay zeka destekli bir sohbet arayüzü (Chiron) ile iletişimde, iletişim yönteminin (yazılı/sözlü) duygu düzenleme verimliliği üzerindeki etkisini incelemektir. Katılımınız yaklaşık **20 dakika** sürecektir.
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t border-sage-100 flex justify-center">
                    <Link
                        href="/chat"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-teal-600 text-white rounded-xl text-lg font-medium transition-all hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/20 active:scale-95"
                    >
                        Araştırmaya Katıl
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
