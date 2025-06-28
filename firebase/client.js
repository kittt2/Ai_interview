// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps} from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzyDnlzchD2JUJdsg6fFC4eEAhux5SIF8",
  authDomain: "interview-e5d3a.firebaseapp.com",
  projectId: "interview-e5d3a",
  storageBucket: "interview-e5d3a.firebasestorage.app",
  messagingSenderId: "1020013187864",
  appId: "1:1020013187864:web:1fd089f64e5982395c046d",
  measurementId: "G-R10GN8CEKX"
};

// Initialize Firebase
const app =!getApp.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);