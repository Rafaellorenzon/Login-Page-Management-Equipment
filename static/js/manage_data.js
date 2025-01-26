document.addEventListener("DOMContentLoaded", () => {
    loadData();
});

function loadData() {
    fetch("/static/equipment.json")
        .then((response) => {
            if (!response.ok) throw new Error("Failed to load equipment.json");
            return response.json();
        })
        .then((data) => populateTable(data.equipments, "equipmentTableBody"))
        .catch((error) => {
            console.error("Error loading equipments:", error);
            notificationManager.showNotification('error', 'Load Error', 'Failed to load equipment data.');
        });

    fetch("/static/location.json")
        .then((response) => {
            if (!response.ok) throw new Error("Failed to load location.json");
            return response.json();
        })
        .then((data) => populateTable(data.locations, "locationTableBody"))
        .catch((error) => {
            console.error("Error loading locations:", error);
            notificationManager.showNotification('error', 'Load Error', 'Failed to load location data.');
        });
}

function populateTable(data, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    tableBody.innerHTML = "";

    data.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name || entry}</td>
            <td class="actions">
                <button class="edit-button" onclick="editEntry(${index}, '${tableBodyId}')">Edit</button>
                <button class="remove-button" onclick="removeEntry(${index}, '${tableBodyId}')">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addEntryData(type) {
    const itemName = prompt(`Enter a new ${type === "equipment" ? "Equipment" : "Location"} name:`);

    if (itemName) {
        fetch(`/add_${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: itemName }),
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Failed to add ${type}`);
                return response.json();
            })
            .then(() => {
                loadData();
                notificationManager.showNotification(
                    'success',
                    'Add Successful',
                    `${type.charAt(0).toUpperCase() + type.slice(1)} "${itemName}" added successfully.`
                );
            })
            .catch((error) => {
                console.error(`Error adding ${type}:`, error);
                notificationManager.showNotification(
                    'error',
                    'Add Failed',
                    `Failed to add ${type} "${itemName}".`
                );
            });
    }
}

function editEntry(index, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    const currentName = tableBody.rows[index].cells[1].innerText;
    const newName = prompt("Edit entry name:", currentName);

    if (newName) {
        const fileType = tableBodyId === "equipmentTableBody" ? "equipment" : "location";
        fetch(`/edit_${fileType}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index, newName }),
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Failed to edit ${fileType}`);
                return response.json();
            })
            .then(() => {
                loadData();
                notificationManager.showNotification(
                    'success',
                    'Edit Successful',
                    `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} "${currentName}" renamed to "${newName}".`
                );
            })
            .catch((error) => {
                console.error("Error editing entry:", error);
                notificationManager.showNotification(
                    'error',
                    'Edit Failed',
                    `Failed to rename ${fileType} "${currentName}".`
                );
            });
    }
}

function removeEntry(index, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    const itemName = tableBody.rows[index].cells[1].innerText;

    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
        const fileType = tableBodyId === "equipmentTableBody" ? "equipment" : "location";
        fetch(`/remove_${fileType}/${index}`, { method: "POST" })
            .then((response) => {
                if (!response.ok) throw new Error(`Failed to remove ${fileType}`);
                return response.json();
            })
            .then(() => {
                loadData();
                notificationManager.showNotification(
                    'success',
                    'Remove Successful',
                    `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} "${itemName}" removed successfully.`
                );
            })
            .catch((error) => {
                console.error("Error removing entry:", error);
                notificationManager.showNotification(
                    'error',
                    'Remove Failed',
                    `Failed to remove ${fileType} "${itemName}".`
                );
            });
    }
}

function filterTable() {
    const filter = document.getElementById('searchInput').value.toLowerCase();
    filterTableById(filter, 'equipmentTableBody');
    filterTableById(filter, 'locationTableBody');
}

function filterTableById(filter, tableBodyId) {
    const rows = document.querySelectorAll(`#${tableBodyId} tr`);
    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let matchesFilter = false;

        for (let cell of cells) {
            if (cell.textContent.toLowerCase().includes(filter)) {
                matchesFilter = true;
                break;
            }
        }

        row.style.display = matchesFilter ? '' : 'none';
    });
}
