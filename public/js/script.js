// Constants
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const currentYear = new Date().getFullYear();

// Hamburger menu toggle
navToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
});

// Set copyright year in the footer
document.getElementById("copyright").innerText = `© ${currentYear} Brandon Lombard`;

// Page handler
document.addEventListener("DOMContentLoaded", () => {
    // If on the Projects Page
    if (window.location.pathname.includes("/projects")) {
        initProjectFilters();
    }
});

// ------------------------
// Projects Page
// ------------------------

function initProjectFilters() {
    const checkboxes = document.querySelectorAll(".filter-options .filter-checkbox");
    const projectList = document.getElementById("project-list");
    const allProjectsCheckbox = document.querySelector('.filter-options .filter-checkbox[value="All Projects"]');

    if (!projectList) return; // Prevent errors if the project list is missing

    // Function to update project display based on selected checkboxes
    function updateProjectDisplay() {
        const selectedCategories = [...document.querySelectorAll(".filter-options .filter-checkbox:checked")]
            .map(checkbox => checkbox.value.trim())
            .filter(value => value !== "All Projects");
    
        const projectCards = document.querySelectorAll(".project-card");
    
        projectCards.forEach(card => {
            const projectCategories = card.dataset.categories 
                ? card.dataset.categories.split(",").map(cat => cat.trim()) 
                : [];
    
            // Log the project's category data
            console.log(`Project: ${card.querySelector("h2")?.innerText || "Unnamed"} - Categories:`, projectCategories);
    
            // If "All Projects" is checked OR no categories are selected, show all projects
            if (selectedCategories.length === 0) {
                card.style.display = "block";
            } else {
                // Show project if it has at least one matching category
                const hasMatchingCategory = selectedCategories.some(cat => projectCategories.includes(cat));
                card.style.display = hasMatchingCategory ? "block" : "none";
            }
        });
    
    }

    // Event listeners for checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            // If "All Projects" is checked, uncheck all other checkboxes
            if (checkbox.value === "All Projects" && checkbox.checked) {
                checkboxes.forEach(otherCheckbox => {
                    if (otherCheckbox !== checkbox) {
                        otherCheckbox.checked = false;
                    }
                });
            }

            // If any other checkbox is checked, uncheck "All Projects"
            if (checkbox.value !== "All Projects" && checkbox.checked) {
                allProjectsCheckbox.checked = false;
            }

            updateProjectDisplay(); // Call the function to update display
        });
    });

    // Ensure correct display when the page loads
    updateProjectDisplay();
}
