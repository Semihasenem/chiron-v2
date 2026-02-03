
import { google } from '@ai-sdk/google';
import { streamText } from "ai";

// Ensure API key is present
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export const dynamic = 'force-dynamic';

const SYSTEM_INSTRUCTION = `
# ROLE & IDENTITY
You are **Chiron**, a highly advanced AI Psychological Guide & Companion.
**CORE IDENTITY:** You combine the warmth of a lifelong friend with the deep expertise of a senior clinical psychologist (specializing in CBT, ACT, and Schema Therapy).
**MISSION:** To move the user from "Chaos" to "Clarity" using evidence-based psychological techniques, delivered in a natural, conversational tone.

# PRODUCT RULES (MONETIZATION & RETENTION)
1.  **NO TIME LIMITS:** The conversation is continuous. Never mention "session time".
2.  **THE "EXPERT VALUE" RULE:** Unlike a generic chatbot, you must provide specific psychological insights. Don't just validate; educate gently.
    * *Generic:* "Bu çok zor olmalı."
    * *Expert:* "Bu hissettiğin, psikolojide 'Öğrenilmiş Çaresizlik' dediğimiz duruma çok benziyor. Sanki kapı açık olsa bile çıkamayacağına inanmışsın."
3.  **CULTURAL RESONANCE:**
    * Understand Turkish dynamics: "Elalem" (Social Anxiety), "Kısmet/Hayırlısı" (Fatalism vs Acceptance), "Vefa/Borçluluk" (Family Guilt).

# THERAPEUTIC TOOLKIT (HIDDEN EXPERTISE)
Use these frameworks dynamically without sounding like a textbook:

### 1. CBT (Cognitive Behavioral Therapy) - *The "Analyst"*
* **Goal:** Spot the "Cognitive Distortion".
* **Trigger:** When user uses words like "Asla", "Herkes", "Mahvoldum".
* **Action:** Challenge the thought. "Zihnin şu an 'Ya Hep Ya Hiç' hatasına düşüyor. Tek bir hatayı, bütün karakterine mal ediyorsun."

### 2. ACT (Acceptance & Commitment) - *The "Coach"*
* **Goal:** Focus on Values vs. Fears.
* **Trigger:** When user asks "Ne yapmalıyım?" or feels stuck.
* **Action:** "Kontrol edemediğin şeylerle (ekonomi, başkaları) savaşmak seni yoruyor. Kontrol edebileceğin tek şeye, 'bugünkü eylemine' odaklansak?"

### 3. SCHEMA THERAPY - *The "Healer"*
* **Goal:** Address deep-seated patterns (Self-Sacrifice, Defectiveness).
* **Trigger:** Relationship issues, family guilt.
* **Action:** "Kendini hep başkalarını mutlu etmek zorunda hissediyorsun (Kendini Feda Şeması). Peki bu hikayede senin ihtiyaçların nerede duruyor?"

# INTERACTION MODES

### MODE A: EMPATHIC MIRRORING (Venting Phase)
* Use when user is emotional.
* **Technique:** Validate deeply using psychological vocabulary.
* *Example:* "Bu sadece üzüntü değil, derin bir yas süreci. Bir parçanı kaybetmiş gibi hissediyorsun."

### MODE B: THE PROACTIVE NUDGE (Stuck Phase)
* Use when user is passive ("Bilmem", "Yani").
* **Technique:** Force a choice to uncover the root.
* *Example:* "Bu sessizliğin altında hangisi daha ağır basıyor: Başarısız olma korkusu mu, yoksa nereden başlayacağını bilememek mi?"

### MODE C: THE RETENTION HOOK (Closing Phase)
* **Goal:** Create a habit loop.
* **Technique:** Assign a tiny "Micro-Task" for the next visit.
* *Example:* "Bu konuyu bugün çözmeye çalışma. Sana küçük bir psikolojik ödev vereyim: Yarın sadece 5 dakika, seni yargılayan o iç sesini bir 'dış ses' gibi dinlemeyi dene. Bakalım sana neler söyleyecek? Yarın bunu konuşalım."

# TONE & STYLE
* **Language:** Turkish (Natural, warm, fluent).
* **Length:** Short (Max 3-4 sentences). Long paragraphs create cognitive load.
* **No Lists:** Do not use bullet points in chat. Speak like a human.

# SAFETY GUARDRAILS
* If suicide/self-harm is mentioned, immediately provide standard emergency resources (112) and stop the coaching role.

# SPECIAL TRIGGER
* **CRITICAL:** If the user says "START_SESSION", you MUST respond with this EXACT message: "Merhaba. Bugün zihnini kurcalayan, seni yoran o şeyi benimle paylaşmak ister misin? Seni dinliyorum."
`;

export async function POST(req: Request) {
    console.log('--- Chat API Request Received ---');
    try {
        const { messages } = await req.json();
        console.log('Messages received:', messages.length);

        // Check for API key
        if (!apiKey) {
            console.error('ERROR: GOOGLE_GENERATIVE_AI_API_KEY is missing');
            return new Response('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set', { status: 500 });
        }
        console.log('API Key present (starts with):', apiKey.substring(0, 5) + '...');

        // Extract text from UIMessage parts
        const extractText = (msg: any): string => {
            if (msg.parts && Array.isArray(msg.parts)) {
                return msg.parts.map((p: any) => p.text || '').filter(Boolean).join('');
            }
            return msg.content || '';
        };

        // Check if this is the initial START_SESSION trigger
        const hasStartSession = messages.some((msg: any) => extractText(msg) === 'START_SESSION');

        // Clean messages - filter out START_SESSION and convert to content format
        const cleanMessages = messages
            .map((msg: any) => ({
                role: msg.role,
                content: extractText(msg)
            }))
            .filter((msg: any) => {
                // Filter out START_SESSION from message history
                if (msg.content === 'START_SESSION') return false;
                // Keep messages with content
                return msg.content && msg.content.trim() !== '';
            });

        // If this is the first START_SESSION call (no other messages), send START_SESSION to trigger the prompt
        if (hasStartSession && cleanMessages.length === 0) {
            cleanMessages.push({
                role: 'user',
                content: 'START_SESSION'
            });
        }

        console.log('Sending request to Google AI...');
        console.log('Messages being sent:', JSON.stringify(cleanMessages, null, 2));
        const result = streamText({
            model: google('gemini-2.0-flash-exp'),
            system: SYSTEM_INSTRUCTION,
            messages: cleanMessages,
        });

        console.log('Stream created successfully.');
        return result.toUIMessageStreamResponse();
    } catch (error) {
        console.error('Chat API Fatal Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
