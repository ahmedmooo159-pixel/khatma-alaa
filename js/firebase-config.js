// Firebase & Supabase Sync Configuration File
// Real Firebase credentials for the Sadaqah Jariyah project

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAqinYItzBY4zQdBb3KqIdILWkT47Vs1TQ",
  authDomain: "sad2a-ef9db.firebaseapp.com",
  projectId: "sad2a-ef9db",
  storageBucket: "sad2a-ef9db.firebasestorage.app",
  messagingSenderId: "30455876228",
  appId: "1:30455876228:web:7c15fae804fd598399d0d1",
  measurementId: "G-0EG1WRV075",
  databaseURL: "https://sad2a-ef9db-default-rtdb.firebaseio.com"
};

// Supabase Alternative Config (Optional)
export const SUPABASE_CONFIG = {
  url: "https://your-supabase-url.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};

export const IS_FIREBASE_ENABLED = FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY";
export const IS_SUPABASE_ENABLED = SUPABASE_CONFIG.anonKey !== "YOUR_SUPABASE_ANON_KEY";
