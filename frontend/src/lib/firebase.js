// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config object
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Firebase Collections Structure:
/*
students: {
  id: string,
  name: string,
  email: string,
  field: string (informatique, mathematiques, sciences),
  password: string, // In production, use Firebase Auth
  has_completed_quiz: boolean,
  created_at: timestamp,
  last_test_date: timestamp
}

test_results: {
  id: auto-generated,
  student_id: string,
  field: string,
  total_time: number,
  cognitive_twin: {
    twin_id: string,
    metrics: object,
    timestamp: string
  },
  answers: array,
  raw_cognitive_data: object,
  surveillance_metrics: object,
  alerts_history: array,
  completed_at: timestamp,
  violations_count: number
}

sessions: {
  token: string (document ID),
  student_id: string,
  created_at: timestamp,
  expires_at: timestamp
}

surveillance_alerts: {
  id: auto-generated,
  student_id: string,
  message: string,
  type: string,
  timestamp: timestamp
}
*/