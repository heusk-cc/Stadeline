/**
 * DCSA Fairview Student Portal Application Data Engine
 */
document.addEventListener("DOMContentLoaded", () => {
    verifySessionGuard();
    populateDashboardMetrics();
});

/**
 * 1. SECURITY SESSION GUARD
 * Blocks users who try to load the dashboard without authenticating first
 */
function verifySessionGuard() {
    const sessionToken = sessionStorage.getItem("active_student_session");
    
    if (!sessionToken) {
        alert("Unauthorized Access Attempt.\n Please login to access the Student Portal.");
        window.location.href = "login.html";
    }
}

/**
 * 2. CORE RENDERING ENGINE
 * Maps session database fields onto interface components
 */
function populateDashboardMetrics() {
    const sessionToken = sessionStorage.getItem("active_student_session");
    if (!sessionToken) return;

    const student = JSON.parse(sessionToken);

    // Render Text Headers
    document.getElementById("welcomeUser").innerText = `Welcome, ${student.fullName}!`;
    document.getElementById("studentIdBadge").innerText = student.idNumber;
    document.getElementById("trackMetric").innerText = student.academicTrack.split(" ")[0] + " Track";
    
    // Render Complete Profile Fields Table
    document.getElementById("profName").innerText = student.fullName;
    document.getElementById("profId").innerText = student.idNumber;
    document.getElementById("profLrn").innerText = student.lrn;
    document.getElementById("profTrack").innerText = student.academicTrack;

    // DATA MOCK LEDGER FOR SHS GRADES RECORD MATRIX
    const academicGradesRecord = [
        { subject: "General Mathematics", midterm: 1.25, final: 1.00 },
        { subject: "Earth and Life Science", midterm: 1.50, final: 1.25 },
        { subject: "Oral Communication in Context", midterm: 1.75, final: 1.50 },
        { subject: "Introduction to World Religions", midterm: 1.25, final: 1.25 },
        { subject: "Empowerment Technologies (ICT)", midterm: 1.00, final: 1.00 },
        { subject: "Physical Education and Health 1", midterm: 1.25, final: 1.25 }
    ];

    const tableBody = document.getElementById("gradesTableBody");
    let totalScoreAccumulator = 0;
    tableBody.innerHTML = ""; // Wipe fallbacks

    academicGradesRecord.forEach(row => {
        const rowAverage = (row.midterm + row.final) / 2;
        totalScoreAccumulator += rowAverage;

        const tableRowElement = document.createElement("tr");
        tableRowElement.innerHTML = `
            <td style="font-weight: 500; color: var(--deep-blue);">${row.subject}</td>
            <td>${row.midterm.toFixed(2)}</td>
            <td>${row.final.toFixed(2)}</td>
            <td style="font-weight: 600;">${rowAverage.toFixed(2)}</td>
            <td><span class="badge-pass">PASSED</span></td>
        `;
        tableBody.appendChild(tableRowElement);
    });

    // Compute Overall General Weighted Average Metric
    const finalCalculatedGwa = totalScoreAccumulator / academicGradesRecord.length;
    document.getElementById("gwaMetric").innerText = finalCalculatedGwa.toFixed(2);
}

/**
 * 3. INTERACTIVE CONTAINER VIEW TOOGLE TABS SWITCHER
 */
function switchPanel(panelId, eventButton) {
    // Hide all viewpanels
    const viewPanels = document.querySelectorAll(".db-view-panel");
    viewPanels.forEach(panel => panel.classList.remove("active-panel"));

    // Deactivate all navigation panel buttons
    const navigationButtons = document.querySelectorAll(".db-menu-btn");
    navigationButtons.forEach(btn => btn.classList.remove("active"));

    // Activate selected elements
    document.getElementById(`panel-${panelId}`).classList.add("active-panel");
    eventButton.classList.add("active");
}

/**
 * 4. SYSTEM SESSION TERMINATOR
 */
function handlePortalLogout() {
    if (confirm("Are you sure you want to securely log out of the SIS Portal?")) {
        sessionStorage.removeItem("active_student_session");
        window.location.href = "login.html";
    }
}
