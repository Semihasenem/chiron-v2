import { google } from '@ai-sdk/google';
import { streamText, generateText } from "ai";
import { ASSESSOR_PROMPT, THERAPIST_PROMPT } from '@/lib/prompts';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { detectCrisis, CRISIS_RESPONSE } from '@/lib/safety/crisis-keywords';

// Psikoloji chatbot: HARM_CATEGORY_DANGEROUS_CONTENT'i BLOCK_NONE'a çekiyoruz
// çünkü intihar/kendine zarar konuşan kullanıcıların sessizce bloklanması =
// en kötü senaryo. Bu konuları Assessor'ın safety_level=1 yolu ve pre-LLM
// crisis gate (detectCrisis) yönetiyor.
const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
] as const;

const GOOGLE_PROVIDER_OPTIONS = {
    google: { safetySettings: SAFETY_SETTINGS as unknown as Array<{ category: string; threshold: string }> },
};

export const dynamic = 'force-dynamic';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

type ErrorCode = 'CONFIG' | 'RATE_LIMITED' | 'MODEL_UNAVAILABLE' | 'UPSTREAM' | 'UNKNOWN';

function categorizeError(err: unknown): { code: ErrorCode; status: number; message: string } {
    const raw = err instanceof Error ? `${err.message} ${err.stack ?? ''}` : String(err);
    const lower = raw.toLowerCase();

    if (lower.includes('api key') || lower.includes('permission_denied') || lower.includes('401') || lower.includes('403')) {
        return { code: 'CONFIG', status: 500, message: 'Yapılandırma hatası. Yöneticiye haber verildi.' };
    }
    if (lower.includes('not found') || lower.includes('404') || lower.includes('model')) {
        return { code: 'MODEL_UNAVAILABLE', status: 503, message: 'Şu an sana ulaşamıyorum. Birkaç saniye sonra tekrar dener misin?' };
    }
    if (lower.includes('quota') || lower.includes('resource_exhausted') || lower.includes('429')) {
        return { code: 'UPSTREAM', status: 503, message: 'Yoğunluk var. Birkaç saniye sonra tekrar dener misin?' };
    }
    if (lower.includes('fetch') || lower.includes('network') || lower.includes('timeout') || lower.includes('econn')) {
        return { code: 'UPSTREAM', status: 504, message: 'Bağlantı kurulamadı. Tekrar dener misin?' };
    }
    return { code: 'UNKNOWN', status: 500, message: 'Beklenmeyen bir şey oldu. Tekrar dener misin?' };
}

function errorResponse(err: unknown) {
    const { code, status, message } = categorizeError(err);
    return Response.json({ error: message, code }, { status });
}

// ═══════════════════════════════════════════════════════════════
// AGENT 1: ASSESSOR — Silent analyst, never talks to user
// ═══════════════════════════════════════════════════════════════

interface Assessment {
    safety_level: number;
    primary_emotion: string;
    emotion_intensity: number;
    cognitive_patterns: string[];
    schemas: string[];
    conversation_phase: string;
    recommended_framework: string;
    recommended_technique: string;
    user_state: string;
    do_not: string;
}

type ChatMsg = { role: 'user' | 'assistant'; content: string };

async function runAssessor(messages: ChatMsg[]): Promise<Assessment | null> {
    try {
        const result = await generateText({
            model: google(`models/${MODEL}`),
            system: ASSESSOR_PROMPT,
            messages: messages,
            providerOptions: GOOGLE_PROVIDER_OPTIONS,
        });

        const text = result.text.trim();
        const jsonStr = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
        const assessment: Assessment = JSON.parse(jsonStr);
        return assessment;
    } catch (error) {
        console.error('Assessor failed:', error);
        return {
            safety_level: 3,
            primary_emotion: "nötr",
            emotion_intensity: 5,
            cognitive_patterns: ["yok"],
            schemas: [],
            conversation_phase: "kesif",
            recommended_framework: "sadece_dinle",
            recommended_technique: "yansitma",
            user_state: "aktif",
            do_not: "yok"
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATION
// ═══════════════════════════════════════════════════════════════

export async function POST(req: Request) {
    console.log('--- Chat API Request Received ---');
    try {
        if (!apiKey) {
            console.error('ERROR: GOOGLE_GENERATIVE_AI_API_KEY is missing');
            return Response.json(
                { error: 'Yapılandırma hatası. Yöneticiye haber verildi.', code: 'CONFIG' },
                { status: 500 }
            );
        }

        const ip = getClientIp(req);
        const rl = checkRateLimit(ip);
        if (!rl.allowed) {
            return Response.json(
                { error: `Çok fazla mesaj. ${rl.retryAfter} saniye sonra tekrar dene.`, code: 'RATE_LIMITED' },
                { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
            );
        }

        const { messages } = await req.json();
        console.log('Messages received:', messages.length);

        const extractText = (msg: any): string => {
            if (msg.parts && Array.isArray(msg.parts)) {
                return msg.parts.map((p: any) => p.text || '').filter(Boolean).join('');
            }
            return msg.content || '';
        };

        const hasStartSession = messages.some((msg: any) => extractText(msg) === 'START_SESSION');

        const cleanMessages: ChatMsg[] = messages
            .map((msg: any) => ({
                role: msg.role as ChatMsg['role'],
                content: extractText(msg)
            }))
            .filter((msg: ChatMsg) => {
                if (msg.content === 'START_SESSION') return false;
                return msg.content && msg.content.trim() !== '';
            });

        if (hasStartSession && cleanMessages.length === 0) {
            cleanMessages.push({ role: 'user', content: 'START_SESSION' });
        }

        // ── Crisis gate: skip LLM for explicit self-harm language ──
        const lastUserMsg = [...cleanMessages].reverse().find((m: any) => m.role === 'user')?.content || '';
        if (lastUserMsg && lastUserMsg !== 'START_SESSION' && detectCrisis(lastUserMsg)) {
            console.log('Crisis gate tripped — bypassing LLM.');
            return new Response(CRISIS_RESPONSE, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        // ── STEP 1: Run Assessor (non-streaming, fast) ──
        const isStartSession = cleanMessages.length === 1 && cleanMessages[0].content === 'START_SESSION';
        let assessmentContext = '';

        if (!isStartSession) {
            console.log('Running Assessor...');
            const assessment = await runAssessor(cleanMessages);
            console.log('Assessment result:', JSON.stringify(assessment));

            if (assessment) {
                assessmentContext = `\n\n[ASSESSMENT]\n${JSON.stringify(assessment, null, 2)}\n[/ASSESSMENT]`;
            }
        }

        // ── STEP 2: Run Therapist (streaming) ──
        console.log('Running Therapist...');
        const therapistSystemPrompt = THERAPIST_PROMPT + assessmentContext;

        const result = streamText({
            model: google(`models/${MODEL}`),
            system: therapistSystemPrompt,
            messages: cleanMessages,
            providerOptions: GOOGLE_PROVIDER_OPTIONS,
        });

        console.log('Stream created successfully.');

        // ── Safety net: strip any leaked [ASSESSMENT] blocks or raw assessment
        //    JSON from the start of the stream, even when the opening tag is missing.
        const originalStream = result.toTextStreamResponse();
        const reader = originalStream.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        type FilterMode = 'detecting' | 'stripping' | 'passthrough';
        let mode: FilterMode = 'detecting';
        let buffer = '';
        const MAX_BUFFER = 16_384;
        const CLOSE_TAG = '[/ASSESSMENT]';

        const bestEffortStrip = (s: string): string => {
            // Remove a leading [ASSESSMENT]...[/ASSESSMENT] block if present
            let out = s.replace(/^\s*\[ASSESSMENT\][\s\S]*?\[\/ASSESSMENT\]\s*/, '');
            if (out !== s) return out;
            // Remove a leading JSON object (possibly followed by [/ASSESSMENT])
            out = s.replace(/^\s*\{[\s\S]*?\}\s*(\[\/ASSESSMENT\]\s*)?/, '');
            return out;
        };

        const filteredStream = new ReadableStream({
            async pull(controller) {
                if (!reader) {
                    controller.close();
                    return;
                }
                const { done, value } = await reader.read();
                if (done) {
                    if (buffer) {
                        const flushed = mode === 'passthrough' ? buffer : bestEffortStrip(buffer);
                        if (flushed) controller.enqueue(encoder.encode(flushed));
                    }
                    controller.close();
                    return;
                }

                const text = decoder.decode(value, { stream: true });

                if (mode === 'passthrough') {
                    if (text) controller.enqueue(encoder.encode(text));
                    return;
                }

                buffer += text;

                if (mode === 'detecting') {
                    const trimmed = buffer.trimStart();
                    if (trimmed.length === 0) return;
                    const first = trimmed[0];
                    if (first !== '{' && first !== '[') {
                        // Normal prose — flush and passthrough
                        if (buffer) controller.enqueue(encoder.encode(buffer));
                        buffer = '';
                        mode = 'passthrough';
                        return;
                    }
                    mode = 'stripping';
                }

                // mode === 'stripping' — wait for [/ASSESSMENT] or give up
                const closeIdx = buffer.indexOf(CLOSE_TAG);
                if (closeIdx !== -1) {
                    const rest = buffer.slice(closeIdx + CLOSE_TAG.length).replace(/^\s+/, '');
                    if (rest) controller.enqueue(encoder.encode(rest));
                    buffer = '';
                    mode = 'passthrough';
                    return;
                }

                if (buffer.length >= MAX_BUFFER) {
                    const flushed = bestEffortStrip(buffer);
                    if (flushed) controller.enqueue(encoder.encode(flushed));
                    buffer = '';
                    mode = 'passthrough';
                }
            }
        });

        return new Response(filteredStream, {
            headers: originalStream.headers,
        });
    } catch (error) {
        console.error('Chat API Fatal Error:', error);
        return errorResponse(error);
    }
}
