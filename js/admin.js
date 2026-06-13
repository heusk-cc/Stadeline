function createTables(){

let grades="";

subjects.forEach((subject,index)=>{

grades += `
<tr>

<td>${subject}</td>

<td>
<input id="grade${index}">
</td>

</tr>
`;

});


document.getElementById("gradesTable").innerHTML=grades;



let schedule="";


days.forEach((day,index)=>{


schedule +=`

<tr>

<td>${day}</td>

<td>
<input id="schedule${index}">
</td>

</tr>

`;

});


document.getElementById("scheduleTable").innerHTML=schedule;


}
