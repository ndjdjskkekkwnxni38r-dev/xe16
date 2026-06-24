import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBuLnluWGTWpnrOE4ft0vAf-EgfJuD8HrM",
  authDomain: "app-xe-16.firebaseapp.com",
  projectId: "app-xe-16",
  storageBucket: "app-xe-16.firebasestorage.app",
  messagingSenderId: "427053383588",
  appId: "1:427053383588:android:5d4638e8e3c40ebeb3cb31",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
