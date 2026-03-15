/* =============================================
   REAL ESTATE CRM - APPLICATION LOGIC
   ============================================= */

class CRMApp {
    constructor() {
        this.staff = JSON.parse(localStorage.getItem('staff')) || [];
        this.properties = JSON.parse(localStorage.getItem('properties')) || [];
        this.sales = JSON.parse(localStorage.getItem('sales')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
    }

    setupEventListeners() {
        // File upload
        const dropZone = document.getElementById('dropZone');
        dropZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx,.xls,.docx';
            input.multiple = true;
            input.onchange = (e) => this.handleFiles(e.target.files);
            input.click();
        });

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
            dropZone.addEventListener(event, (e) => e.preventDefault());
        });

        dropZone.addEventListener('drop', (e) => this.handleFiles(e.dataTransfer.files));

        // Search
        document.getElementById('searchStaff').addEventListener('input', (e) => this.searchStaff(e.target.value));

        // Forms
        document.getElementById('propertyForm').addEventListener('submit', (e) => this.addProperty(e));
        document.getElementById('saleForm').addEventListener('submit', (e) => this.recordSale(e));

        // Admin
        document.getElementById('adminUser').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('adminPass').focus();
        });
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                this.parseExcel(file);
            } else if (file.name.endsWith('.docx')) {
                this.parseWord(file);
            }
        });
    }

    parseExcel(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);

            rows.forEach(row => {
                this.staff.push({
                    name: row['Full Name'] || row['Name'],
                    email: row['Email'],
                    phone: row['Phone'],
                    department: row['Department'],
                    commission: 0
                });
            });

            this.save();
            this.displayStaff();
            this.updateDashboard();
            this.showToast(`✅ Imported ${rows.length} employees!`, 'success');
        };
        reader.readAsArrayBuffer(file);
    }

    parseWord(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            mammoth.extractRawText({ arrayBuffer: e.target.result })
                .then(result => {
                    const lines = result.value.split('\n');
                    let emp = {}, count = 0;

                    lines.forEach(line => {
                        if (line.includes('Full Name')) emp.name = line.split(':')[1]?.trim();
                        if (line.includes('Email')) emp.email = line.split(':')[1]?.trim();
                        if (line.includes('Phone')) emp.phone = line.split(':')[1]?.trim();
                        if (line.includes('Department')) emp.department = line.split(':')[1]?.trim();
                        
                        if (line.includes('---') && emp.name) {
                            emp.commission = 0;
                            this.staff.push(emp);
                            count++;
                            emp = {};
                        }
                    });

                    this.save();
                    this.displayStaff();
                    this.updateDashboard();
                    this.showToast(`✅ Imported ${count} employees!`, 'success');
                });
        };
        reader.readAsArrayBuffer(file);
    }

    displayStaff() {
        const tbody = document.getElementById('staffList');
        tbody.innerHTML = this.staff.map((s, i) => `
            <tr>
                <td>${s.name}</td>
                <td>${s.email || 'N/A'}</td>
                <td>${s.phone || 'N/A'}</td>
                <td>${s.department || 'N/A'}</td>
                <td>₦${(s.commission || 0).toLocaleString()}</td>
                <td><button class="btn btn-danger" onclick="app.deleteStaff(${i})">🗑 Delete</button></td>
            </tr>
        `).join('');
    }

    searchStaff(query) {
        const filtered = this.staff.filter(s => 
            s.name.toLowerCase().includes(query) || s.email?.toLowerCase().includes(query)
        );
        const tbody = document.getElementById('staffList');
        tbody.innerHTML = filtered.map((s, i) => `
            <tr>
                <td>${s.name}</td>
                <td>${s.email || 'N/A'}</td>
                <td>${s.phone || 'N/A'}</td>
                <td>${s.department || 'N/A'}</td>
                <td>₦${(s.commission || 0).toLocaleString()}</td>
                <td><button class="btn btn-danger" onclick="app.deleteStaff(${this.staff.indexOf(s)})">🗑 Delete</button></td>
            </tr>
        `).join('');
    }

    deleteStaff(index) {
        if (confirm('Delete employee?')) {
            this.staff.splice(index, 1);
            this.save();
            this.displayStaff();
            this.updateDashboard();
            this.showToast('✓ Employee deleted!', 'success');
        }
    }

    addProperty(e) {
        e.preventDefault();
        const prop = {
            name: document.getElementById('propName').value,
            price: Number(document.getElementById('propPrice').value),
            location: document.getElementById('propLocation').value,
            type: document.getElementById('propType').value
        };

        this.properties.push(prop);
        this.save();
        this.displayProperties();
        this.updateDashboard();
        e.target.reset();
        this.showToast('🏠 Property added!', 'success');
    }

    displayProperties() {
        const tbody = document.getElementById('propertyList');
        tbody.innerHTML = this.properties.map((p, i) => `
            <tr>
                <td>${p.name}</td>
                <td>${p.location}</td>
                <td>${p.type}</td>
                <td>₦${p.price.toLocaleString()}</td>
                <td><button class="btn btn-danger" onclick="app.deleteProperty(${i})">🗑 Delete</button></td>
            </tr>
        `).join('');
    }

    deleteProperty(index) {
        if (confirm('Delete property?')) {
            this.properties.splice(index, 1);
            this.save();
            this.displayProperties();
            this.updateDashboard();
            this.showToast('✓ Property deleted!', 'success');
        }
    }

    recordSale(e) {
        e.preventDefault();
        const propId = Number(document.getElementById('saleProperty').value);
        const agentId = Number(document.getElementById('saleAgent').value);
        const date = document.getElementById('saleDate').value;

        if (propId >= 0 && agentId >= 0) {
            const prop = this.properties[propId];
            const agents = this.staff.filter(s => s.department?.toLowerCase().includes('marketing'));
            const agent = agents[agentId];
            const commission = prop.price * 0.05;

            this.sales.push({
                property: prop.name,
                agent: agent.name,
                date: date,
                price: prop.price,
                commission: commission
            });

            agent.commission = (agent.commission || 0) + commission;
            this.save();
            this.displaySales();
            this.updateDashboard();
            e.target.reset();
            this.showToast(`🎉 Sale recorded! Commission: ₦${commission.toLocaleString()}`, 'success');
        }
    }

    displaySales() {
        const tbody = document.getElementById('salesList');
        tbody.innerHTML = this.sales.map((s, i) => `
            <tr>
                <td>${s.property}</td>
                <td>${s.agent}</td>
                <td>${s.date}</td>
                <td>₦${s.price.toLocaleString()}</td>
                <td>₦${s.commission.toLocaleString()}</td>
                <td><button class="btn btn-danger" onclick="app.deleteSale(${i})">🗑 Delete</button></td>
            </tr>
        `).join('');
    }

    deleteSale(index) {
        if (confirm('Delete sale?')) {
            this.sales.splice(index, 1);
            this.save();
            this.displaySales();
            this.updateDashboard();
            this.showToast('✓ Sale deleted!', 'success');
        }
    }

    updateDashboard() {
        const agents = this.staff.filter(s => s.department?.toLowerCase().includes('marketing'));
        
        document.getElementById('staffCount').textContent = this.staff.length;
        document.getElementById('agentCount').textContent = agents.length;
        document.getElementById('propertyCount').textContent = this.properties.length;
        
        const totalComm = this.sales.reduce((sum, s) => sum + s.commission, 0);
        document.getElementById('commissionTotal').textContent = '₦' + totalComm.toLocaleString();

        this.updateCharts(agents);
        this.updateLeaderboard(agents);
    }

    updateCharts(agents) {
        const agentLabels = agents.map(a => a.name) || ['No Data'];
        const agentData = agents.map(a => 
            this.sales.filter(s => s.agent === a.name).reduce((sum, s) => sum + s.commission, 0)
        ) || [0];

        const ctx = document.getElementById('agentChart')?.getContext('2d');
        if (ctx && this.agentChart) this.agentChart.destroy();
        
        if (ctx) {
            this.agentChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: agentLabels,
                    datasets: [{
                        label: 'Commission (₦)',
                        data: agentData,
                        backgroundColor: '#2563eb'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true }
            });
        }
    }

    updateLeaderboard(agents) {
        const ranked = agents
            .map(a => ({
                name: a.name,
                comm: this.sales.filter(s => s.agent === a.name).reduce((sum, s) => sum + s.commission, 0)
            }))
            .sort((a, b) => b.comm - a.comm);

        const lb = document.getElementById('leaderboard');
        lb.innerHTML = ranked.map((a, i) => `
            <div class="leaderboard-item">
                <span class="leaderboard-rank">${i + 1}</span>
                <span class="leaderboard-name">${a.name}</span>
                <span>₦${a.comm.toLocaleString()}</span>
            </div>
        `).join('');
    }

    save() {
        localStorage.setItem('staff', JSON.stringify(this.staff));
        localStorage.setItem('properties', JSON.stringify(this.properties));
        localStorage.setItem('sales', JSON.stringify(this.sales));
    }

    showToast(msg, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = `toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// UI Functions
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    document.querySelectorAll('.navbar-menu a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');

    if (page === 'sales') {
        const agents = app.staff.filter(s => s.department?.toLowerCase().includes('marketing'));
        const propSel = document.getElementById('saleProperty');
        const agentSel = document.getElementById('saleAgent');
        
        propSel.innerHTML = '<option>Select Property</option>' +
            app.properties.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
        agentSel.innerHTML = '<option>Select Agent</option>' +
            agents.map((a, i) => `<option value="${i}">${a.name}</option>`).join('');
    }
}

function showAdmin() {
    document.getElementById('adminModal').classList.add('show');
}

function closeAdmin() {
    document.getElementById('adminModal').classList.remove('show');
}

function adminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    
    if (user === 'admin' && pass === 'admin123') {
        app.showToast('✅ Admin login successful!', 'success');
        closeAdmin();
    } else {
        app.showToast('❌ Invalid credentials!', 'error');
    }
}

// Initialize
const app = new CRMApp();
