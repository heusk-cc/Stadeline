import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.handlePortalLogin = async function(event) {
    event.preventDefault();
    
    const studentId = document.getElementById("loginStudentId").value.trim();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const auth = getAuth();
    
    try {
        // 1. Authenticate the user
        await signInWithEmailAndPassword(auth, email, password);
        
        // 2. Fetch the specific document
        const studentDocRef = doc(db, "students", studentId);
        const docSnap = await getDoc(studentDocRef);
        
        if (!docSnap.exists()) {
            alert("Login Failed: Profile not found. Please check your Student ID.");
            return;
        }
        
        // 3. Success
        sessionStorage.setItem("loggedStudentId", studentId);
        alert("Access Granted! Welcome.");
        window.location.href = "dashboard.html";
        
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Failed: " + error.message);
    }
};
