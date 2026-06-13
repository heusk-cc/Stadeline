import { db } from "./firebase-config.js";

import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentActiveEditingId = "";

window.loadStudents = async function(){
    const list = document.getElementById("studentList");
    list.innerHTML = "Loading...";

    const snap = await getDocs(collection(db,"students"));
    list.innerHTML = "";

    snap.forEach(s=>{
        const d=s.data();
        list.innerHTML += `
        <tr>
        <td>${d.studentId || s.id}</td>
        <td>${d.username || ""}</td>
        <td>${d.email || ""}</td>
        <td>${d.enrollmentStatus || ""}</td>
        <td><button onclick="searchStudentProfile('${s.id}')">Edit</button></td>
        </tr>`;
    });
}

window.searchStudentProfile = async function(id){
    currentActiveEditingId=id;
    const s=await getDocs(collection(db,"students"));
    const snap = s.docs.find(x=>x.id===id);
    if(!snap) return;
    const d=snap.data();

    adminStudentName.value=d.username||"";
    adminStudentEmail.value=d.email||"";
    adminStudentId.value=d.studentId||"";
    adminStudentTrack.value=d.track||"";
    adminStudentStatus.value=d.enrollmentStatus||"";
    adminGrades.value=JSON.stringify(d.grades||{},null,2);
    adminSchedule.value=JSON.stringify(d.schedule||{},null,2);

    adminEditForm.style.display="block";
}

window.updateStudentProfile=async function(e){
    e.preventDefault();
    if(!currentActiveEditingId)return;

    let updates={};

    if(adminStudentName.value.trim()) updates.username=adminStudentName.value.trim();
    if(adminStudentEmail.value.trim()) updates.email=adminStudentEmail.value.trim();
    if(adminStudentId.value.trim()) updates.studentId=adminStudentId.value.trim();
    if(adminStudentTrack.value.trim()) updates.track=adminStudentTrack.value.trim();
    if(adminStudentStatus.value.trim()) updates.enrollmentStatus=adminStudentStatus.value;

    try{ updates.grades=JSON.parse(adminGrades.value||"{}"); }catch(e){}
    try{ updates.schedule=JSON.parse(adminSchedule.value||"{}"); }catch(e){}

    await updateDoc(doc(db,"students",currentActiveEditingId),updates);
    alert("Updated successfully");
    loadStudents();
}

loadStudents();
