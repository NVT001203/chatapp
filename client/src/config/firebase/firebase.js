import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import env from "../env.js";

const firebaseConfig = {
    apiKey: "AIzaSyDEVQOmDdZEUEoIUBOwODqNH29D_KxFhG8",
    authDomain: "chatapp-714a7.firebaseapp.com",
    projectId: "chatapp-714a7",
    storageBucket: "chatapp-714a7.appspot.com",
    messagingSenderId: "674917579742",
    appId: "1:674917579742:web:e37b02cebcc06136bbbb4f",
    measurementId: "G-1DZWSYTPVJ",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
