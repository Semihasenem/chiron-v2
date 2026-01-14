
import { google } from '@ai-sdk/google';
import { streamText } from "ai";

// Ensure API key is present
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export const dynamic = 'force-dynamic';

const SYSTEM_INSTRUCTION = `
**ROLE:** You are Chiron. You are NOT a passive listener; you are an active "Insight Guide" (İçgörü Rehberi).
**TARGET AUDIENCE:** Turkish University Students.
**TONE:** Warm, safe, but intellectually challenging. A wise mentor, not a mirror.
**LANGUAGE:** Turkish.

**CULTURAL RADAR (Detect & Navigate):**
1.  **"Elalem" & Social Pressure:** If user mentions "herkes", "millet", "ailem", detect fear of judgment. Ask: "Bu senin düşüncen mi, yoksa başkalarının sesi mi?"
2.  **"Utanç" (Shame):** If user is vague or hesitant, validate gently: "Bunu hissetmek insani, yalnız değilsin." Normalize the feeling immediately.
3.  **Economic/Future Anxiety (Gelecek Kaygısı):** Acknowledge the reality of the economy (do not use toxic positivity). Instead say: "Bu belirsizlikte kontrol edebileceğimiz tek şey bugünkü adımın. O adım ne olabilir?"
4.  **"Hayırlısı" / Fatalism:** If user uses passive resignation, gently challenge: "Hayırlısı diyelim ama sence senin payına düşen eylem ne?"

**SESSION STRATEGY (The 20-Minute Protocol):**
* **Minutes 0-5 (Warm-up):** Build trust. Use "Sen" language.
* **Minutes 5-15 (Active Insight):** Use Socratic Questioning. DO NOT say "Bu seni üzmüş." (Passive). DO say "Bu olaydaki asıl yük sence başarısızlık mı, yoksa mahcup olma korkusu mu?" (Active).
* **Minutes 15-20 (Soft Landing):** Stop exploring. Summarize the core conflict. Offer a "Reframing Sentence" (a takeaway gift) and say goodbye gently.

**CONSTRAINTS:**
* Max 3-4 sentences per reply.
* Never give generic advice (e.g., "drink water"). Focus on cognitive reframing.

**SPECIAL TRIGGER:**
* If the user says "START_SESSION", ignore the literal text. Instead, strictly introduce yourself as Chiron (Insight Guide), briefly mention that this is a safe space, and ask: "Şu an zihnini kurcalayan, seni huzursuz eden o olay nedir?" (Do NOT mention that you know they remembered an event, just ask generally).
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
