/**
 * DCSA STUDENT ACCOUNT SECURITY & VALIDATION LOGIC
 * File Path: js/accounts.js
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. DATABASE SEED DATA (Creates a default login if database is clean)
    if (!localStorage.getItem("dcsa_local_db")) {
        const initialMockDatabase = {
            "DCSA-001-FV": {
                studentId: "DCSA-001-FV",
                fullName: "JUAN DELA CRUZ",
                password: "password123",
                lrn: "123456789012",
                track: "STEM Track",
                gwa: "1.25",
                academicStatus: "OFFICIALLY ENROLLED",
                grades: [
                    { subject: "General Mathematics", midterm: 92, finals: 94, average: 93, remarks: "PASSED" },
                    { subject: "Earth and Life Science", midterm: 88, finals: 92, average: 90, remarks: "PASSED" },
                    { subject: "Oral Communication in Context", midterm: 95, finals: 93, average: 94, remarks: "PASSED" },
                    { subject: "Empowerment Technologies (ICT)", midterm: 91, finals: 95, average: 93, remarks: "PASSED" }
                ]
            }
        };
        localStorage.setItem("dcsa_local_db", JSON.stringify(initialMockDatabase));
    }

    // 2. LISTEN FOR AUTHENTICATION FORM SUBMISSIONS
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Halt default HTTP post refreshes

            // Read inputs directly by id mappings
            const typedId = document.getElementById("studentId").value.trim();
            const typedPassword = document.getElementById("portalPassword").value.trim();

            // Extract fresh registration maps from client state storage
            const liveDatabase = JSON.parse(localStorage.getItem("dcsa_local_db")) || {};

            // Validation logic check checks
            if (liveDatabase[typedId]) {
                const currentStudent = liveDatabase[typedId];

                if (currentStudent.password === typedPassword) {
                    // Lock student instance parameters safely to live active web context storage
                    sessionStorage.setItem("active_student_session", JSON.stringify(currentStudent));
                    
                    // Route user to portal workspace view
                    window.location.href = "dashboard.html";
                    return;
                }
            }
            
            // Rejection alert fallback message pattern
            alert("Authentication Denied.\n\nInvalid ID or Password.\nTry: DCSA-001-FV with password123\nOr use a newly registered ID.");
        });
    }
});
