// firebase.js
// إعداد Firebase (Modular SDK v12) - يُستخدم في كل الصفحات

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAlYR2SoKd18vdDgvRmIIRM5Q4p0v1FgDo",
  authDomain: "dr-eman-pharmacy-offers.firebaseapp.com",
  projectId: "dr-eman-pharmacy-offers",
  storageBucket: "dr-eman-pharmacy-offers.firebasestorage.app",
  messagingSenderId: "928652805434",
  appId: "1:928652805434:web:e13e77a3fe1713cf327c03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore Database
export const db = getFirestore(app);

// Authentication
export const auth = getAuth(app);
