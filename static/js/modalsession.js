// Função para aplicar o nome de usuário ao botão
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

// Função para abrir e fechar o modal
function toggleSessionModal() {
    const modal = document.querySelector('.session-container'); 
    const closeModalButton = modal.querySelector('.close-session');

    // Mostra o modal ao clicar no botão "Session"
    const sessionButton = document.querySelector('.session-user');
    if (sessionButton) {
        sessionButton.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }
    

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            modal.style.display = 'none'; 
        });
    }
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyUsernameToSession();
    toggleSessionModal();
});


//Funcao clicar fora, fechar modal
function closeModalOnOutsideClick() {
    const sessionContainer = document.querySelector(".session-container");
    if (sessionContainer) {
        document.addEventListener("click", (event) => {
            if (!sessionContainer.contains(event.target) && event.target !== document.querySelector('.session-user')) {
                sessionContainer.style.display = "none";
            }
        });
    } else {
        console.error("Elemento '.session-container' não encontrado!");
    }
}
closeModalOnOutsideClick();


// Dashboard ----------------

function calculateDashboardFromTable() {
    const equipmentTableBody = document.getElementById("equipmentTableBody");

    if (!equipmentTableBody) {
        console.error("Tabela de equipamentos não encontrada.");
        return;
    }

    const rows = equipmentTableBody.getElementsByTagName("tr");

    let checkedCount = 0;
    let notCheckedCount = 0;
    let equipmentInUseCount = 0;

    Array.from(rows).forEach(row => {
        const cells = row.getElementsByTagName("td");
        const statusCell = cells[3]?.innerText.trim(); 
        const equipmentCell = cells[2]?.innerText.trim(); 

        if (statusCell === "Checked") {
            checkedCount++;
        } else if (statusCell === "Not Checked") {
            notCheckedCount++;
        }

        if (equipmentCell && equipmentCell !== "Empty") {
            equipmentInUseCount++;
        }
    });

    fetch('/static/equipment.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao carregar equipment.json");
            }
            return response.json();
        })
        .then(data => {
            const totalEquipments = data.equipments.length;
            const freeEquipments = totalEquipments - equipmentInUseCount;

            document.getElementById("checked-number").innerText = checkedCount;
            document.getElementById("nonchecked-number").innerText = notCheckedCount;
            document.getElementById("free-equipments-number").innerText = freeEquipments;

            const checkedPercent = (checkedCount / totalEquipments) * 100;
            const notCheckedPercent = (notCheckedCount / totalEquipments) * 100;
            const freePercent = (freeEquipments / totalEquipments) * 100;

            document.getElementById("checked-percent").style.width = `${checkedPercent}%`;
            document.getElementById("nonchecked-percent").style.width = `${notCheckedPercent}%`;
            document.getElementById("free-equipments-percent").style.width = `${freePercent}%`;
        })
        .catch(error => {
            console.error("Erro ao calcular o dashboard:", error);
        });
}

document.addEventListener("DOMContentLoaded", calculateDashboardFromTable);


/* dashboard damages equipment funcoes  */

function updateDamagesEquipmentDashboard() {
    const equipmentItems = document.querySelectorAll('.equipment-item');
    const damagedEquipments = new Set(); 
    const userReports = {};
    let totalReports = 0; 

    equipmentItems.forEach(item => {
       
        const equipmentNameElement = item.innerHTML.match(/Equipment Name:\s*([\w\s]+)/i);
        const equipmentName = equipmentNameElement ? equipmentNameElement[1].trim().toLowerCase() : null; 

        const reportedUserElement = item.innerHTML.match(/Reported by:\s*(\w+)/);
        const reportedUser = reportedUserElement ? reportedUserElement[1].trim() : null;

        totalReports++;

        if (equipmentName) {
            damagedEquipments.add(equipmentName);
        }

        if (reportedUser) {
            if (!userReports[reportedUser]) {
                userReports[reportedUser] = 0;
            }
            userReports[reportedUser]++;
        }
    });

    let mostReportedUser = 'None';
    let maxReports = 0;
    for (const user in userReports) {
        if (userReports[user] > maxReports) {
            maxReports = userReports[user];
            mostReportedUser = user;
        }
    }

    const damagedEquipElement = document.querySelector('.skill-equip-number');
    const totalReportsElement = document.querySelector('.skill-quantity-number');
    const mostReportedUserElement = document.querySelector('.skill-user');

    if (damagedEquipElement) {
        damagedEquipElement.innerText = damagedEquipments.size;
    }

    if (totalReportsElement) {
        totalReportsElement.innerText = totalReports;
    }

    if (mostReportedUserElement) {
        mostReportedUserElement.innerText = `User who reported the most: ${mostReportedUser}`;
    }
}

document.addEventListener('DOMContentLoaded', updateDamagesEquipmentDashboard);

// esconder dashboards //

document.addEventListener("DOMContentLoaded", () => {
    // Seleciona os elementos que serão alterados
    const headerMinimizeButton = document.getElementById("header-minimize");
    const newCard = document.querySelector(".card.new-card");
    const cardDamages = document.querySelector(".card-damages");
    const dashButtons = document.querySelector(".dash-bottons");
    const headerButtons = document.querySelector(".header-buttons");
    const headerMinimize = document.getElementById("header-minimize");

    // Verifica se todos os elementos existem
    if (!headerMinimizeButton || !newCard || !cardDamages || !dashButtons || !headerButtons || !headerMinimize) {
        console.error("One or more elements were not found.");
        return;
    }

    // Função para alternar entre dois estados
    function toggleDashboardPositions() {
        const isMinimized = newCard.style.left === "-14%"; // Verifica se está no estado minimizado

        if (isMinimized) {
            // Configuração para a posição normal
            newCard.style.left = "-1.5%";
            cardDamages.style.left = "-1.5%";
            dashButtons.style.left = "-1.5%";
            headerButtons.style.left = "-1.8%";
            headerMinimize.style.left = "14.5%";
        } else {
            // Configuração para a posição minimizada
            newCard.style.left = "-14%";
            cardDamages.style.left = "-14%";
            dashButtons.style.left = "-14%";
            headerButtons.style.left = "-14.2%";
            headerMinimize.style.left = "2.2%";
        }
    }

    // Adiciona o evento de clique ao botão
    headerMinimizeButton.addEventListener("click", toggleDashboardPositions);
});
