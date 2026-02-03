
export type UserMode = "text" | "voice";

export interface ChatMessage {
    role: "user" | "ai";
    content: string;
    timestamp?: string;
}

export interface ConversationSession {
    session_id: string;
    mode: UserMode;
    messages: ChatMessage[];
    created_at: string;
    last_updated?: string;
    metadata?: {
        [key: string]: any;
    };
}
