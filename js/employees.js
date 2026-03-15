// Add drag-and-drop file upload functionality

const dropArea = document.getElementById('drop-area');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight the drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

// Remove highlight when dragleave or drop
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    [...files].forEach(uploadFile);
}

function uploadFile(file) {
    const url = 'YOUR_SERVER_URL'; // Replace with your server URL
    const formData = new FormData();
    formData.append('file', file);

    fetch(url, {
        method: 'POST',
        body: formData,
    })
    .then(() => { /* Handle success */ })
    .catch(() => { /* Handle error */ });
}