import { google } from '@ai-sdk/google';
import { streamText, generateText } from "ai";
import { ASSESSOR_PROMPT, THERAPIST_PROMPT } from '@/lib/prompts';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

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

async function runAssessor(messages: Array<{ role: string; content: string }>): Promise<Assessment | null> {
    try {
        const result = await generateText({
            model: google(`models/${MODEL}`),
            system: ASSESSOR_PROMPT,
            messages: messages,
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

        const cleanMessages = messages
            .map((msg: any) => ({
                role: msg.role,
                content: extractText(msg)
            }))
            .filter((msg: any) => {
                if (msg.content === 'START_SESSION') return false;
                return msg.content && msg.content.trim() !== '';
            });

        if (hasStartSession && cleanMessages.length === 0) {
            cleanMessages.push({ role: 'user', content: 'START_SESSION' });
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
        });

        console.log('Stream created successfully.');

        // ── Safety net: strip any leaked [ASSESSMENT] blocks from the stream ──
        const originalStream = result.toTextStreamResponse();
        const reader = originalStream.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        const filteredStream = new ReadableStream({
            async pull(controller) {
                if (!reader) {
                    controller.close();
                    return;
                }
                const { done, value } = await reader.read();
                if (done) {
                    controller.close();
                    return;
                }
                let text = decoder.decode(value, { stream: true });
                text = text.replace(/\[ASSESSMENT\][\s\S]*?\[\/ASSESSMENT\]\s*/g, '');
                text = text.replace(/\[ASSESSMENT\][\s\S]*/g, '');
                if (text.length > 0) {
                    controller.enqueue(encoder.encode(text));
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
