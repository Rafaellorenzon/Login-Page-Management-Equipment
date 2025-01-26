function applyUsernameToSession() {
    fetch('/get-logged-user')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch logged user');
            }
            return response.json();
        })
        .then(data => {
            if (data.username) {
                const sessionButton = document.querySelector('.session-user');
                if (sessionButton) {
                    sessionButton.innerText = data.username;
                }
            }
        })
        .catch(error => {
            console.error('Error fetching logged user:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    applyUsernameToSession();
});


function leaveEquipment() {
    fetch('/leave_equipment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function openReportDamageModal() {
    document.getElementById("reportDamageModal").style.display = "block";
}

function closeReportDamageModal() {
    document.getElementById("reportDamageModal").style.display = "none";
    document.getElementById("damageOptions").style.display = "none"; 
    document.getElementById("equipmentInput").style.display = "block";
}

window.onclick = function(event) {
    const checkEquipmentModal = document.getElementById("checkEquipmentModal");
    const reportDamageModal = document.getElementById("reportDamageModal");

    if (event.target == checkEquipmentModal) {
        checkEquipmentModal.style.display = "none";
    }

    if (event.target == reportDamageModal) {
        closeReportDamageModal();
    }
};

function showDamageOptions() {
    const equipmentName = document.getElementById("damagedEquipmentName").value;
    if (equipmentName.trim() === "") {
        alert("Please enter a valid equipment name.");
        return;
    }
    document.getElementById("equipmentInput").style.display = "none"; 
    document.getElementById("damageOptions").style.display = "block";
}

function checkIfDamaged(equipmentName) {
    return fetch('/check_if_damaged', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ equipment: equipmentName }),
    })
    .then(response => response.json());
}

function toggleDamage(toggle) {
    toggle.classList.toggle('problem');
}

function submitReport() {
    const damageToggles = document.querySelectorAll('.toggle.problem');
    const reportedDamages = [];

    damageToggles.forEach(toggle => {
        reportedDamages.push(toggle.getAttribute('data-status'));
    });

    const user = '{{ session["username"] }}';
    const equipment = document.getElementById("damagedEquipmentName").value;

    const data = {
        username: user,
        equipment: equipment,
        damages: reportedDamages
    };

    fetch('/report-damage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        alert('Damage report submitted!');
        closeReportDamageModal();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById("checkEquipmentBtn").onclick = function() {
    document.getElementById("checkEquipmentModal").style.display = "block";
}

document.getElementById("closeModalBtn").onclick = function() {
    document.getElementById("checkEquipmentModal").style.display = "none";
}

document.getElementById("damagedEquipmentName").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        showDamageOptions();
    }
});

document.getElementById("nextDamageBtn").onclick = function(event) {
    event.preventDefault();
    showDamageOptions(); 
};

document.getElementById("equipmentName").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        checkEquipmentStatus();
    }
});

document.getElementById("nextBtn").onclick = function(event) {
    event.preventDefault();
    checkEquipmentStatus();
}

function checkEquipmentStatus() {
    const equipmentName = document.getElementById('equipmentName').value;
    checkIfDamaged(equipmentName).then(response => {
        if (response.damaged) {
            alert(`This equipment ${equipmentName} was reported damaged by user ${response.user} on ${response.date}.`);
            document.getElementById("checkEquipmentModal").style.display = "none"; 
            return;
        }

        document.getElementById("firstStep").style.display = "none";
        document.getElementById("checklist").style.display = "block";
    });
}

document.getElementById("location").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("equipmentConditionToggle").focus(); 
    }
});

function toggleSwitch(toggle) {
    toggle.querySelector('.toggle').classList.toggle('ok');
    checkAllOk();
}

function checkAllOk() {
    const checkOkBtn = document.getElementById("checkOkBtn");
    const isToggleOn = document.getElementById('equipmentConditionToggle').classList.contains('ok');
    checkOkBtn.style.display = isToggleOn ? 'block' : 'none'; 
}

function submitChecklist() {
    const equipmentName = document.getElementById('equipmentName').value;
    const location = document.getElementById('location').value;
    const user = '{{ session["username"] }}';
    const password = '{{ session["password"] }}';
    const role = 'User';
    const status = 'Checked';

    const data = {
        username: user,
        password: password,
        role: role,
        location: location,
        equipment: equipmentName,
        status: status
    };

    fetch('/save-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        alert('Checklist submitted!');
        document.getElementById("checkEquipmentModal").style.display = "none";
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}