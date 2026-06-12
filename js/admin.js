// 1. Only import the database instance from your local configuration file
import { db } from "./firebase-config.js";

// 2. Import the required Firestore methods directly from the official Firebase CDN
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentActiveEditingId = "";

window.searchStudentProfile = async function() {
    const searchId = document.getElementById("searchStudentId").value.trim();
    
    if (!searchId) {
        alert("Action Cancelled:\nPlease input a valid Student ID sequence.");
        return;
    }

    try {
        const studentDocRef = doc(db, "students", searchId);
        const docSnap = await getDoc(studentDocRef);

        if (!docSnap.exists()) {
            alert(`Record Search Failure:\nNo account entry exists for ID: ${searchId}`);
            document.getElementById("adminEditForm").style.display = "none";
            return;
        }

        const data = docSnap.data();
        currentActiveEditingId = searchId; // Hold the ID in memory

        // Populate the input forms with current database records
        document.getElementById("adminStudentName").value = data.username || "";
        document.getElementById("adminStudentPassword").value = data.password || "";
        document.getElementById("adminStudentEmail").value = data.email || "";
        document.getElementById("adminStudentStatus").value = data.enrollmentStatus || "PENDING APPLICATION";

        // Display the form area smoothly
        document.getElementById("adminEditForm").style.display = "block";

    } catch (error) {
        console.error("Admin dataset lookup query error: ", error);
        alert("Database transaction timeout error.");
    }
};

window.updateStudentProfile = async function(event) {
    event.preventDefault();

    if (!currentActiveEditingId) return;

    const updatedName = document.getElementById("adminStudentName").value.trim();
    const updatedPassword = document.getElementById("adminStudentPassword").value.trim();
    const updatedEmail = document.getElementById("adminStudentEmail").value.trim();
    const updatedStatus = document.getElementById("adminStudentStatus").value;

    try {
        const docRef = doc(db, "students", currentActiveEditingId);
        
        // Write updates back onto the target database node
        await updateDoc(docRef, {
            username: updatedName,
            password: updatedPassword,
            email: updatedEmail,
            enrollmentStatus: updatedStatus
        });

        alert(`Database Sync Complete:\nAccount settings for ${currentActiveEditingId} successfully altered.`);
    } catch (error) {
        console.error("Admin document patch failure: ", error);
        alert("Write operation rejected by Cloud access controls.");
    }
};