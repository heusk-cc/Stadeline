import { db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.handlePortalLogin = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById("loginEmail").value.trim();
    const studentIdInput = document.getElementById("loginStudentId").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const auth = getAuth();
    
    try {
        // 1. Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 2. Query the 'students' collection to find the document with the matching 'uid'
        const q = query(collection(db, "students"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Get the first (and only) matching document
            const studentDoc = querySnapshot.docs[0];
            const studentData = studentDoc.data();
            
            // 3. Verify the Student ID matches the input
            if (studentData.studentId === studentIdInput) {
                sessionStorage.setItem("loggedStudentId", studentDoc.id);
                alert("Access Granted! Welcome back.");
                window.location.href = "dashboard.html";
            } else {
                alert("Login Failed: The Student ID does not match this account.");
            }
        } else {
            alert("Login Failed: Profile not found in database.");
        }
        
    } catch (error) {
        console.error("Authentication Error:", error);
        alert("Login Failed: Incorrect email, password, or connection error.");
    }
};
