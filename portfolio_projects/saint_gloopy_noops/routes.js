// -----------------------------------------------------------------------
//                      Saint Gloopy Noops EHR Routes                    -
// -----------------------------------------------------------------------
const express = require('express');
const path = require('path'); 
const router = express.Router();

// Set a local views directory for this subproject
router.use((req, res, next) => {
    req.app.set('views', path.join(__dirname, 'views')); // Set EHR views folder
    next();
});

// Login Page
router.get('/', (req, res) => {
    res.render('login', { title: 'Login' }); // Render 'login.ejs' from "views/"
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' }); // Render 'login.ejs' from "views/"
});

// Signup Page
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup' }); // Render 'signup.ejs' from "views/"
});

// Dashboard Page
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' }); // Render 'dashboard.ejs' from "views/"
});

module.exports = router;
