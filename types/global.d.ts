
// Helper to extend Window interface for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}
