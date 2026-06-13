// FIX: Import auth, and Firestore query helpers from firebase-config
import { db, auth, collection, query, where, getDocs } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.handlePortalLogin = async function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    // FIX: Normalize to uppercase so "dcsa-a1234-2627" matches "DCSA-A1234-2627"
    const studentIdInput = document.getElementById("loginStudentId").value.trim().toUpperCase();
    // Do NOT .trim() passwords — spaces are valid characters
    const password = document.getElementById("loginPassword").value;

    // FIX: Disable button to prevent duplicate submissions
    const btn = event.target.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Signing in…";

    try {
        // Step 1: Authenticate with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: FIX — Query Firestore by email field instead of document key.
        // Old documents are keyed by Student ID; new ones by Firebase UID.
        // Querying by the "email" field works correctly for BOTH formats.
        const q = query(collection(db, "students"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            const studentData = studentDoc.data();

            // Step 3: Verify that the entered Student ID matches the account on record
            if (studentData.studentId === studentIdInput) {
                // Store the actual Firestore document ID (works for both old and new key formats)
                sessionStorage.setItem("loggedStudentId", studentDoc.id);
                sessionStorage.setItem("loggedStudentUID", user.uid);
                alert("Access Granted! Welcome back.");
                // FIX: Use clean URL — "dashboard.html" breaks with cleanUrls: true in vercel.json
                window.location.href = "/dashboard";
            } else {
                alert("Login Failed: The Student ID does not match this account.");
                btn.disabled = false;
                btn.textContent = "Secure Sign In";
            }
        } else {
            alert("Login Failed: No student profile found for this account. Please contact the registrar.");
            btn.disabled = false;
            btn.textContent = "Secure Sign In";
        }

    } catch (error) {
        console.error("Authentication Error:", error);

        // FIX: Cover modern Firebase error codes (v9+ uses auth/invalid-credential
        // instead of the older auth/wrong-password + auth/user-not-found split)
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