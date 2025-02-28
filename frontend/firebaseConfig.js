// Install dependencies: expo install firebase
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnXmCL4M8RCvcgdadH1AkMdH4j-NYgYKY",
  authDomain: "childsup-42ec5.firebaseapp.com",
  projectId: "childsup-42ec5",
  storageBucket: "childsup-42ec5.firebasestorage.app",
  messagingSenderId: "207609905526",
  appId: "1:207609905526:web:27731eb8d776c0faa4ba57"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };