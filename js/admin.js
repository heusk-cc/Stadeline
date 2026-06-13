import {
db,
collection,
getDocs,
doc,
updateDoc
}
from "./firebase-config.js";


let currentID="";



const subjects=[

"Earth and Life Science",
"General Mathematics",
"Introduction to World Religions",
"Oral Communication",
"PE and Health 1"

];


const days=[

"Monday",
"Tuesday",
"Wednesday",
"Thursday",
"Friday"

];




function createTables(){


let grades="";

subjects.forEach(x=>{

grades+=`

<tr>

<td>${x}</td>

<td>
<input id="grade-${x}"
style="width:95%">
</td>


</tr>

`;

});


document.getElementById("gradesTable").innerHTML=grades;



let sched="";


days.forEach(x=>{


sched+=`

<tr>

<td>${x}</td>

<td>

<input id="sched-${x}"
style="width:95%">

</td>

</tr>


`;


});


document.getElementById("scheduleTable").innerHTML=sched;


}



createTables();





window.searchStudentProfile=async function(){



let value=
document.getElementById("searchStudentId").value
.toLowerCase();



let snap=
await getDocs(collection(db,"students"));



let found=null;



snap.forEach(d=>{


let data=d.data();


if(

d.id.toLowerCase()==value ||

(data.studentId||"").toLowerCase()==value ||

(data.email||"").toLowerCase()==value ||

(data.username||"").toLowerCase()==value

)

{

found={

id:d.id,
data:data

};

}


});




if(!found){

alert("Student not found");

return;

}




currentID=found.id;


let s=found.data;



document.getElementById("adminEditForm")
.style.display="block";



adminStudentName.value=s.username||"";

adminStudentEmail.value=s.email||"";

adminStudentStudentId.value=s.studentId||"";

adminStudentTrack.value=s.track||"";

adminStudentStatus.value=s.enrollmentStatus||"";

adminRegistrationDate.value=
s.registrationDate||"";



subjects.forEach(x=>{

let id="grade-"+x;

document.getElementById(id).value=
s.grades?.[x] || "";

});



days.forEach(x=>{

document.getElementById("sched-"+x)
.value=
s.schedule?.[x] || "";

});


};





window.updateStudentProfile=async function(e){


e.preventDefault();



let updates={};



if(adminStudentName.value)
updates.username=
adminStudentName.value;


if(adminStudentEmail.value)
updates.email=
adminStudentEmail.value;


if(adminStudentStudentId.value)
updates.studentId=
adminStudentStudentId.value;


if(adminStudentTrack.value)
updates.track=
adminStudentTrack.value;


if(adminStudentStatus.value)
updates.enrollmentStatus=
adminStudentStatus.value;



let grades={};

subjects.forEach(x=>{

let value=
document.getElementById("grade-"+x).value;


if(value)
grades[x]=value;

});



if(Object.keys(grades).length)
updates.grades=grades;



let schedule={};


days.forEach(x=>{


let value=
document.getElementById("sched-"+x).value;


if(value)
schedule[x]=value;


});



if(Object.keys(schedule).length)
updates.schedule=schedule;



if(adminRegistrationDate.value)

updates.registrationDate=
adminRegistrationDate.value;





await updateDoc(

doc(db,"students",currentID),

updates

);



alert("Student updated");


};
