document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-chat");
    const chatMessages = document.getElementById("chat-messages");

    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Display user message
        chatMessages.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;
        chatInput.value = "";

        // Send request to backend
        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            // Display bot response
            chatMessages.innerHTML += `<p><strong>ChatGPT:</strong> ${data.response}</p>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            chatMessages.innerHTML += `<p><strong>Error:</strong> Unable to fetch response.</p>`;
        }
    }

    sendButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") sendMessage();
    });
});