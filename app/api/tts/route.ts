export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return new Response('Text is required', { status: 400 });
        }

        const googleApiKey = process.env.GOOGLE_TTS_API_KEY;

        if (!googleApiKey) {
            console.error('Google TTS API key missing');
            return new Response('TTS service not configured', { status: 500 });
        }

        // Google Cloud Text-to-Speech API request
        const requestBody = {
            input: { text },
            voice: {
                languageCode: 'tr-TR',
                name: 'tr-TR-Wavenet-D', // Natural female voice
                ssmlGender: 'FEMALE'
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.95, // Slightly slower for clarity
                pitch: 0.0,
                volumeGainDb: 0.0
            }
        };

        const ttsResponse = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!ttsResponse.ok) {
            const errorText = await ttsResponse.text();
            console.error('Google TTS generation failed:', ttsResponse.status, errorText);
            return new Response('Failed to generate speech', { status: 500 });
        }

        const responseData = await ttsResponse.json();

        // Google returns base64 encoded audio
        const audioContent = responseData.audioContent;
        if (!audioContent) {
            console.error('No audio content in response');
            return new Response('Failed to generate speech', { status: 500 });
        }

        // Decode base64 to buffer
        const audioBuffer = Buffer.from(audioContent, 'base64');

        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('TTS API error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}
