// FIX: Import auth from firebase-config instead of calling getAuth() without the app.
// FIX: Import doc/setDoc from firebase-config to eliminate redundant CDN imports.
import { db, auth, doc, setDoc } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.handleRegistrationSubmit = async function(event) {
    event.preventDefault();
    
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
                "Monday": "08:00 AM - 10:00 AM (Core Class) | 1:00 PM - 3:00 PM (Track Spec)",
                "Tuesday": "08:00 AM - 10:00 AM (Core Class) | 1:00 PM - 3:00 PM (Track Spec)",
                "Wednesday": "08:00 AM - 10:00 AM (Core Class)",
                "Thursday": "08:00 AM - 10:00 AM (Core Class) | 1:00 PM - 3:00 PM (Track Spec)",
                "Friday": "Asynchronous / Module Day"
            }
        };

        await setDoc(doc(db, "students", user.uid), newStudentProfile);

        // Send credentials email (non-fatal — student is already saved if this fails)
        await sendCredentialsEmail(email, fullName, assignedStudentId, generatedPassword);

        alert(
            `Application Submitted!\n\n` +
            `Student ID: ${assignedStudentId}\n` +
            `Initial Password: ${generatedPassword}\n\n` +
            `Check your email for these credentials and log in to complete your application.`
        );
        // FIX: Use clean URL path — "login.html" breaks with cleanUrls: true in vercel.json
        window.location.href = "/login";

    } catch (error) {
        // FIX: Handle modern Firebase error codes with specific, helpful messages
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
            // Non-fatal: log and move on — student profile is already saved in Firestore
            console.warn("EmailJS responded with status:", response.status);
        }
    } catch (err) {
        console.error("Network error sending credentials email:", err);
    }
}