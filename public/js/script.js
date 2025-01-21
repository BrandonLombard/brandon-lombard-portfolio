// Constants
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
// const pageName = window.location.pathname.split('/').pop().split('?')[0].split('#')[0].replace(/\.[^/.]+$/, '');
const pageName = 'about';
// For hambuger menu
navToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
});

// Adds underline to current page on nav bar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const navElement = document.getElementById(pageName);
    if (navElement) {
        navElement.classList.add('current-page');
        console.log('Class added to:', navElement);
    } else {
        console.error(`Element with ID "${pageName}" not found`);
    }
});
