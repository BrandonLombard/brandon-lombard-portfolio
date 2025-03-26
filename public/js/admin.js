function toggleVisitorDetails(index) {
    const el = document.getElementById(`visitor-${index}`);
    const arrow = el.previousElementSibling.querySelector('.toggle-arrow');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
    arrow.textContent = el.style.display === 'none' ? '▼' : '▲';
}

// Optional: Collapse all on load
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".visitor-details").forEach(el => el.style.display = 'none');
});