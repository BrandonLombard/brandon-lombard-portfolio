// Constants
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
// const pageName = window.location.pathname.split('/').pop().split('?')[0].split('#')[0].replace(/\.[^/.]+$/, '');
const pageName = 'about';
// For hambuger menu
navToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
});

