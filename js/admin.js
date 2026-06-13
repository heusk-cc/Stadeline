import { db } from "./firebase-config.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const subjects = [
  "Earth and Life Science",
  "General Mathematics",
  "Introduction to World Religions",
  "Oral Communication",
  "PE and Health 1"
];

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday"
];

let currentDocId = "";
let currentStudentData = null;

function setStatus(message, type = "info") {
  const el = document.getElementById("searchStatus");
  if (!el) return;

  el.style.display = "block";
  el.textContent = message;

  if (type === "error") {
    el.style.background = "#fef2f2";
    el.style.color = "#991b1b";
    el.style.border = "1px solid #fecaca";
  } else if (type === "success") {
    el.style.background = "#f0fdf4";
    el.style.color = "#166534";
    el.style.border = "1px solid #bbf7d0";
  } else {
    el.style.background = "#eff6ff";
    el.style.color = "#1e3a8a";
    el.style.border = "1px solid #bfdbfe";
  }
}

function trim(value) {
  return String(value ?? "").trim();
}

function isBlank(value) {
  return trim(value) === "";
}

function createTables() {
  const gradesBody = document.getElementById("gradesTable");
  const scheduleBody = document.getElementById("scheduleTable");

  if (gradesBody) {
    gradesBody.innerHTML = subjects.map((subject, index) => `
      <tr>
        <td>${subject}</td>
        <td><input id="grade-${index}" placeholder="Grade"></td>
      </tr>
    `).join("");
  }

  if (scheduleBody) {
    scheduleBody.innerHTML = days.map((day, index) => `
      <tr>
        <td>${day}</td>
        <td><input id="schedule-${index}" placeholder="Schedule"></td>
      </tr>
    `).join("");
  }
}

async function findStudent(searchTerm) {
  const normalized = trim(searchTerm).toLowerCase();
  if (!normalized) return null;

  const snap = await getDocs(collection(db, "students"));
  let partial = null;

  snap.forEach((studentDoc) => {
    const data = studentDoc.data() || {};
    const candidates = [
      studentDoc.id,
      data.uid,
      data.studentId,
      data.email,
      data.username
    ]
      .filter(Boolean)
      .map((v) => trim(v).toLowerCase());

    if (candidates.includes(normalized)) {
      partial = { id: studentDoc.id, data };
      partial.exact = true;
      return;
    }

    if (!partial) {
      const hit = candidates.some((v) => v.includes(normalized));
      if (hit) {
        partial = { id: studentDoc.id, data };
      }
    }
  });

  return partial;
}

function fillForm(studentId, data) {
  currentDocId = studentId;
  currentStudentData = data || {};

  document.getElementById("adminEditForm").style.display = "block";

  document.getElementById("adminStudentName").value = data.username || "";
  document.getElementById("adminStudentEmail").value = data.email || "";
  document.getElementById("adminStudentStudentId").value = data.studentId || "";
  document.getElementById("adminStudentTrack").value = data.track || "";
  document.getElementById("adminStudentStatus").value = data.enrollmentStatus || "";
  document.getElementById("adminRegistrationDate").value = data.registrationDate || "";

  subjects.forEach((subject, index) => {
    document.getElementById(`grade-${index}`).value = data.grades?.[subject] ?? "";
  });

  days.forEach((day, index) => {
    document.getElementById(`schedule-${index}`).value = data.schedule?.[day] ?? "";
  });
}

window.searchStudentProfile = async function () {
  const input = document.getElementById("searchStudentId");
  const searchValue = trim(input?.value);

  if (!searchValue) {
    alert("Enter a Student ID, Email, Username, UID, or Doc ID.");
    return;
  }

  setStatus("Searching student records...");

  try {
    const found = await findStudent(searchValue);

    if (!found) {
      currentDocId = "";
      currentStudentData = null;
      document.getElementById("adminEditForm").style.display = "none";
      setStatus("Student not found.", "error");
      return;
    }

    fillForm(found.id, found.data);
    setStatus(`Loaded ${found.data.username || found.data.studentId || found.id}.`, "success");
  } catch (error) {
    console.error(error);
    setStatus("Failed to load student record.", "error");
    alert(error.message || "Failed to load student record.");
  }
};

// HELPER PIPELINE: Sends API request directly to EmailJS REST endpoints
async function sendEnrollmentStatusEmail(targetEmail, studentName, studentId) {
  const payload = {
    service_id: "service_61yzay9",            // Auto-linked from your login.js configurations
    template_id: "template_d6z7jve", // TODO: Put your specific EmailJS Enrollment Notification Template ID here
    user_id: "DDVLZbYjEeonKEVG2",               // Auto-linked from your login.js configurations
    template_params: {
      to_email: targetEmail,
      applicant_name: studentName,
      student_id: studentId,
      status: "OFFICIALLY ENROLLED"
    }
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log("Enrollment success email dispatched successfully.");
    } else {
      const errResponseText = await response.text();
      console.warn("EmailJS Service rejected submission payload:", response.status, errResponseText);
    }
  } catch (err) {
    console.error("Network interface breakdown contacting EmailJS endpoints:", err);
  }
}

window.updateStudentProfile = async function (event) {
  event.preventDefault();

  if (!currentDocId) {
    alert("No student selected.");
    return;
  }

  try {
    const updates = {};
    const current = currentStudentData || {};

    const username = trim(document.getElementById("adminStudentName").value);
    const email = trim(document.getElementById("adminStudentEmail").value);
    const studentId = trim(document.getElementById("adminStudentStudentId").value);
    const track = trim(document.getElementById("adminStudentTrack").value);
    const status = trim(document.getElementById("adminStudentStatus").value);
    const registrationDate = trim(document.getElementById("adminRegistrationDate").value);

    if (!isBlank(username)) updates.username = username;
    if (!isBlank(email)) updates.email = email;
    if (!isBlank(studentId)) updates.studentId = studentId;
    if (!isBlank(track)) updates.track = track;
    if (!isBlank(status)) updates.enrollmentStatus = status;
    if (!isBlank(registrationDate)) updates.registrationDate = registrationDate;

    const mergedGrades = { ...(current.grades || {}) };
    let gradesChanged = false;

    subjects.forEach((subject, index) => {
      const value = trim(document.getElementById(`grade-${index}`).value);
      if (!isBlank(value) && mergedGrades[subject] !== value) {
        mergedGrades[subject] = value;
        gradesChanged = true;
      }
    });

    if (gradesChanged) {
      updates.grades = mergedGrades;
    }

    const mergedSchedule = { ...(current.schedule || {}) };
    let scheduleChanged = false;

    days.forEach((day, index) => {
      const value = trim(document.getElementById(`schedule-${index}`).value);
      if (!isBlank(value) && mergedSchedule[day] !== value) {
        mergedSchedule[day] = value;
        scheduleChanged = true;
      }
    });

    if (scheduleChanged) {
      updates.schedule = mergedSchedule;
    }

    if (Object.keys(updates).length === 0) {
      setStatus("No changes to save.", "info");
      alert("No changes to save.");
      return;
    }

    await updateDoc(doc(db, "students", currentDocId), updates);

    // --- TRIGGER EMAIL ACTIONS ON STATUS ALTERATIONS ---
    if (status === "OFFICIALLY ENROLLED" && current.enrollmentStatus !== "OFFICIALLY ENROLLED") {
      setStatus("Saving records and sending verification email...", "info");
      await sendEnrollmentStatusEmail(
        email || current.email,
        username || current.username,
        studentId || current.studentId
      );
    }

    currentStudentData = {
      ...current,
      ...updates,
      grades: updates.grades || current.grades || {},
      schedule: updates.schedule || current.schedule || {}
    };

    setStatus("Student updated successfully.", "success");
    alert("Student updated successfully.");
  } catch (error) {
    console.error(error);
    setStatus("Update failed.", "error");
    alert(error.message || "Update failed.");
  }
};

window.logoutAdmin = function () {
  sessionStorage.removeItem("adminAuthenticated");
  window.location.href = "admin-login.html";
};

window.addEventListener("DOMContentLoaded", () => {
  createTables();

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
