// FIX: Import auth from firebase-config instead of calling getAuth() without the app.
// FIX: Import doc/getDoc from firebase-config to eliminate redundant CDN imports.
import { db, auth, doc, getDoc } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.handlePortalLogin = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById("loginEmail").value.trim();
    // FIX: Normalize to uppercase so "dcsa-a1234-2627" matches "DCSA-A1234-2627"
    const studentIdInput = document.getElementById("loginStudentId").value.trim().toUpperCase();
    // FIX: Do NOT .trim() passwords — leading/trailing spaces are valid characters
    const password = document.getElementById("loginPassword").value;

    // FIX: Disable button during request to prevent duplicate submissions
    const btn = event.target.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Signing in…";
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const studentDocRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(studentDocRef);
        
        if (docSnap.exists()) {
            const studentData = docSnap.data();
            if (studentData.studentId === studentIdInput) {
                sessionStorage.setItem("loggedStudentId", user.uid);
                alert("Access Granted! Welcome back.");
                // FIX: Use clean URL path — "dashboard.html" breaks with cleanUrls: true in vercel.json
                window.location.href = "/dashboard";
            } else {
                alert("Login Failed: The Student ID does not match this account.");
                btn.disabled = false;
                btn.textContent = "Secure Sign In";
            }
        } else {
            alert("Login Failed: No student profile found. Please contact the registrar.");
            btn.disabled = false;
            btn.textContent = "Secure Sign In";
        }
    } catch (error) {
        console.error("Authentication Error:", error);

        // FIX: Handle modern Firebase error codes (SDK v9+ uses auth/invalid-credential,
        // not the older auth/wrong-password / auth/user-not-found split)
        const errorMessages = {
            'auth/invalid-credential':     "Login Failed: Incorrect email or password.",
            'auth/user-not-found':         "Login Failed: No account found with this email.",
            'auth/wrong-password':         "Login Failed: Incorrect password.",
            'auth/invalid-email':          "Login Failed: The email address is not valid.",
            'auth/user-disabled':          "Login Failed: This account has been disabled. Contact the registrar.",
            'auth/too-many-requests':      "Too many failed attempts. Please wait a moment and try again.",
            'auth/network-request-failed': "Network error. Please check your connection and try again.",
        };

        alert(errorMessages[error.code] ?? "Login Failed: An unexpected error occurred. Please try again.");
        btn.disabled = false;
        btn.textContent = "Secure Sign In";
    }
};