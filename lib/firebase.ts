import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ChatMessage } from '@/types/session';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

export async function createConversationSession(
  sessionId: string,
  data: { mode: string; status: string }
) {
  try {
    await setDoc(doc(db, 'conversations', sessionId), {
      ...data,
      messages: [],
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating session:', error);
  }
}

export async function appendMessage(sessionId: string, message: ChatMessage) {
  try {
    await updateDoc(doc(db, 'conversations', sessionId), {
      messages: arrayUnion(message),
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error appending message:', error);
  }
}
