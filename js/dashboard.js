// dashboard.js
function updateDashboard() {
    document.getElementById("staffCount").innerText = staff.length;
    document.getElementById("agentCount").innerText = getAgents().length;
    document.getElementById("propertyCount").innerText = properties.length;

    let totalSales = sales.reduce((a,b)=>a+b.price,0);
    let totalCommission = sales.reduce((a,b)=>a+b.commission,0);

    document.getElementById("salesTotal").innerText = "₦"+totalSales;
    document.getElementById("commissionTotal").innerText = "₦"+totalCommission;

    updateAgentChart();
    updateLeaderboard();
}

// Chart.js for agent performance
function updateAgentChart() {
    let ctx = document.getElementById('agentChart').getContext('2d');
    let agents = getAgents();
    let labels = agents.map(a=>a.name);
    let data = agents.map(a=>{
        return sales.filter(s=>s.agent===a.name).reduce((sum,s)=>sum+s.commission,0);
    });

    if(window.agentChart) window.agentChart.destroy();

    window.agentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Commission',
                data: data,
                backgroundColor: '#2d89ef'
            }]
        },
        options: {
            responsive:true,
            plugins:{
                legend:{display:false}
            }
        }
    });
}

// Leaderboard
function updateLeaderboard() {
    let leaderboard = document.getElementById('leaderboard');
    let agents = getAgents().map(a=>{
        let total = sales.filter(s=>s.agent===a.name).reduce((sum,s)=>sum+s.commission,0);
        return {name:a.name,total};
    }).sort((a,b)=>b.total - a.total);

    leaderboard.innerHTML = '';
    agents.forEach(a=>{
        leaderboard.innerHTML += `<li>${a.name}: ₦${a.total}</li>`;
    });
}

// Initial update
updateDashboard();