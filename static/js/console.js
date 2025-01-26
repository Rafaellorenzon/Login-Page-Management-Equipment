document.getElementById('searchInput').addEventListener('keyup', function() {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#historyTableBody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let shouldDisplay = false;
    
        for (let cell of cells) {
            if (cell.innerText.toLowerCase().includes(filter)) {
                shouldDisplay = true;
                break; 
            }
        }

        row.style.display = shouldDisplay ? '' : 'none'; 
    });
});
function showModal() {
    document.getElementById("confirmModal").style.display = "block";
}

function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
}


function clearHistory(download) {
    fetch('/clear_history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (download) {
            const filename = data.file_name; 
            if (filename) {
                window.location.href = `/download/${filename}`; 
            } else {
                console.error('Filename is undefined'); 
            }
        } else {
            alert(data.message); 
        }
        location.reload(); 
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    closeModal();
}

