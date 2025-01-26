document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById("chatContainer");
  
    function toggleChat() {
      if (chatContainer.style.top === "62%") {
        chatContainer.style.top = "90%";
        chatContainer.style.width = "210px";
      } else {
        chatContainer.style.top = "62%";
        chatContainer.style.width = "240px";
      }
    }
  
    // Certifique-se de adicionar o evento ao botão diretamente
    const minimizeButton = document.querySelector(".minimize-chat");
    if (minimizeButton) {
      minimizeButton.addEventListener("click", toggleChat);
    }
  });
  

  