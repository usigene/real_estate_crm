// employees.js
const staffListDiv = document.getElementById("staffList");
const searchInput = document.getElementById("searchStaff");

// Display staff
function displayStaff(list) {
    staffListDiv.innerHTML = '';
    list.forEach((s,i)=>{
        staffListDiv.innerHTML += `
        <div class="employee">
        <b>${s.name}</b><br>
        Email: ${s.email||""}<br>
        Phone: ${s.phone||""}<br>
        Department: ${s.department||""}<br>
        Commission: ₦${s.commission||0}<br>
        <button class="delete" onclick="deleteStaff(${i})">Delete</button>
        </div>
        `;
    });
}
displayStaff(staff);

// Delete
function deleteStaff(i){
    if(confirm("Delete staff?")){
        staff.splice(i,1);
        save();
        displayStaff(staff);
    }
}

// Search
searchInput.addEventListener("keyup",function(){
    let q = this.value.toLowerCase();
    let filtered = staff.filter(s=>s.name.toLowerCase().includes(q));
    displayStaff(filtered);
});

// Excel upload
document.getElementById("excelFile").addEventListener("change",function(e){
    let reader = new FileReader();
    reader.onload = function(event){
        let data = new Uint8Array(event.target.result);
        let workbook = XLSX.read(data,{type:'array'});
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = XLSX.utils.sheet_to_json(sheet);
        rows.forEach(r=>{
            staff.push({
                name:r["Full Name"],
                email:r["Email"],
                phone:r["Phone"],
                department:r["Department"],
                commission:0
            });
        });
        save();
        displayStaff(staff);
        updateDashboard();
        alert("Excel uploaded successfully!");
    }
    reader.readAsArrayBuffer(e.target.files[0]);
});

// Word upload
document.getElementById("wordFile").addEventListener("change",function(e){
    let reader = new FileReader();
    reader.onload = function(event){
        mammoth.extractRawText({arrayBuffer:event.target.result})
        .then(result => parseWord(result.value));
    }
    reader.readAsArrayBuffer(e.target.files[0]);
});

function parseWord(text){
    let blocks = text.split("EMPLOYEE");
    blocks.forEach(b=>{
        if(!b.trim()) return;
        let emp = {};
        b.split("\n").forEach(line=>{
            line=line.trim();
            if(line.startsWith("Full Name")) emp.name=line.split(":")[1]?.trim();
            if(line.startsWith("Email")) emp.email=line.split(":")[1]?.trim();
            if(line.startsWith("Phone")) emp.phone=line.split(":")[1]?.trim();
            if(line.startsWith("Department")) emp.department=line.split(":")[1]?.trim();
        });
        emp.commission = 0;
        if(emp.name) staff.push(emp);
    });
    save();
    displayStaff(staff);
    updateDashboard();
    alert("Word file imported successfully!");
}