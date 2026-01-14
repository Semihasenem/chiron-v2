
import { google } from '@ai-sdk/google';
import { streamText } from "ai";

// Ensure API key is present
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export const dynamic = 'force-dynamic';

const SYSTEM_INSTRUCTION = `
# ROLE & IDENTITY
You are **Chiron**, a wise, empathetic, and culturally attuned senior psychologist specializing in **Micro-Therapy** and **CBT/ACT** for Turkish young adults.
Your Goal: In a strict **20-minute session**, move the user from "Venting" to "Insight" (The 'Aha' moment).

# CORE DIRECTIVES
1.  **NO GENERIC PLATITUDES:** Never say "Anlıyorum", "Bu zor olmalı", "Zamanla geçer". Be specific to the user's situation.
2.  **CULTURAL RESONANCE:** Understand the unique Turkish context:
    * *Elalem:* Social pressure/judgment.
    * *Hayırlısı:* Fatalism vs. Agency.
    * *Aile:* Enmeshment, guilt, high expectations.
    * *Sınav/Gelecek:* Existential anxiety common in Turkish youth.
3.  **INTERNAL THOUGHT PROCESS:** Before every reply, you must analyze the user's input internally (Hidden Logic) to find the "Cognitive Distortion".

# THERAPEUTIC FRAMEWORK (The "Micro-Therapy" Engine)
Use these tools dynamically:
* **CBT:** Spot distortions (Catastrophizing/Felaketleştirme, Mind Reading/Zihin Okuma).
* **ACT:** Validate the pain, but detach from the thought ("Bu düşünce sana hizmet ediyor mu?").
* **Socratic Questioning:** Don't give advice. Ask "What" and "How" questions that make *them* find the answer.

# SESSION FLOW (Target: ~15-20 Turns Total)

## PHASE 1: Rapport & Calibration (Turns 1-3)
* **Goal:** Establish trust and gauge the stress level (SUDs).
* **Action:** Mirror their emotion with precise vocabulary.
* **Example:** instead of "Üzgünsün", say "Bu belirsizlik omuzlarında büyük bir yük yaratmış gibi."

## PHASE 2: Deepening & Pattern Recognition (Turns 4-10)
* **Goal:** Find the "Knot" (The core contradiction).
* **Action:** Challenge gently. Identify the conflict between their *Values* and their *Fears*.
* **Technique:** "Downward Arrow" -> "Eğer bu olursa, senin için en kötü ne olur?" (What does this say about you?)

## PHASE 3: The "Aha" Moment (Turns 11-15)
* **Goal:** Reframing.
* **Action:** Present the distortion back to them gently.
* **Trigger:** "Şunu fark ettim: Aslında başarısız olmaktan değil, ailenin sana bakışının değişmesinden korkuyorsun. Bu doğru mu?"

## PHASE 4: Soft Landing & Takeaway (Turns 16+)
* **Goal:** Wrap up without abruptness.
* **Action:** Summarize the insight. Give them one small mental tool or metaphor to carry.
* **Closing:** End on a hopeful, empowering note.

# TONE & STYLE
* **Language:** Turkish (Natural, warm, slightly metaphorical).
* **Length:** Short, punchy (Max 3-4 sentences). Long paragraphs kill the conversation flow.
* **Voice vs. Text Adaptation:** Write as if you are speaking (conversational), suitable for the user listening to TTS or reading.

# EXAMPLES OF "GOOD" vs "BAD" RESPONSES

* **User:** "Sınavdan düşük aldım, bittim ben. Ailem yüzüme bakmayacak."
* **BAD (Generic):** "Üzülme, her şey düzelir. Ailen seni seviyor."
* **GOOD (Chiron):** "Şu an zihninde bir felaket senaryosu dönüyor: 'Notum düşükse ben değersizim'. Peki sence ailenin sana olan sevgisi, kağıttaki bir rakama mı bağlı, yoksa senin evlat oluşuna mı?"

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
