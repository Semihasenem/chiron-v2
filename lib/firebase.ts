
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
// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Collection Reference
export const EXPERIMENTS_COLLECTION = "experiments";

/**
 * Saves the initial experiment data (consent, baseline, group assignment).
 */
export async function createExperimentSession(data: any) {
  try {
    const docRef = doc(db, EXPERIMENTS_COLLECTION, data.participant_id);
    await setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error("Error creating experiment session:", error);
    return false;
  }
}

/**
 * Appends a new message to the chat log.
 */
export async function appendChatLog(participantId: string, message: { role: string; content: string }) {
  try {
    const docRef = doc(db, EXPERIMENTS_COLLECTION, participantId);
    await updateDoc(docRef, {
      chat_log: arrayUnion(message)
    });
  } catch (error) {
    console.error("Error appending chat log:", error);
  }
}

/**
 * Updates the experiment with post-test data.
 */
export async function completeExperimentSession(participantId: string, postData: any) {
  try {
    const docRef = doc(db, EXPERIMENTS_COLLECTION, participantId);
    await updateDoc(docRef, {
      post_test: postData,
      status: "completed",
      completed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error completing experiment:", error);
  }
}
