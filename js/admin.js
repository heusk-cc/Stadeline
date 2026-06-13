// 1. Only import the database instance from your local configuration file
import { db } from "./firebase-config.js";

// 2. Import the required Firestore methods directly from the official Firebase CDN
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentActiveEditingId = "";

window.searchStudentProfile = async function() {
    const searchBtn = document.querySelector("button[onclick='searchStudentProfile()']");
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    try {
        const searchId =
            document.getElementById("searchStudentId").value.trim();

        if (!searchId) {
            alert("Enter a Student ID.");
            return;
        }

        const studentDocRef = doc(db, "students", searchId);
        const docSnap = await getDoc(studentDocRef);

        if (!docSnap.exists()) {
            alert("Student not found.");
            document.getElementById("adminEditForm").style.display = "none";
            return;
        }

        const data = docSnap.data();

        currentActiveEditingId = searchId;

        document.getElementById("adminStudentName").value =
            data.username || "";

        document.getElementById("adminStudentPassword").value =
            data.password || "";

        document.getElementById("adminStudentEmail").value =
            data.email || "";

        document.getElementById("adminStudentStatus").value =
            data.enrollmentStatus || "PENDING APPLICATION";

        document.getElementById("adminEditForm").style.display = "block";

    } catch (error) {
        console.error(error);
        alert("Unable to fetch student record.");
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search Record";
    }
};

window.updateStudentProfile = async function(event) {
    event.preventDefault();

    if (!currentActiveEditingId) {
        alert("No student selected.");
        return;
    }

    const updates = {};

    const name = document.getElementById("adminStudentName").value.trim();
    const password = document.getElementById("adminStudentPassword").value.trim();
    const email = document.getElementById("adminStudentEmail").value.trim();
    const status = document.getElementById("adminStudentStatus").value;

    if (name !== "") updates.username = name;
    if (password !== "") updates.password = password;
    if (email !== "") updates.email = email;

    updates.enrollmentStatus = status;

    try {
        const docRef = doc(db, "students", currentActiveEditingId);

        await updateDoc(docRef, updates);

        alert("Student record updated successfully.");
    } catch (error) {
        console.error(error);

        if (error.code === "permission-denied") {
            alert("Firestore rules blocked this update.");
        } else {
            alert(error.message);
        }
    }
};
