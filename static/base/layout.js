
function processDynamicMarkers(inputCode) {
    const lines = inputCode.split('\n'); 
    const processedLines = []; 

    lines.forEach((line, index) => {
        if (line.includes('!!')) {
            const previousLine = index > 0 ? lines[index - 1] : null;

            if (previousLine) {
                
                const elementTypeMatch = previousLine.match(/^<([a-zA-Z0-9-]+)/); 
                const elementType = elementTypeMatch ? elementTypeMatch[1] : null;

                
                const attributesMatch = previousLine.match(/ ([^=]+="[^"]*")/g); 
                const attributes = attributesMatch ? attributesMatch.join(' ') : '';

               
                const innerTextMatch = previousLine.match(/>(.*?)<\/[a-zA-Z0-9-]+>/);
                const innerText = innerTextMatch ? innerTextMatch[1] : '';

                
                let updatedLine = line;
                if (elementType) {
                    updatedLine = updatedLine.replace('!!', elementType);
                }
                if (attributes) {
                    updatedLine = updatedLine.replace('!!', attributes);
                }
                if (innerText) {
                    updatedLine = updatedLine.replace('!!', innerText);
                }

                processedLines.push(updatedLine); 
                return;
            }
        }

       
        processedLines.push(line);
    });

    return processedLines.join('\n'); 
}

// Exemplo de entrada
const inputCode = `
<div class="button-group">
    <button class="manage-users-button" onclick="location.href='{{ url_for('manage_users') }}'">Manage Users</button>
    <button !! !!>!!</button>
    <h2 class="title">Section Title</h2>
    <h2 !! !!>!!</h2>
    <div class="info-box" data-value="42">Info Box Content</div>
    <div !! !!>!!</div>
</div>
`;


// funcao de fechar modal edit ou outros futuramente

document.addEventListener("DOMContentLoaded", () => {
    const closeEditModalButton = document.getElementById("sessionModal");

    if (closeEditModalButton) {
        closeEditModalButton.addEventListener("click", () => {
            const editModal = document.getElementById("editUserModal");
            if (editModal) {
                editModal.style.display = "none"; 
            }
        });
    }
});

