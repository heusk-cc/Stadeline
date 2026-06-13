import { db } from "./firebase-config.js";
import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const activeStudentId = sessionStorage.getItem("loggedStudentId");

if (!activeStudentId) {
    window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", loadStudentDashboard);

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

        const pending = data.enrollmentStatus === "PENDING APPLICATION";

        ["nav-dashboard", "nav-schedule", "nav-grades"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = pending ? "none" : "block";
        });

        const notice = document.getElementById("homeNotice");
        if (notice && pending) {
            notice.innerHTML = `
            <strong>Application Status:</strong><br>
            Your application is currently under review.
            `;
        }

        fillProfile(data);
        renderGrades(data.grades);
        renderSchedule(data.schedule);
    });
}

function renderGrades(grades) {
    const table = document.getElementById("reportCardContent");
    if (!table || !grades) return;

    table.innerHTML = "";

    Object.entries(grades).forEach(([subject, grade]) => {
        table.innerHTML += `
        <tr>
            <td>${subject}</td>
            <td>${grade}</td>
        </tr>`;
    });
}

function renderSchedule(schedule) {
    const box = document.getElementById("scheduleContent");
    if (!box || !schedule) return;

    box.innerHTML = "";

    Object.entries(schedule).forEach(([day, time]) => {
        box.innerHTML += `
        <div class="schedule-row">
            <strong>${day}</strong><br>
            ${time}
        </div>`;
    });
}

function fillProfile(data) {
    const fields = ["firstName","middleName","lastName","address","contact"];

    fields.forEach(field => {
        const el = document.getElementById("profile" + field.charAt(0).toUpperCase() + field.slice(1));
        if (el) el.value = data[field] || "";
    });
}

function setText(id,value){
    const el=document.getElementById(id);
    if(el) el.textContent=value || "N/A";
}

window.saveProfile = async function(event){
    event.preventDefault();

    const ref = doc(db,"students",activeStudentId);

    await updateDoc(ref,{
        firstName: document.getElementById("profileFirstName").value,
        middleName: document.getElementById("profileMiddleName").value,
        lastName: document.getElementById("profileLastName").value,
        address: document.getElementById("profileAddress").value,
        contact: document.getElementById("profileContact").value
    });

    alert("Profile updated!");
};

window.handleLogout=function(){
    sessionStorage.removeItem("loggedStudentId");
    location.href="login.html";
};
