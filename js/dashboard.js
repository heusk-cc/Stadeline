import { db } from "./firebase-config.js";
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, updatePassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const activeStudentId = sessionStorage.getItem("loggedStudentId");

if (!activeStudentId) {
    window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", () => {
    loadStudentDashboard();
});

function loadStudentDashboard() {
    const ref = doc(db, "students", activeStudentId);

    onSnapshot(ref, (snap) => {
        if (!snap.exists()) {
            alert("Student profile not found.");
            handleLogout();
            return;
        }

        const data = snap.data();

        setText("studentName", data.username);
        setText("studentStatus", data.enrollmentStatus);
        setText("studentId", data.studentId);
        setText("studentTrack", String(data.track || "N/A").toUpperCase());
        setText("studentEmail", data.email);
        setText("studentRegDate", formatDate(data.registrationDate));

        const pending = data.enrollmentStatus === "PENDING APPLICATION";
        togglePortalSections(!pending);

        // Set base application status notice
        const baseNoticeMsg = pending
            ? `<strong>Application Status:</strong> Your application is currently under review. Please wait for the admin to verify your records.`
            : `<strong>Portal Update:</strong> Your account is active. You can now view your schedule and academic grades.`;
            
        const noticeElement = document.getElementById("homeNotice");
        if (noticeElement) {
            noticeElement.innerHTML = baseNoticeMsg;
        }

        // Listen for Global Announcements and append them below the status notice
        const announceQ = query(collection(db, "announcements"), orderBy("timestamp", "desc"), limit(1));
        onSnapshot(announceQ, (announceSnap) => {
            if (!announceSnap.empty) {
                let latestMsg = "";
                announceSnap.forEach((doc) => {
                    latestMsg = doc.data().message;
                });
                
                if (noticeElement) {
                    noticeElement.innerHTML = `${baseNoticeMsg}<br><br><span style="color:#059669"><strong>📢 Campus Announcement:</strong> ${latestMsg}</span>`;
                }
            }
        });

        fillProfile(data);
        renderGrades(data.grades);
        renderSchedule(data.schedule);
    }, (error) => {
        console.error("Firestore listener error:", error);
        alert("Unable to load your dashboard data.");
    });
}

function togglePortalSections(isActive) {
    ["nav-dashboard", "nav-schedule", "nav-grades"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = isActive ? "block" : "none";
    });

    if (!isActive) {
        const dashboardSection = document.getElementById("dashboard");
        if (dashboardSection) dashboardSection.style.display = "none";
        const scheduleSection = document.getElementById("schedule");
        if (scheduleSection) scheduleSection.style.display = "none";
        const gradesSection = document.getElementById("grades");
        if (gradesSection) gradesSection.style.display = "none";
        showSection("home");
    }
}

function renderGrades(grades) {
    const tableBody = document.getElementById("reportCardContent");
    if (!tableBody) return;

    const entries = grades ? Object.entries(grades) : [];
    tableBody.innerHTML = "";

    if (!entries.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="2"><div class="empty-state">No grades available yet.</div></td>
            </tr>`;
        return;
    }

    entries.forEach(([subject, grade]) => {
        const tr = document.createElement("tr");

        const subjectTd = document.createElement("td");
        subjectTd.textContent = subject;

        const gradeTd = document.createElement("td");
        gradeTd.className = "grade-value";
        gradeTd.textContent = grade;
        if (String(grade).toUpperCase() === "N/A") {
            gradeTd.classList.add("grade-na");
        }

        tr.appendChild(subjectTd);
        tr.appendChild(gradeTd);
        tableBody.appendChild(tr);
    });
}

function renderSchedule(schedule) {
    const tableBody = document.getElementById("scheduleTableBody");
    if (!tableBody) return;

    const entries = schedule ? Object.entries(schedule) : [];
    tableBody.innerHTML = "";

    if (!entries.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="2"><div class="empty-state">No schedule available yet.</div></td>
            </tr>`;
        return;
    }

    entries.forEach(([day, time]) => {
        const tr = document.createElement("tr");

        const dayTd = document.createElement("td");
        dayTd.textContent = day;

        const timeTd = document.createElement("td");
        timeTd.textContent = time;

        tr.appendChild(dayTd);
        tr.appendChild(timeTd);
        tableBody.appendChild(tr);
    });
}

function fillProfile(data) {
    const mappings = {
        profileFirstName: data.firstName || "",
        profileMiddleName: data.middleName || "",
        profileLastName: data.lastName || "",
        profileAddress: data.address || "",
        profileContact: data.contact || ""
    };

    Object.entries(mappings).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    });
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "N/A";
}

function formatDate(value) {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

window.saveProfile = async function (event) {
    event.preventDefault();

    try {
        const ref = doc(db, "students", activeStudentId);

        await updateDoc(ref, {
            firstName: document.getElementById("profileFirstName")?.value || "",
            middleName: document.getElementById("profileMiddleName")?.value || "",
            lastName: document.getElementById("profileLastName")?.value || "",
            address: document.getElementById("profileAddress")?.value || "",
            contact: document.getElementById("profileContact")?.value || ""
        });

        alert("Profile updated!");
    } catch (error) {
        console.error("Profile update failed:", error);
        alert("Failed to update profile.");
    }
};

window.handlePasswordUpdate = async function(event) {
    event.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        try {
            await updatePassword(user, newPassword);
            alert("Password updated successfully!");
            document.getElementById("passwordForm").reset();
        } catch (error) {
            alert("Error updating password. You may need to log out and log back in to verify your identity. Error: " + error.message);
        }
    } else {
        alert("Security Error: No authenticated user session found. Please log out and back in.");
    }
};

window.handleLogout = function () {
    sessionStorage.removeItem("loggedStudentId");
    location.href = "login.html";
};