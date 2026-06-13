// FIX: Import auth from firebase-config instead of calling getAuth() without the app.
// FIX: Import doc/setDoc from firebase-config to eliminate redundant CDN imports.
import { db, auth, doc, setDoc } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.handleRegistrationSubmit = async function(event) {
    event.preventDefault();
    
    // --- EMAIL TOGGLE ---
    // Change this to 'true' when you are ready to send live emails
    const ENABLE_EMAIL_SENDING = true; 

    const fullName = document.getElementById("regFullName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const track = document.getElementById("regTrack").value;

    // FIX: Disable button during request to prevent duplicate submissions
    const btn = event.target.querySelector("button[type='submit']");
    btn.disabled = true;
    btn.textContent = "Submitting…";
    
    try {
        const uniqueIdSuffix = Math.floor(1000 + Math.random() * 9000);
        const assignedStudentId = `DCSA-A${uniqueIdSuffix}-2627`;
        const generatedPassword = assignedStudentId; 

        const userCredential = await createUserWithEmailAndPassword(auth, email, generatedPassword);
        const user = userCredential.user;

        const newStudentProfile = {
            uid: user.uid, // Store the Auth UID inside the document for security/reference
            studentId: assignedStudentId,
            username: fullName,
            email: email,
            track: track,
            enrollmentStatus: "PENDING APPLICATION", 
            registrationDate: new Date().toISOString(),
            grades: {
                "Oral Communication": "N/A",
                "General Mathematics": "N/A",
                "Earth and Life Science": "N/A",
                "Introduction to World Religions": "N/A",
                "PE and Health 1": "N/A"
            },
            schedule: {
                "Monday": "TBA",
                "Tuesday": "TBA",
                "Wednesday": "TBA",
                "Thursday": "TBA",
                "Friday": "TBA"
            }
        };

        // Saving using assignedStudentId as Document ID
        await setDoc(doc(db, "students", assignedStudentId), newStudentProfile);

        // Conditional Email Sending
        if (ENABLE_EMAIL_SENDING) {
            await sendCredentialsEmail(email, fullName, assignedStudentId, generatedPassword);
        } else {
            console.warn("Email sending is currently disabled via register.js settings.");
        }

        alert(
            `Application Submitted!\n\n` +
            `Student ID: ${assignedStudentId}\n` +
            `Initial Password: ${generatedPassword}\n\n` +
            `Log in with your email to complete your application.`
        );
        
        window.location.href = "/login";

    } catch (error) {
        const errorMessages = {
            'auth/email-already-in-use':   "This email is already linked to an existing application. Please log in instead.",
            'auth/invalid-email':          "The email address you entered is not valid.",
            'auth/weak-password':          "The generated password was rejected. Please try again.",
            'auth/network-request-failed': "Network error. Please check your connection and try again.",
        };

        const message = errorMessages[error.code];
        if (message) {
            alert(`Registration Error:\n${message}`);
        } else {
            console.error("Registration failed:", error);
            alert("Registration Failed. Please try again. If this continues, contact the registrar.");
        }

        btn.disabled = false;
        btn.textContent = "Submit Admission File";
    }
};

async function sendCredentialsEmail(targetEmail, studentName, studentId, targetPassword) {
    const payload = {
        service_id: "service_61yzay9",
        template_id: "template_nryyu35",
        user_id: "DDVLZbYjEeonKEVG2",
        template_params: {
            to_email: targetEmail,
            applicant_name: studentName,
            student_id: studentId,
            generated_password: targetPassword
        }
    };
    try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            console.log("Credentials email sent successfully.");
        } else {
            console.warn("EmailJS responded with status:", response.status);
        }
    } catch (err) {
        console.error("Network error sending credentials email:", err);
    }
}
