// 1. Only import the initialized database variable from your local configuration
import { db } from "./firebase-config.js";

// 2. Import the required database engine methods from the official Google Firebase CDN
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.handlePortalLogin = async function(event) {
    event.preventDefault();
    
    const studentId = document.getElementById("loginStudentId").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    
    try {
        // Point directly to the document name card in the 'students' collection
        const studentDocRef = doc(db, "students", studentId);
        const docSnap = await getDoc(studentDocRef);
        
        if (!docSnap.exists()) {
            alert("Login Failed:\nThe Student ID you provided does not exist in our system records.");
            return;
        }
        
        const studentData = docSnap.data();
        
        // Validate password parameters matching exactly
        if (studentData.password !== password) {
            alert("Login Failed:\nIncorrect portal entry password sequence.");
            return;
        }
        
        // Provision active session token key for the dashboard route guard
        sessionStorage.setItem("loggedStudentId", studentId);
        
        alert(`Access Granted!\nWelcome back to the portal, ${studentData.username || "Student"}.`);
        
        // Redirect into the newly revised dashboard engine grid
        window.location.href = "dashboard.html";
        
    } catch (error) {
        // Detailed log to the browser console to see any secondary security rules blocks
        console.error("Authentication crash log details:", error);
        alert("Database Connection Error: Unable to complete portal credential matching streams.");
    }
};