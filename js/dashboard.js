import { 
    db 
} from "./firebase-config.js";

import {
    doc,
    onSnapshot,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const studentUID = sessionStorage.getItem("loggedStudentId");


if (!studentUID) {
    window.location.href = "login.html";
}


// DOM Loaded
window.addEventListener("DOMContentLoaded", () => {

    loadStudent();

});



function loadStudent() {

    const studentRef = doc(db, "students", studentUID);


    onSnapshot(studentRef, (snapshot)=>{


        if(!snapshot.exists()){

            alert("Student record not found.");
            return;

        }


        const data = snapshot.data();



        // Identity

        setText("studentName", data.username);
        setText("studentStatus", data.enrollmentStatus);
        setText("studentId", data.studentId);
        setText("studentTrack", data.track?.toUpperCase());



        // Status

        if(data.enrollmentStatus === "PENDING APPLICATION"){

            hidePendingSections();

            document.getElementById("homeNotice").innerHTML =
            `
            <strong>Pending Application</strong><br>
            Your registration is waiting for admin verification.
            `;

        }



        // Grades

        renderGrades(data.grades);



        // Schedule

        renderSchedule(data.schedule);



        // Profile

        fillProfile(data);


    });

}




function renderGrades(grades){


    const table =
    document.getElementById("reportCardContent");


    if(!table || !grades) return;



    table.innerHTML="";


    Object.entries(grades).forEach(([subject,grade])=>{


        table.innerHTML +=
        `
        <tr>
            <td>${subject}</td>
            <td>${grade}</td>
        </tr>
        `;


    });


}




function renderSchedule(schedule){


    const box =
    document.getElementById("scheduleContent");


    if(!box || !schedule) return;


    box.innerHTML="";


    Object.entries(schedule).forEach(([day,time])=>{


        box.innerHTML +=
        `
        <div class="schedule-row">
            <b>${day}</b>
            <br>
            ${time}
        </div>
        `;


    });


}




function fillProfile(data){


    if(document.getElementById("profileFirstName"))
    document.getElementById("profileFirstName").value =
    data.firstName || "";


    if(document.getElementById("profileLastName"))
    document.getElementById("profileLastName").value =
    data.lastName || "";

}



function hidePendingSections(){


    [
        "nav-dashboard",
        "nav-schedule",
        "nav-grades"

    ].forEach(id=>{

        const el=document.getElementById(id);

        if(el)
        el.style.display="none";

    });


}




function setText(id,value){

    const el=document.getElementById(id);

    if(el)
    el.textContent=value || "N/A";

}




window.saveProfile = async function(e){

    e.preventDefault();


    const ref =
    doc(db,"students",studentUID);



    await updateDoc(ref,{

        firstName:
        document.getElementById("profileFirstName").value,


        lastName:
        document.getElementById("profileLastName").value

    });



    alert("Profile updated");

};





window.handleLogout=function(){

    sessionStorage.removeItem("loggedStudentId");

    location.href="login.html";

};
