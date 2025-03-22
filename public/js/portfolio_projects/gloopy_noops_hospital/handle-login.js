async function handleLogin(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(form.action, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = result.redirect; // Redirect on success
        } else {
            showPopup(result.error); // Show error popup
        }
    } catch (error) {
        showPopup("An unexpected error occurred. Please try again.");
    }
}

function showPopup(message) {
    const popup = document.getElementById("popup");
    popup.innerText = message;
    popup.style.display = "flex";
} 