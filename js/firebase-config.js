import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmsHZjHTCoG6PLiD-Td2G7_7TjyXbuGSE",
  authDomain: "stadeline-edu.firebaseapp.com",
  projectId: "stadeline-edu",
  storageBucket: "stadeline-edu.firebasestorage.app",
  messagingSenderId: "390059852686",
  appId: "1:390059852686:web:5c3c34a5b0be3b52385adf",
  measurementId: "G-81NEVRXM0Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// EXPORT all functions needed across your app
export { 
    db, 
    doc, 
    getDoc, 
    updateDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs 
};