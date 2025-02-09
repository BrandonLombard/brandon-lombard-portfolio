// Constants
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
const currentYear = new Date().getFullYear();

// For hambuger menu
navToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
});

// To set the copyright year in the footer
document.getElementById("copyright").innerText = `© ${currentYear} Brandon Lombard`;