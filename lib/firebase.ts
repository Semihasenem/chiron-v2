
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Collection Reference
export const CONVERSATIONS_COLLECTION = "conversations";

/**
 * Creates a new conversation session.
 */
export async function createConversationSession(sessionId: string, metadata?: any) {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, sessionId);
    await setDoc(docRef, {
      session_id: sessionId,
      created_at: new Date().toISOString(),
      messages: [],
      ...metadata
    });
    return true;
  } catch (error) {
    console.error("Error creating conversation session:", error);
    return false;
  }
}

/**
 * Appends a new message to the conversation.
 */
export async function appendMessage(sessionId: string, message: { role: string; content: string; timestamp?: string }) {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, sessionId);
    await updateDoc(docRef, {
      messages: arrayUnion({
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      }),
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error appending message:", error);
  }
}

/**
 * Updates conversation session metadata.
 */
export async function updateConversationSession(sessionId: string, updates: any) {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, sessionId);
    await updateDoc(docRef, {
      ...updates,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
  }
}
