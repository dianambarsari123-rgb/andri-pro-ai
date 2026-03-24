import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBoCbgnRm0PAa4yNmIUtk328TdJiczu14I",
  authDomain: "indigital-studio.firebaseapp.com",
  projectId: "indigital-studio",
  storageBucket: "indigital-studio.firebasestorage.app",
  messagingSenderId: "1053544146549",
  appId: "1:1053544146549:web:363ebf12c1f1fcc762fa3c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
