import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIoVaFGGDRXdSNdDKeeyTudTXnBwy1JOA",
  authDomain: "lol-account-manager-3a94e.firebaseapp.com",
  projectId: "lol-account-manager-3a94e",
  storageBucket: "lol-account-manager-3a94e.firebasestorage.app",
  messagingSenderId: "247446295075",
  appId: "1:247446295075:web:46e597809349e722685796",
  measurementId: "G-T9LK0H49TL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
