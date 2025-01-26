class NotificationManager {
    constructor() {
        this.container = this.createContainer();
    }

    // Cria um contêiner para notificações
    createContainer() {
        let container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.left = '20px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
        return container;
    }

    // Função para obter o ícone baseado no tipo
    getIcon(type) {
        switch (type) {
            case 'success':
                return `
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M9 16.2l-4.2-4.2L5.2 11.6 9 15.4l7.8-7.8L17.6 6z" />
                    </svg>`;
            case 'warning':
                return `
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-8h2v6h-2z" />
                    </svg>`;
            case 'error':
                return `
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 18 12 14.41 8.41 18 7 16.59 10.59 13 7 9.41 8.41 8l3.59 3.59L15.59 8 17 9.41 13.41 13 17 16.59z" />
                    </svg>`;
            default:
                return '';
        }
    }

    // Mostra uma notificação
    showNotification(type, message, subText, duration = 5000) {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);

        notification.innerHTML = `
        <svg class="wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z" fill-opacity="1"></path>
        </svg>
        <div class="icon-container">
            ${this.getIcon(type)}
        </div>
        <div class="message-text-container">
          <p class="message-text">${message}</p>
          <p class="sub-text">${subText}</p>
        </div>
        <svg class="cross-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15">
          <path d="M11.78 4.03C12 3.81 12 3.44 11.78 3.22 11.56 3 11.19 3 10.97 3.22L7.5 6.69 4.03 3.22C3.81 3 3.44 3 3.22 3.22 3 3.44 3 3.81 3.22 4.03L6.69 7.5 3.22 10.97C3 11.19 3 11.56 3.22 11.78 3.44 12 3.81 12 4.03 11.78L7.5 8.31 10.97 11.78C11.19 12 11.56 12 11.78 11.78 12 11.56 12 11.19 11.78 10.97L8.31 7.5 11.78 4.03Z"></path>
        </svg>
      `;

        const closeIcon = notification.querySelector('.cross-icon');
        closeIcon.addEventListener('click', () => this.removeNotification(notification));

        this.container.appendChild(notification);

        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    // Remove uma notificação
    removeNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 500);
    }
}

// Crie uma instância global
window.notificationManager = new NotificationManager();


// Função Change Status
window.changeStatus = function changeStatus(equipmentId) {
    fetch(`/change-status/${equipmentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to change status');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            notificationManager.showNotification(
                'success',
                'Status Changed',
                `Status successfully changed for equipment ID ${equipmentId}.`
            );
        } else {
            notificationManager.showNotification(
                'error',
                'Error',
                `Failed to change status for equipment ID ${equipmentId}.`
            );
        }
    })
    .catch(err => {
        console.error(err);
        notificationManager.showNotification(
            'error',
            'Error',
            `Server error while changing status for equipment ID ${equipmentId}.`
        );
    });
};

// Função Remove Equipment
window.removeEquipment = function removeEquipment(equipmentId) {
    fetch(`/remove-equipment/${equipmentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to remove equipment');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            notificationManager.showNotification(
                'success',
                'Equipment Removed',
                `Equipment ID ${equipmentId} removed successfully.`
            );
        } else {
            notificationManager.showNotification(
                'error',
                'Error',
                `Failed to remove equipment ID ${equipmentId}.`
            );
        }
    })
    .catch(err => {
        console.error(err);
        notificationManager.showNotification(
            'error',
            'Error',
            `Server error while removing equipment ID ${equipmentId}.`
        );
    });
};

// Função Edit Equipment
window.editEquipment = function editEquipment(equipmentId, updatedData) {
    fetch(`/edit-equipment/${equipmentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to edit equipment');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            notificationManager.showNotification(
                'success',
                'Equipment Edited',
                `Equipment ID ${equipmentId} edited successfully.`
            );
        } else {
            notificationManager.showNotification(
                'error',
                'Error',
                `Failed to edit equipment ID ${equipmentId}.`
            );
        }
    })
    .catch(err => {
        console.error(err);
        notificationManager.showNotification(
            'error',
            'Error',
            `Server error while editing equipment ID ${equipmentId}.`
        );
    });
};


// notificacao de botoes 

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.change-status-button').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const form = button.closest('form'); 
            const actionUrl = form.action;

            fetch(actionUrl, {
                method: 'POST',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to change status');
                }
                return response.text();
            })
            .then(() => {
                notificationManager.showNotification(
                    'success',
                    'Status Changed',
                    'The status was successfully changed!'
                );

                const statusSpan = form.closest('tr').querySelector('td span');
                if (statusSpan) {
                    const currentStatus = statusSpan.innerText.trim();
                    const newStatus = currentStatus === 'Not Checked' ? 'Checked' : 'Not Checked';
                    statusSpan.innerText = newStatus;
                    statusSpan.className = newStatus === 'Checked' ? 'checked' : 'not-checked';
                }
            })
            .catch(err => {
                console.error(err);
                notificationManager.showNotification(
                    'error',
                    'Error',
                    'There was an error while changing the status.'
                );
            });
        });
    });

    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const form = button.closest('form'); 
            const actionUrl = form.action;

            fetch(actionUrl, {
                method: 'POST',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to remove user');
                }
                return response.text();
            })
            .then(() => {
                notificationManager.showNotification(
                    'success',
                    'User Removed',
                    'The user was successfully removed!'
                );

                const row = form.closest('tr');
                if (row) {
                    row.remove();
                }
            })
            .catch(err => {
                console.error(err);
                notificationManager.showNotification(
                    'error',
                    'Error',
                    'There was an error while removing the user.'
                );
            });
        });
    });

    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault(); 
            const form = button.closest('form'); 
            const formData = new FormData(form);
            const actionUrl = form.action;

            fetch(actionUrl, {
                method: 'POST', 
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to edit user');
                }
                return response.text(); 
            })
            .then(() => {
                notificationManager.showNotification(
                    'success',
                    'User Edited',
                    'The user was successfully edited!'
                );
            })
            .catch(err => {
                console.error(err);
                notificationManager.showNotification(
                    'error',
                    'Error',
                    'There was an error while editing the user.'
                );
            });
        });
    });
});
