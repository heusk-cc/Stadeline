import { db, doc, setDoc, collection, query, where, getDocs } from "./firebase-config.js";

window.handleRegistrationSubmit = async function(event) {
    event.preventDefault();
    
    const fullName = document.getElementById("regFullName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const track = document.getElementById("regTrack").value;
    
    try {
        // 1. Check for duplicate email
        const emailQuery = query(collection(db, "students"), where("email", "==", email));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
            alert("Registration Error:\nThis email address is already tied to an official application profile.");
            return;
        }

        // 2. Generate Credentials
        const uniqueIdSuffix = Math.floor(1000 + Math.random() * 9000);
        const assignedStudentId = `DCSA-A${uniqueIdSuffix}-2627`;
        const generatedPassword = assignedStudentId; 

        // 3. Construct Student Profile
        const newStudentProfile = {
            studentId: assignedStudentId,
            password: generatedPassword, 
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

        // 4. Save to Firestore
        await setDoc(doc(db, "students", assignedStudentId), newStudentProfile);

        // 5. Send to EmailJS
        await sendCredentialsEmail(email, fullName, assignedStudentId, generatedPassword);

        alert(`Application Submitted!\n\nStudent ID: ${assignedStudentId}\nPassword: ${generatedPassword}\n\nCheck your email and log in to complete your application.`);
        window.location.href = "login.html";

    } catch (error) {
        console.error("Registration failed: ", error);
        alert("Transaction Failed. Connection interrupted. Check Console for details.");
    }
};

async function sendCredentialsEmail(targetEmail, studentName, studentId, targetPassword) {
    const serviceId = "service_61yzay9"; 
    const templateId = "template_nryyu35";
    const publicKey = "DDVLZbYjEeonKEVG2";

    const payload = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
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

        if (!response.ok) {
            const errorText = await response.text();
            console.error("EmailJS Server Error:", errorText);
        } else {
            console.log("Email sent successfully!");
        }
    } catch (err) {
        console.error("Network error connecting to EmailJS: ", err);
    }
}