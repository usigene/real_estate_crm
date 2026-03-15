// main.js
let staff = JSON.parse(localStorage.getItem("staff") || "[]");
let properties = JSON.parse(localStorage.getItem("properties") || "[]");
let sales = JSON.parse(localStorage.getItem("sales") || "[]");

// Save everything to localStorage
function save() {
    localStorage.setItem("staff", JSON.stringify(staff));
    localStorage.setItem("properties", JSON.stringify(properties));
    localStorage.setItem("sales", JSON.stringify(sales));
}

// Helper: return agents (Marketing dept)
function getAgents() {
    return staff.filter(s => s.department && s.department.toLowerCase().includes("marketing"));
}