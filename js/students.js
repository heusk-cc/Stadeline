/**
 * DCSA STUDENT PORTAL CONTROL SCRIPT
 * File Path: js/dashboard.js
 */

// 1. MOCK DATA LEDGER (This acts as your database entry for the session)
const studentProfile = {
    fullName: "JUAN DELA CRUZ",
    studentId: "2026-0412-FV",
    lrn: "123456789012",
    track: "STEM Track",
    gwa: "1.25",
    academicStatus: "OFFICIALLY ENROLLED",
    grades: [
        { subject: "General Mathematics", midterm: 92, finals: 94, average: 93, remarks: "PASSED" },
        { subject: "Earth and Life Science", midterm: 88, finals: 92, average: 90, remarks: "PASSED" },
        { subject: "Oral Communication in Context", midterm: 95, finals: 93, average: 94, remarks: "PASSED" },
        { subject: "Empowerment Technologies (ICT)", midterm: 91, finals: 95, average: 93, remarks: "PASSED" },
        { subject: "Introduction to the Philosophy of the Human Person", midterm: 90, finals: 90, average: 90, remarks: "PASSED" }
    ]
};

// 2. INITIALIZE AND POPULATE INTERFACE DATA ON PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
    initializeDashboardData();
});

function initializeDashboardData() {
    // Populate Welcome Header & Identity Badges
    document.getElementById("welcomeUser").innerText = `Welcome, ${studentProfile.fullName}!`;
    document.getElementById("studentIdBadge").innerText = studentProfile.studentId;

    // Populate Overview Metrics
    document.getElementById("gwaMetric").innerText = studentProfile.gwa;
    document.getElementById("trackMetric").innerText = studentProfile.track;

    // Populate Profile Matrix Section
    document.getElementById("profName").innerText = studentProfile.fullName;
    document.getElementById("profLrn").innerText = studentProfile.lrn;
    document.getElementById("profId").innerText = studentProfile.studentId;
    document.getElementById("profTrack").innerText = studentProfile.track;

    // Build & Inject Dynamic Subject Grades Table
    const gradesTableBody = document.getElementById("gradesTableBody");
    if (gradesTableBody) {
        gradesTableBody.innerHTML = ""; // Clear out placeholder strings

        studentProfile.grades.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.subject}</td>
                <td>${item.midterm}</td>
                <td>${item.finals}</td>
                <td><strong>${item.average}</strong></td>
                <td><span class="badge-pass">${item.remarks}</span></td>
            `;
            gradesTableBody.appendChild(row);
        });
    }
}

// 3. VIEW NAVIGATION PANEL TOGGLE MECHANISM
function switchPanel(panelId, buttonElement) {
    // Remove the 'active-panel' style modifier from all views
    const allPanels = document.querySelectorAll(".db-view-panel");
    allPanels.forEach(panel => {
        panel.classList.remove("active-panel");
    });

    // Display the matching target module
    const targetedPanel = document.getElementById(`panel-${panelId}`);
    if (targetedPanel) {
        targetedPanel.classList.add("active-panel");
    }

    // Strip out active highlights from all side layout navbar links
    const allMenuBtns = document.querySelectorAll(".db-menu-btn");
    allMenuBtns.forEach(btn => {
        btn.classList.remove("active");
    });

    // Add highlighted active state selection back to the clicked target
    if (buttonElement) {
        buttonElement.classList.add("active");
    }
}

// 4. SECURE SIGN OUT UTILITY PIPELINE
function handlePortalLogout() {
    const confirmation = confirm("Are you sure you want to securely close your active student portal session?");
    if (confirmation) {
        // Redirect back to login interface landing page
        window.location.href = "login.html";
    }
}
