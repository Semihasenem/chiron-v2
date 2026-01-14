
import React from 'react';

interface ConsentFormProps {
    onConsent: () => void;
}

export function ConsentForm({ onConsent }: ConsentFormProps) {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-sm rounded-lg border border-gray-100">
            <h1 className="text-2xl font-bold text-teal-800 mb-6 text-center">BİLGİLENDİRME ONAM FORMU</h1>

            <div className="prose prose-sm text-gray-700 mb-8 max-h-[60vh] overflow-y-auto pr-2">
                <h3 className="text-lg font-semibold text-teal-700 mt-4">Çalışmanın Adı</h3>
<p>Yapay Zeka Destekli Terapötik Uygulamalarda İletişim Modunun (Yazılı/Sözlü) Duygu Düzenleme Verimliliği Üzerindeki Etkisi Çalışması</p>

                <h3 className="text-lg font-semibold text-teal-700 mt-4">Çalışmanın Amacı</h3>
                <p>Bu araştırma, yapay zeka destekli bir terapötik ajanla (Chiron) etkileşim modunun (konuşma veya yazışma) duygu düzenleme ve bilişsel çaba üzerindeki etkisini analiz etmeyi amaçlamaktadır.</p>

                <h3 className="text-lg font-semibold text-teal-700 mt-4">Prosedür</h3>
                <p>Katılmayı kabul ederseniz, aşağıdaki adımları tamamlamanız istenecektir:</p>
                <ol className="list-decimal pl-5 space-y-2">
                    <li><strong>Stresli Bir Olayı Hatırlama:</strong> Son 30 gün içinde yaşadığınız, sizde stres veya kaygı yaratan bir olayı zihninizde canlandırmanız ve o anki huzursuzluk seviyenizi puanlamanız istenecektir.</li>
                    <li><strong>Sıkıntı Düzeyini Puanlama:</strong> Mevcut stres seviyenizi 0-100 arası bir ölçekte puanlayacaksınız.</li>
                    <li><strong>Müdahale:</strong> "Chiron" adlı AI asistanı ile yaklaşık <strong>20 dakika</strong> etkileşime gireceksiniz. Ya <strong>yazışarak</strong> ya da <strong>konuşarak</strong> iletişim kuracaksınız.</li>
                    <li><strong>Son Değerlendirme:</strong> Etkileşimden sonra tekrar stres seviyenizi ve harcadığınız zihinsel çabayı puanlayacaksınız.</li>
                </ol>
                <p className="font-medium mt-2">Toplam süre yaklaşık 20 dakikadır.</p>

                <h3 className="text-lg font-semibold text-teal-700 mt-4">Gizlilik</h3>
                <p>Cevaplarınız kesinlikle gizli tutulacaktır. İsminiz gibi kişisel bilgiler istenmeyecek ve verilerinizle eşleştirilmeyecektir.</p>

                <h3 className="text-lg font-semibold text-teal-700 mt-4">Riskler ve Rahatsızlıklar</h3>
                <p>Çalışma, yakın zamanda yaşanan stresli bir olayı hatırlamayı içerir ve bu da geçici duygusal rahatsızlığa veya sıkıntıya neden olabilir. Bununla birlikte, yapay zeka ajanıyla etkileşimin destekleyici nitelikte olması beklenmektedir. Kendinizi bunalmış hissederseniz, deneyi istediğiniz zaman durdurabilirsiniz.</p>

                <h3 className="text-lg font-semibold text-teal-700 mt-4">Faydalar</h3>
                <p>Katılımın doğrudan maddi bir faydası yoktur. Bununla birlikte, katılımınız daha iyi ruh sağlığı uygulamaları ve yapay zeka araçları tasarlamamıza yardımcı olabilir. Bazı katılımcılar, yapay zeka ajanıyla etkileşimin duygularını işleme konusunda faydalı olduğunu düşünebilir.</p>

                <h3 className="text-lg font-semibold text-teal-700 mt-4">Gönüllülük</h3>
                <p>Katılım tamamen gönüllülüdür. İstediğiniz zaman herhangi bir olumsuz sonuç olmaksızın deneyi bırakabilirsiniz.</p>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onConsent}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                    Okudum, Kabul Ediyorum
                </button>
            </div>
        </div>
    );
}
