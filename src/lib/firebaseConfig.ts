// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBGQq2bF3tawzdeJFnUKPxrL6IY7MTQXUE",
  authDomain: "fitjournalai.firebaseapp.com",
  projectId: "fitjournalai",
  storageBucket: "fitjournalai.firebasestorage.app",
  messagingSenderId: "928808625672",
  appId: "1:928808625672:web:43108e8d951bd69be4d3bd"
};

// Validate that environment variables are set
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing in environment variables.");
}
if (!firebaseConfig.authDomain) {
  console.error("Firebase Auth Domain is missing in environment variables.");
}
// Add similar checks for other required variables if needed

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use the existing app if already initialized
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
