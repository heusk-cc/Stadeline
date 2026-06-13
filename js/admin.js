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

// DYNAMIC HELPER PIPELINE: Dispatches customized transactional layouts to your EmailJS REST configurations
async function sendStatusEmail(targetEmail, studentName, studentId, selectedStatus) {
  // 1. Establish structural default fallback properties
  let emailTitle = "Application Update";
  let bodyP1 = "Thank you for your interest in DCSA Fairview. Your application record has been updated in our tracking systems.";
  let bodyP2 = "You can log into your tracking dashboard to follow along with subsequent registration developments.";
  let statusColor = "#475569"; // slate grey base
  let statusIcon = "ℹ️";
  let detailsDisplay = "none"; // Hide Student ID section unless finalized
  let actionUrl = "https://stadeline.vercel.app/login.html";
  let actionText = "Go To Login Portal";

  // 2. Adjust text layout values matching your dropdown selector criteria options
  switch (selectedStatus) {
    case "PENDING APPLICATION":
      emailTitle = "Application Under Review";
      bodyP1 = "Thank you for applying to DCSA Fairview. Your file has been received and is currently under active evaluation by our admissions committee.";
      bodyP2 = "Please verify that all basic required document components are uploaded. We will keep you updated as verification parameters change.";
      statusColor = "#d97706"; // Amber / Orange
      statusIcon = "⏳";
      actionText = "Check Application Progress";
      break;

    case "APPROVED":
      emailTitle = "Application Approved!";
      bodyP1 = "Great news! Your preliminary application to DCSA Fairview has been verified and approved. You are now authorized to complete your registration steps.";
      bodyP2 = "To lock in your selected academic branch path slots, please process your initial accounts configuration parameters online or visit our physical desk.";
      statusColor = "#2563eb"; // Royal Blue
      statusIcon = "🎉";
      actionText = "Complete Enrollment Registration";
      break;

    case "OFFICIALLY ENROLLED":
      emailTitle = "Official Enrollment Confirmed";
      bodyP1 = "Congratulations! We are pleased to inform you that your application to DCSA Fairview for the Academic Year 2026-2027 has been officially finalized and logged.";
      bodyP2 = "You are now officially listed as an active campus student. You may log into your dedicated portal to view metrics like class schedules and assigned subject teachers.";
      statusColor = "#059669"; // Green
      statusIcon = "✅";
      detailsDisplay = "block"; // Explicitly reveal student identification table box
      actionText = "Access Student Dashboard";
      break;

    case "REJECTED / INCOMPLETE":
      emailTitle = "Admissions Processing Update";
      bodyP1 = "Thank you for your interest in DCSA Fairview. After evaluating your profile submission details, our department determined that required criteria elements are currently missing or unfulfilled.";
      bodyP2 = "Please reach out to the institutional office support channel immediately to secure specific clarification regarding file deficiencies or resubmission pathways.";
      statusColor = "#dc2626"; // Crimson Red
      statusIcon = "❌";
      actionUrl = "https://stadeline.vercel.app/contact.html"; // Route directly to support portal options
      actionText = "Contact Admissions Desk";
      break;
  }

  // 3. Package structural dynamic metrics payload assembly
  const payload = {
    service_id: "service_61yzay9",
    template_id: "template_d6z7jve", // Linked perfectly to your provided template ID
    user_id: "DDVLZbYjEeonKEVG2",
    template_params: {
      to_email: targetEmail,
      applicant_name: studentName,
      student_id: studentId,
      status: selectedStatus,
      email_title: emailTitle,
      body_paragraph_1: bodyP1,
      body_paragraph_2: bodyP2,
      status_color: statusColor,
      status_icon: statusIcon,
      details_display: detailsDisplay,
      action_url: actionUrl,
      action_text: actionText
    }
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`Status notification email dispatched successfully for: ${selectedStatus}`);
    } else {
      const errResponseText = await response.text();
      console.warn("EmailJS Service rejected submission payload:", response.status, errResponseText);
    }
  } catch (err) {
    console.error("Network communication interface issue reaching EmailJS endpoints:", err);
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

    // --- TRIGGER EMAIL ACTIONS ON ANY VALID STATUS ALTERATIONS ---
    if (status && status !== current.enrollmentStatus && status !== "Keep Current Status") {
      setStatus("Saving records and sending verification updates email...", "info");
      await sendStatusEmail(
        email || current.email,
        username || current.username,
        studentId || current.studentId,
        status
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
