import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCAUE01rQavo1vIKeZpvML_SDVLt6bd_qw",
  authDomain: "campus-arena-a7a07.firebaseapp.com",
  projectId: "campus-arena-a7a07",
  storageBucket: "campus-arena-a7a07.firebasestorage.app",
  messagingSenderId: "203169956018",
  appId: "1:203169956018:web:1f51813b2708fe15a209ab"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;