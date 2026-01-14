
export type GroupType = "text" | "voice";

export interface ChatMessage {
    role: "user" | "ai";
    content: string;
}

export interface PreTestMetrics {
    stressor?: string;
    suds: number; // 0-100
}

export interface PostTestMetrics {
    suds: number; // 0-100
    cognitive_load: number; // 1-5
}

export interface ExperimentData {
    participant_id: string;
    group: GroupType;
    consent_given: boolean;
    pre_test: PreTestMetrics;
    chat_log: ChatMessage[];
    post_test?: PostTestMetrics;
    timestamp: string;
    status: "started" | "completed";
}
