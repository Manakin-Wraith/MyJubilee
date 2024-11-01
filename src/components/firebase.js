// npm install firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdfNZWdVKWpaAx8Zs5xlrWAIowapa1CSE",
  authDomain: "myjubilee-7a2ec.firebaseapp.com",
  projectId: "myjubilee-7a2ec",
  storageBucket: "myjubilee-7a2ec.firebasestorage.app",
  messagingSenderId: "490033082685",
  appId: "1:490033082685:web:d4ce031ea08cbb401f1554",
  measurementId: "G-DYCDT44Z0H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);