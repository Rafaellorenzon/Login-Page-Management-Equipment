/* Modal session user and get username */

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
                const sessionModalButton = document.querySelector('.session-user-modal');
                if (sessionButton) {
                    sessionButton.innerText = data.username;
                }
                if (sessionModalButton) {
                    sessionModalButton.innerText = data.username;
                }
            }
        })
        .catch(error => {
            console.error('Error fetching logged user:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    applyUsernameToSession();

    const sessionUserButton = document.querySelector('.session-user');
    if (sessionUserButton) {
        sessionUserButton.addEventListener('click', () => {
            fetch('/get-logged-user')
                .then(res => res.json())
                .then(data => { 
                    if (data.username) {
                        const modalUsername = document.getElementById('modal-username');
                        if (modalUsername) {
                            modalUsername.innerText = data.username;
                        }
                    }
                })
                .catch(err => console.error('Error fetching user:', err));

            const sessionModal = document.getElementById('sessionModal');
            if (sessionModal) {
                sessionModal.style.display = 'block';
            }
        });
    }

    const closeSessionButton = document.querySelector('.close-session');
    if (closeSessionButton) {
        closeSessionButton.addEventListener('click', () => {
            const sessionModal = document.getElementById('sessionModal');
            if (sessionModal) {
                sessionModal.style.display = 'none';
            }
        });
    }

    window.addEventListener('click', (e) => {
        const sessionModal = document.getElementById('sessionModal');
        if (e.target === sessionModal) {
            sessionModal.style.display = 'none';
        }
    });

    const logoutButton = document.getElementById('loggoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            fetch('/logout', { method: 'POST' })
                .then(() => window.location.href = '/login')
                .catch(err => console.error('Error logging out', err));
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('#equipmentTableBody tr');

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
    }
});

/* Functions Update, SetAllEmpty, SetAllNotChecked */

const notificationManager = new NotificationManager();

window.notCheckAll = function notCheckAll() {
    fetch('/not-check-all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            notificationManager.showNotification(
                'success',
                'Success',
                'All statuses changed to Not Checked!'
            );
            setTimeout(() => {
                location.reload();
            }, 700);
        } else {
            notificationManager.showNotification(
                'error',
                'Error',
                'Failed to change statuses to Not Checked.'
            );
        }
    })
    .catch(err => {
        console.error(err);
        notificationManager.showNotification(
            'error',
            'Error',
            'Server error while changing statuses.'
        );
    });
};


window.updateList = function updateList() {
    fetch('/update-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            notificationManager.showNotification(
                'success',
                'Success',
                'List updated successfully!'
            );
        } else {
            notificationManager.showNotification(
                'error',
                'Error',
                'Failed to update the list.'
            );
        }
    })
    .catch(err => {
        console.error(err);
        notificationManager.showNotification(
            'error',
            'Error',
            'Server error while updating the list.'
        );
    });
};

window.setAllToEmpty = function setAllToEmpty() {
    fetch('/set-all-empty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            notificationManager.showNotification(
                'success',
                'Success',
                'All equipments set to Empty successfully!'
            );
            window.notCheckAll();
        } else {
            notificationManager.showNotification(
                'error',
                'Error',
                'Failed to set equipments to Empty.'
            );
        }
    })
    .catch(err => {
        console.error(err);
        notificationManager.showNotification(
            'error',
            'Error',
            'Server error while setting equipments to Empty.'
        );
    });
};

console.log(notificationManager);
