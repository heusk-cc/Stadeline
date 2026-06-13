import { db, collection, getDocs, doc, updateDoc } from "./firebase-config.js";

let currentActiveDocId = "";

/* ---------------- Helpers ---------------- */

function setStatus(message, type = "info") {
    const el = document.getElementById("searchStatus");
    if (!el) return;

    el.style.display = "block";
    el.textContent = message;

    if (type === "error") {
        el.style.background = "#fef2f2";
        el.style.color = "#991b1b";
    } else if (type === "success") {
        el.style.background = "#f0fdf4";
        el.style.color = "#166534";
    } else {
        el.style.background = "#eff6ff";
        el.style.color = "#1e3a8a";
    }
}

function clearStatus() {
    const el = document.getElementById("searchStatus");
    if (!el) return;
    el.style.display = "none";
    el.textContent = "";
}

function trimValue(value) {
    return String(value ?? "").trim();
}

function isBlank(value) {
    return trimValue(value) === "";
}

function setInput(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
}

function parseJsonSafely(text, fieldName) {
    const raw = trimValue(text);
    if (raw === "") return null;

    try {
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error(`${fieldName} must be a JSON object.`);
        }
        return parsed;
    } catch (error) {
        throw new Error(`${fieldName} must be valid JSON. ${error.message}`);
    }
}

function fillForm(docId, data) {
    currentActiveDocId = docId;

    setInput("adminStudentFirestoreId", docId);
    setInput("adminStudentName", data.username || "");
    setInput("adminStudentEmail", data.email || "");
    setInput("adminStudentStudentId", data.studentId || "");
    setInput("adminStudentTrack", data.track || "");
    setInput("adminStudentStatus", data.enrollmentStatus || "");
    setInput("adminRegistrationDate", data.registrationDate || "");

    setInput("adminStudentGrades", JSON.stringify(data.grades || {}, null, 2));
    setInput("adminStudentSchedule", JSON.stringify(data.schedule || {}, null, 2));

    const form = document.getElementById("adminEditForm");
    if (form) form.style.display = "block";
}

async function findStudentRecord(searchTerm) {
    const normalized = trimValue(searchTerm).toLowerCase();
    if (!normalized) return null;

    const studentsSnap = await getDocs(collection(db, "students"));

    let exactMatch = null;
    let partialMatch = null;

    studentsSnap.forEach((studentDoc) => {
        const data = studentDoc.data() || {};

        const candidates = [
            studentDoc.id,
            data.uid,
            data.studentId,
            data.email,
            data.username
        ]
            .filter(Boolean)
            .map((value) => trimValue(value).toLowerCase());

        if (candidates.includes(normalized)) {
            exactMatch = { id: studentDoc.id, data };
            return;
        }

        if (!partialMatch) {
            const hit = candidates.some((value) => value.includes(normalized));
            if (hit) {
                partialMatch = { id: studentDoc.id, data };
            }
        }
    });

    return exactMatch || partialMatch;
}

/* ---------------- Global Actions ---------------- */

window.searchStudentProfile = async function () {
    const searchBtn = document.querySelector("button[onclick='searchStudentProfile()']");
    const searchInput = document.getElementById("searchStudentId");
    const form = document.getElementById("adminEditForm");

    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.textContent = "Searching...";
    }

    try {
        const searchTerm = trimValue(searchInput?.value);
        if (!searchTerm) {
            alert("Enter a Student ID, UID, Email, Username, or Doc ID.");
            return;
        }

        setStatus("Searching student records...");

        const found = await findStudentRecord(searchTerm);

        if (!found) {
            if (form) form.style.display = "none";
            currentActiveDocId = "";
            setStatus("Student not found.", "error");
            return;
        }

        fillForm(found.id, found.data);
        setStatus(`Loaded record for ${found.data.username || found.data.studentId || found.id}.`, "success");
    } catch (error) {
        console.error(error);
        setStatus("Unable to fetch student record.", "error");
        alert(error.message || "Unable to fetch student record.");
    } finally {
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.textContent = "Search Record";
        }
    }
};

window.updateStudentProfile = async function (event) {
    event.preventDefault();

    if (!currentActiveDocId) {
        alert("No student selected.");
        return;
    }

    try {
        const updates = {};

        const name = trimValue(document.getElementById("adminStudentName")?.value);
        const email = trimValue(document.getElementById("adminStudentEmail")?.value);
        const studentId = trimValue(document.getElementById("adminStudentStudentId")?.value);
        const track = trimValue(document.getElementById("adminStudentTrack")?.value);
        const status = trimValue(document.getElementById("adminStudentStatus")?.value);
        const registrationDate = trimValue(document.getElementById("adminRegistrationDate")?.value);

        const gradesText = trimValue(document.getElementById("adminStudentGrades")?.value);
        const scheduleText = trimValue(document.getElementById("adminStudentSchedule")?.value);

        if (!isBlank(name)) updates.username = name;
        if (!isBlank(email)) updates.email = email;
        if (!isBlank(studentId)) updates.studentId = studentId;
        if (!isBlank(track)) updates.track = track.toLowerCase();
        if (!isBlank(status)) updates.enrollmentStatus = status;
        if (!isBlank(registrationDate)) updates.registrationDate = registrationDate;

        if (!isBlank(gradesText)) {
            updates.grades = parseJsonSafely(gradesText, "Grades");
        }

        if (!isBlank(scheduleText)) {
            updates.schedule = parseJsonSafely(scheduleText, "Schedule");
        }

        if (Object.keys(updates).length === 0) {
            alert("No changes to save. Fill at least one field.");
            return;
        }

        const docRef = doc(db, "students", currentActiveDocId);
        await updateDoc(docRef, updates);

        setStatus("Student record updated successfully.", "success");
        alert("Student record updated successfully.");
    } catch (error) {
        console.error(error);
        setStatus("Update failed.", "error");

        if (error.code === "permission-denied") {
            alert("Firestore rules blocked this update.");
        } else {
            alert(error.message || "Update failed.");
        }
    }
};

window.logoutAdmin = function () {
    sessionStorage.removeItem("adminAuthenticated");
    window.location.href = "admin-login.html";
};

/* ---------------- Optional Enter Key Search ---------------- */

window.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchStudentId");
    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                window.searchStudentProfile();
            }
        });
    }
});
