document.querySelectorAll('.damage-details').forEach(details => {
    details.style.display = 'none'; 
});

document.querySelectorAll('.equipment-item').forEach(item => {
    item.addEventListener('click', () => {
        const details = item.querySelector('.damage-details');
        if (item.style.display !== 'none') { 
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
        }
    });
});

// Função para remover danos
function removeDamage(reportIndex) {
    fetch(`/remove_damage/${reportIndex}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Damage report removed successfully!');
            location.reload(); 
        } else {
            alert('Error removing damage report.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const equipmentItems = document.querySelectorAll('.equipment-item');

    equipmentItems.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(filter)) {
            item.style.display = ''; 
        } else {
            item.style.display = 'none';

            const details = item.querySelector('.damage-details');
            if (details) {
                details.style.display = 'none';
            }
        }
    });
}


