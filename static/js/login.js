fetch('/static/server.json')
.then(response => response.json())
.then(data => {
    const selectElement = document.getElementById('server');
    data.servers.forEach(server => {
        const option = document.createElement('option');
        option.value = server;
        option.text = server;
        selectElement.add(option);
    });
    if (selectElement.options.length > 0) {
        selectElement.selectedIndex = 0;
    }
})
.catch(error => console.error('Error loading servers:', error));