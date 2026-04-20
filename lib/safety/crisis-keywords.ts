const CRISIS_KEYWORDS = [
    'intihar',
    'kendimi öldür',
    'kendimi oldur',
    'canıma kıy',
    'canima kiy',
    'yaşamak istemiyorum',
    'yasamak istemiyorum',
    'kendime zarar',
    'bıçakla kendi',
    'bicakla kendi',
    'ilaç içip öl',
    'ilac icip ol',
    'atlamak istiyorum',
    'kendimi asacağım',
    'kendimi asacagim',
    'ölmek istiyorum',
    'olmek istiyorum',
    'hayatıma son',
    'hayatima son',
    'suicide',
    'kill myself',
    'end it all',
    'self harm',
    'self-harm',
];

export function detectCrisis(text: string): boolean {
    const lower = text.toLowerCase();
    return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

export const CRISIS_RESPONSE = `Söylediklerin beni endişelendirdi. Şu an yalnız olmamalısın.

Hemen arayabileceğin numaralar:
- 112 — Acil çağrı
- 182 — İntihar Önleme Hattı (24/7)
- ALO 113 — Türkiye Psikolojik Danışma ve Rehberlik

Bunlardan birini şimdi arar mısın? Ben de buradayım, ama şu an bir uzmana ulaşman çok önemli.`;
