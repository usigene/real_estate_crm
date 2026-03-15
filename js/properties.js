// properties.js
const propertyListDiv = document.getElementById("propertyList");
const propertySelect = document.getElementById("propertySelect");
const agentSelect = document.getElementById("agentSelect");

// Display properties
function displayProperties(){
    propertyListDiv.innerHTML = '';
    properties.forEach((p,i)=>{
        propertyListDiv.innerHTML += `
        <div class="property">
        <b>${p.name}</b><br>
        Price: ₦${p.price}
        <button class="delete" onclick="deleteProperty(${i})">Delete</button>
        </div>
        `;
    });
}
displayProperties();

// Add property
function addProperty(){
    let name = document.getElementById("propertyName").value;
    let price = Number(document.getElementById("propertyPrice").value);
    if(!name || !price) return;
    properties.push({name, price});
    save();
    displayProperties();
    updateDashboard();
}

// Delete property
function deleteProperty(i){
    properties.splice(i,1);
    save();
    displayProperties();
    updateDashboard();
}

// Populate selects
function populatePropertySelect(){
    propertySelect.innerHTML = '';
    properties.forEach((p,i)=>{
        propertySelect.innerHTML += `<option value="${i}">${p.name}</option>`;
    });
}
function populateAgentSelect(){
    agentSelect.innerHTML = '';
    getAgents().forEach((a,i)=>{
        agentSelect.innerHTML += `<option value="${i}">${a.name}</option>`;
    });
}
populatePropertySelect();
populateAgentSelect();

// Record sale
function recordSale(){
    let propertyIndex = propertySelect.value;
    let agentIndex = agentSelect.value;
    if(propertyIndex===undefined || agentIndex===undefined) return;
    let property = properties[propertyIndex];
    let agent = getAgents()[agentIndex];
    let commission = property.price*0.05;

    sales.push({
        property: property.name,
        agent: agent.name,
        price: property.price,
        commission: commission
    });

    agent.commission = Number(agent.commission || 0) + commission;

    save();
    alert("Sale recorded! Commission ₦"+commission);
    updateDashboard();
}