// Abrir o modal de adicionar usuário
document.addEventListener("DOMContentLoaded", () => {
    const addUserModal = document.querySelector(".modal-add-user");
    const saveUserButton = document.getElementById("saveUser");

    if (addUserModal && saveUserButton) {
        saveUserButton.addEventListener("click", () => {
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const role = document.getElementById("role").value;

            if (!username || !password || !role) {
                alert("All fields are mandatory!");
                return;
            }

            const newUser = {
                username: username,
                password: password,
                role: role,
                location: "Empty",
                equipment: "Empty" 
            };

            addUserToTable(newUser);
            saveUserToBackend(newUser);

            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
            document.getElementById("role").value = "admin";
        });
    }
});

function addUserToTable(user) {
    const userTableBody = document.getElementById("userTableBody");
    if (!userTableBody) {
        console.error("Erro: table not found");
        return;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.location}</td>
        <td>${user.equipment}</td>
        <td class="actions" style="text-align: center;">
            <span style="margin-right: 70px;">${user.role}</span>
            <form action="/remove_user/${user.username}" method="post" style="display:inline;">
                <button type="submit" class="remove-button">Remove</button>
            </form>
            <button class="edit-button" onclick="openEditModal('${user.username}', '${user.location}', '${user.equipment}', '${user.password}', '${user.role}')">Edit</button>
        </td>
    `;
    userTableBody.appendChild(row);
}
function saveUserToBackend(user) {
    fetch("/add_user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error saving user to server.");
            }
            return response.json();
        })
        .then(() => {
            alert("Usuário salvo com sucesso!");
        })
        .catch((err) => {
            console.error("Error saving user:", err);
            alert("Error saving user. Please try again.");
        });
}

function openEditModal(username, location, equipment, password, role) {
    if (username === "superuser") {
        alert("The superuser cannot be edited.");
        return;
    }

    const originalUser = document.getElementById("originalUser");
    const editUsername = document.getElementById("editUsername");
    const editPassword = document.getElementById("editPassword");
    const editRole = document.getElementById("editRole");
    const editLocation = document.getElementById("editLocation");
    const editEquipment = document.getElementById("editEquipment");

    if (editUsername) editUsername.classList.add("editUsername");
    if (editPassword) editPassword.classList.add("editPassword");
    if (editRole) editRole.classList.add("edit-input-role");
    if (editLocation) editLocation.classList.add("edit-input-location");
    if (editEquipment) editEquipment.classList.add("edit-input-equipment");

    if (originalUser && editUsername && editPassword && editRole && editLocation && editEquipment) {
        originalUser.value = username;
        editUsername.value = username;
        editPassword.value = password;
        editRole.value = role;
        editLocation.value = location;
        editEquipment.value = equipment;

        const editModal = document.getElementById("editUserModal");
        if (editModal) {
            editModal.style.display = "block";
        }

        populateDropdowns();
    } else {
        console.error("Erro: elementos do modal de edição não encontrados.");
    }
}

// Preencher os dropdowns de Location e Equipment
function populateDropdowns() {
    const locationDropdown = document.getElementById("locationDropdown");
    const editLocationDropdown = document.getElementById("editLocation");
    const equipmentDropdown = document.getElementById("equipmentDropdown");
    const editEquipmentDropdown = document.getElementById("editEquipment");

    if (locationDropdown && editLocationDropdown) {
        fetch("/static/location.json")
            .then((response) => response.json())
            .then((data) => {
                locationDropdown.innerHTML = ""; 
                editLocationDropdown.innerHTML = ""; 
                data.locations.forEach((location) => {
                    const option = document.createElement("option");
                    option.value = location;
                    option.text = location;
                    locationDropdown.add(option.cloneNode(true));
                    editLocationDropdown.add(option);
                });
            })
            .catch((err) => console.error("Erro ao carregar location.json:", err));
    }

    if (equipmentDropdown && editEquipmentDropdown) {
        fetch("/static/equipment.json")
            .then((response) => response.json())
            .then((data) => {
                equipmentDropdown.innerHTML = ""; 
                editEquipmentDropdown.innerHTML = ""; 
                data.equipments.forEach((equipment) => {
                    const option = document.createElement("option");
                    option.value = equipment.name;
                    option.text = equipment.name;
                    equipmentDropdown.add(option.cloneNode(true));
                    editEquipmentDropdown.add(option);
                });
            })
            .catch((err) => console.error("Erro ao carregar equipment.json:", err));
    }
}
