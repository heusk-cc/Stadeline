import { db } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Ensure the student is logged in, grab their authentication token string
const activeStudentId = sessionStorage.getItem("loggedStudentId");

if (!activeStudentId) {
    alert("Authentication Failure:\nNo active session detected. Returning to login panel.");
    window.location.href = "login.html";
}

// Automatically initialize workspace data compilation on window launch
window.addEventListener("DOMContentLoaded", () => {
    loadStudentDashboardMetrics();
});

async function loadStudentDashboardMetrics() {
    try {
        const studentDocRef = doc(db, "students", activeStudentId);
        const docSnap = await getDoc(studentDocRef);

        if (!docSnap.exists()) {
            alert("Database Error: Profile document missing from system registry registry.");
            handleLogout();
            return;
        }

        const data = docSnap.data();

        // 1. Populate Profile Identity Node Values
        document.getElementById("studentName").textContent = data.username || "Not Specified";
        document.getElementById("studentId").textContent = data.studentId || activeStudentId;
        document.getElementById("studentTrack").textContent = (data.track || "Unassigned").toUpperCase();
        document.getElementById("studentStatus").textContent = data.enrollmentStatus || "PENDING APPLICATION";

        // 2. Compile and Render Academic Report Card Row Nodes
        const reportCardTableBody = document.getElementById("reportCardContent");
        if (reportCardTableBody) {
            reportCardTableBody.innerHTML = ""; // Wipe loading spacer text

            if (data.grades && Object.keys(data.grades).length > 0) {
                for (const [subject, grade] of Object.entries(data.grades)) {
                    // Check if grade value is empty, null, or set to "N/A"
                    const isUngraded = (grade === "N/A" || !grade);
                    const gradeDisplay = isUngraded ? "Not Graded" : grade;
                    const gradeStyle = isUngraded 
                        ? "color: #94a3b8; font-style: italic; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;" 
                        : "color: #0f172a; font-weight: bold; background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 4px; display: inline-block;";

                    reportCardTableBody.innerHTML += `
                        <tr>
                            <td style="font-weight: 500;">${subject}</td>
                            <td style="text-align: center;"><span style="${gradeStyle}">${gradeDisplay}</span></td>
                        </tr>
                    `;
                }
            } else {
                reportCardTableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #94a3b8;">No academic courses assigned to this record profile.</td></tr>`;
            }
        }

        // 3. Compile and Render Schedule Matrix Blocks
        const scheduleContainer = document.getElementById("scheduleContent");
        if (scheduleContainer) {
            scheduleContainer.innerHTML = ""; // Wipe loading block

            if (data.schedule && Object.keys(data.schedule).length > 0) {
                for (const [day, executionTime] of Object.entries(data.schedule)) {
                    scheduleContainer.innerHTML += `
                        <div class="schedule-row">
                            <strong style="color: #0f172a; display: inline-block; width: 100px;">${day}:</strong>
                            <span style="color: #475569; font-size: 14px;">${executionTime}</span>
                        </div>
                    `;
                }
            } else {
                scheduleContainer.innerHTML = `<p style="color: #94a3b8; font-style: italic;">No class scheduling matrix has been established for this block profile.</p>`;
            }
        }

    } catch (err) {
        console.error("Failed to accurately read student metric collection profiles: ", err);
        alert("Data Connection Refused: Unable to completely fetch server matrices.");
    }
}

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