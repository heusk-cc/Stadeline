/**
 * DCSA Unified Database Engine & Form Handlers
 */

// 1. Core initialization - Seeds the browser local storage database with your default directory if it doesn't exist yet.
const defaultClassmates = {
    "DCSA-001-FV": {
        name: "Juan Dela Cruz",
        studentId: "DCSA-001-FV",
        password: "password123",
        track: "Academic Track - STEM",
        schedule: [
            { time: "08:00 AM", subject: "General Physics 1", room: "Room 302" },
            { time: "10:00 AM", subject: "Pre-Calculus Core", room: "Room 305" }
        ],
        grades: { "General Physics 1": "92", "Pre-Calculus Core": "88" }
    },
    "DCSA-002-FV": {
        name: "Maria Santos",
        studentId: "DCSA-002-FV",
        password: "password123",
        track: "Technical-Vocational - ICT",
        schedule: [
            { time: "08:00 AM", subject: "Computer Programming 1", room: "Comp Lab A" }
        ],
        grades: { "Computer Programming 1": "94" }
    }
};

// Auto-inject the starting database into browser memory if empty
if (!localStorage.getItem("dcsa_local_db")) {
    localStorage.setItem("dcsa_local_db", JSON.stringify(defaultClassmates));
}

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    highlightActivePage();
});

/**
 * REGISTRATION FORM HANDLER
 * Captures user inputs, builds a structured student object, and saves it.
 */
function handleRegistrationSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    // Select form inputs (assumes: 1st input = Name, 2nd input = LRN/Password hint)
    const inputs = form.querySelectorAll("input");
    const selectTrack = form.querySelector("select");

    const fullName = inputs[0].value.trim();
    const lrnValue = inputs[1].value.trim();
    const chosenTrack = selectTrack ? selectTrack.value : "General Academic Track";

    if (!fullName || !lrnValue) {
        alert("Please fill out all fields.");
        return;
    }

    // Generate a unique sequential or randomized Student ID Key
    const generatedId = "DCSA-" + Math.floor(100 + Math.random() * 900) + "-FV";

    // Build the user data bundle matching your preferred database directory layout
    const newStudentProfile = {
        name: fullName,
        studentId: generatedId,
        password: "password123", // Set a default universal password for all new online signups
        track: chosenTrack,
        schedule: [
            { time: "08:00 AM", subject: "Oral Communication", room: "Room 101" },
            { time: "01:00 PM", subject: "Empowerment Technologies", room: "Comp Lab B" }
        ],
        grades: {
            "Oral Communication": "90",
            "Empowerment Technologies": "92"
        }
    };

    // Pull current live local database state from memory
    let liveDatabase = JSON.parse(localStorage.getItem("dcsa_local_db"));

    // Insert the new student profile object map using their new ID as the lookup key
    liveDatabase[generatedId] = newStudentProfile;

    // Save the updated database back to browser storage
    localStorage.setItem("dcsa_local_db", JSON.stringify(liveDatabase));

    // Alert user with their real login credentials
    alert(`🎉 Registration Saved Successfully!\n\nYour Login ID: ${generatedId}\nYour Password: password123\n\nWrite this down and use it to sign in to the SIS Portal!`);
    
    form.reset();
    window.location.href = "login.html"; // Redirect straight to login page
}

// Keep navigation UX operational
function initNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    if (menuToggle && navLinks) {
        const toggleIcon = menuToggle.querySelector("i");
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            navLinks.classList.toggle("active");
            toggleIcon.classList.toggle("fa-bars");
            toggleIcon.classList.toggle("fa-xmark");
        });
    }
}
function highlightActivePage() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf("/") + 1);
    document.querySelectorAll(".nav-links a").forEach(link => {
        if (pageName === link.getAttribute("href")) link.classList.add("active");
    });
}

function handleContactSubmit(event) {
    event.preventDefault(); // Stops the page from reloading
    
    // Grab the data from the form
    const formData = {
        name: event.target.fullname.value,
        email: event.target.email.value,
        message: event.target.message.value
    };

    // Send it to your backend server
    fetch('https://your-backend-api.com/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => alert('Inquiry sent successfully!'))
    .catch(error => console.error('Error:', error));
}
