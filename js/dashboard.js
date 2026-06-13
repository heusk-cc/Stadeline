import { db } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Ensure the student is logged in
const activeStudentId = sessionStorage.getItem("loggedStudentId");

if (!activeStudentId) {
    alert("Authentication Failure:\nNo active session detected. Returning to login panel.");
    window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", () => {
    loadStudentDashboardMetrics();
});

async function loadStudentDashboardMetrics() {
    try {
        const studentDocRef = doc(db, "students", activeStudentId);
        const docSnap = await getDoc(studentDocRef);

        if (!docSnap.exists()) {
            alert("Database Error: Profile document missing.");
            handleLogout();
            return;
        }

        const data = docSnap.data();

        // 1. Populate Profile Identity
        document.getElementById("studentName").textContent = data.username || "Student";
        document.getElementById("studentStatus").textContent = data.enrollmentStatus || "PENDING APPLICATION";
        
        // --- NEW: Status Logic (Hide links if PENDING) ---
        const status = data.enrollmentStatus || "PENDING APPLICATION";
        if (status === "PENDING APPLICATION") {
            document.getElementById("nav-dashboard").style.display = "none";
            document.getElementById("nav-schedule").style.display = "none";
            document.getElementById("nav-grades").style.display = "none";
            
            // Update Home notice
            document.getElementById("homeNotice").innerHTML = `
                <strong>Application Status:</strong> Your application is currently under review. Please wait for the admin to verify your records.
            `;
        }

        // --- NEW: Pre-fill Profile Form if data exists ---
        if (data.firstName) document.getElementById("profileFirstName").value = data.firstName;
        if (data.middleName) document.getElementById("profileMiddleName").value = data.middleName;
        if (data.lastName) document.getElementById("profileLastName").value = data.lastName;
        if (data.address) document.getElementById("profileAddress").value = data.address;
        if (data.contact) document.getElementById("profileContact").value = data.contact;

        // 2. Compile and Render Academic Report Card
        const reportCardTableBody = document.getElementById("reportCardContent");
        if (reportCardTableBody) {
            reportCardTableBody.innerHTML = "";
            if (data.grades && Object.keys(data.grades).length > 0) {
                for (const [subject, grade] of Object.entries(data.grades)) {
                    reportCardTableBody.innerHTML += `<tr><td>${subject}</td><td>${grade}</td></tr>`;
                }
            }
        }

        // 3. Compile and Render Schedule
        const scheduleContainer = document.getElementById("scheduleContent");
        if (scheduleContainer && data.schedule) {
            scheduleContainer.innerHTML = "";
            for (const [day, time] of Object.entries(data.schedule)) {
                scheduleContainer.innerHTML += `<div class="schedule-row"><strong>${day}:</strong> ${time}</div>`;
            }
        }

    } catch (err) {
        console.error("Error loading dashboard: ", err);
    }
}

// --- NEW: Save Profile Function ---
window.saveProfile = async function(event) {
    event.preventDefault();

    const profileData = {
        firstName: document.getElementById("profileFirstName").value,
        middleName: document.getElementById("profileMiddleName").value,
        lastName: document.getElementById("profileLastName").value,
        address: document.getElementById("profileAddress").value,
        contact: document.getElementById("profileContact").value
    };

    try {
        const studentDocRef = doc(db, "students", activeStudentId);
        await updateDoc(studentDocRef, profileData);
        alert("Profile saved successfully!");
    } catch (err) {
        console.error("Error updating profile: ", err);
        alert("Failed to save profile. Please try again.");
    }
};

// 4. Handle Password Updates Securely
window.updatePortalPassword = async function(event) {
    event.preventDefault();

    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmPassword").value.trim();

    if (newPass.length < 6) {
        alert("Security Standard Rejection:\nPassword strings must contain at least 6 characters.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("Typo Detected:\nPasswords do not match. Please verify string values.");
        return;
    }

    try {
        const studentDocRef = doc(db, "students", activeStudentId);
        
        await updateDoc(studentDocRef, {
            password: newPass
        });

        alert("Database Sync Complete:\nYour account access portal key has been altered successfully.");
        document.getElementById("passwordChangeForm").reset();

    } catch (err) {
        console.error("Cloud document transaction failure: ", err);
        alert("Authentication write access rejected by Cloud permission layers.");
    }
};

// 5. App Logout Session Invalidation Control 
window.handleLogout = function() {
    sessionStorage.removeItem("loggedStudentId");
    window.location.href = "login.html";
};