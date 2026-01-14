export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return new Response('Text is required', { status: 400 });
        }

        const speechKey = process.env.AZURE_SPEECH_KEY;
        const speechRegion = process.env.AZURE_SPEECH_REGION;

        if (!speechKey || !speechRegion) {
            console.error('Azure Speech credentials missing');
            return new Response('TTS service not configured', { status: 500 });
        }

        // Get access token
        const tokenResponse = await fetch(
            `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
            {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': speechKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        if (!tokenResponse.ok) {
            console.error('Failed to get Azure token:', tokenResponse.status);
            return new Response('Failed to authenticate with TTS service', { status: 500 });
        }

        const token = await tokenResponse.text();

        // Generate speech using SSML for better control
        // Add natural pauses for therapeutic tone
        const processedText = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\./g, '.<break time="400ms"/>')  // Pause after sentences
            .replace(/\?/g, '?<break time="500ms"/>')  // Longer pause after questions
            .replace(/,/g, ',<break time="200ms"/>');  // Short pause after commas

        const ssml = `
            <speak version='1.0' xml:lang='tr-TR'>
                <voice name='tr-TR-EmelNeural'>
                    <prosody rate='0.88' pitch='0%'>
                        ${processedText}
                    </prosody>
                </voice>
            </speak>
        `;

        const ttsResponse = await fetch(
            `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                },
                body: ssml,
            }
        );

        if (!ttsResponse.ok) {
            console.error('TTS generation failed:', ttsResponse.status);
            return new Response('Failed to generate speech', { status: 500 });
        }

        const audioBuffer = await ttsResponse.arrayBuffer();

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
