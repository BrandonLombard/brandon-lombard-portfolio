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
        const selectedCategories = [...checkboxes]
            .filter(checkbox => checkbox.checked && checkbox.value !== "All Projects")
            .map(checkbox => checkbox.value.trim()); // Trim spaces for better matching

        // Get all project cards
        const projectCards = projectList.querySelectorAll(".project-card");

        projectCards.forEach(card => {
            const projectCategory = card.getAttribute("data-category")?.trim(); // Ensure category is clean

            // If "All Projects" is checked OR no categories are selected, show all projects
            if (allProjectsCheckbox.checked || selectedCategories.length === 0) {
                card.style.display = "block";
            } else {
                // Show only projects that match the selected categories
                console.log(selectedCategories + projectCategory)
                card.style.display = selectedCategories.includes(projectCategory) ? "block" : "none";
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
