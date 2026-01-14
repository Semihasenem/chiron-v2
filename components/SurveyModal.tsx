
import React, { useState } from 'react';

interface SurveyModalProps {
    title: string;
    type: 'pre' | 'post';
    onSubmit: (data: any) => void;
}

export function SurveyModal({ title, type, onSubmit }: SurveyModalProps) {
    const [suds, setSuds] = useState(50);
    const [age, setAge] = useState('');
    const [cognitiveLoad, setCognitiveLoad] = useState(3);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (type === 'pre') {
            if (!age || isNaN(Number(age))) {
                alert("Lütfen geçerli bir yaş giriniz.");
                return;
            }
            onSubmit({ suds, age: Number(age) });
        } else {
            onSubmit({ suds, cognitive_load: cognitiveLoad });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
                <h2 className="text-xl font-bold text-teal-800 mb-6 text-center">{title}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {type === 'pre' && (
                        <>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-900 mb-6">
                                <p className="font-medium mb-2">Yönerge:</p>
                                <p className="text-sm">
                                    Lütfen son 30 gün içinde yaşadığınız, sizde stres, kaygı veya huzursuzluk yaratan bir olayı veya durumu zihninizde canlı bir şekilde hatırlayın.
                                </p>
                                <p className="text-sm mt-2">
                                    Bu olayı şu an hatırladığınızda hissettiğiniz sıkıntı düzeyini aşağıdaki ölçekte puanlayın.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yaşınız</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="Örn: 22"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Şu anki huzursuzluk/sıkıntı/stres düzeyiniz: <span className="font-bold text-teal-600 text-lg">{suds}</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={suds}
                            onChange={(e) => setSuds(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0 (Hiç Sıkıntı Yok (Sakinim))</span>
                            <span>100 (Dayanılmaz Sıkıntı)</span>
                        </div>
                    </div>

                    {type === 'post' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Bu görüşme ne kadar zihinsel çaba gerektirdi? (1-5)
                            </label>
                            <div className="flex justify-between px-2">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setCognitiveLoad(val)}
                                        className={`w-10 h-10 rounded-full font-bold transition-all ${cognitiveLoad === val
                                            ? 'bg-teal-600 text-white scale-110 shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                                <span>Çok Az</span>
                                <span>Çok Fazla</span>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
                    >
                        Devam Et
                    </button>
                </form>
            </div>
        </div>
    );
}
