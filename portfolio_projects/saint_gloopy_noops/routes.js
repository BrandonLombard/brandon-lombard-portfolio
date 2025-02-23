// -----------------------------------------------------------------------
//                      Saint Gloopy Noops EHR Routes                    
// -----------------------------------------------------------------------
const express = require('express');
const path = require('path'); 
const User = require('./models/User');
const router = express.Router();

// Set a local views directory for this subproject
router.use((req, res, next) => {
    req.app.set('views', path.join(__dirname, 'views')); // Set EHR views folder
    res.locals.currentPath = req.path; // Makes `currentPath` available in EJS
    next();
});

// Login Route
router.get('/login', (req, res) => res.render('login', { title: "Login" }));
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
        return res.status(400).send("Invalid username or password");
    }

    req.session.userId = user._id; // Store user session
    req.session.username = user.username; // Store username in session

    res.redirect('/saint-gloopy-noops/dashboard');
});

// Signup Route
router.get('/signup', (req, res) => res.render('signup', { title: "Sign Up" }));
router.post('/signup', async (req, res) => {
    try {
        const { username, password, firstname, lastname } = req.body;
        const user = new User({ username, password, firstname, lastname });
        await user.save();
        res.redirect('/saint-gloopy-noops/login');
    } catch (error) {
        res.status(400).send("Error signing up. Please try again.");
    }
});

// Protected Dashboard Route
router.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.redirect('/saint-gloopy-noops/login');
    res.render('dashboard', { username: req.session.username, title: "Dashboard" });
});

// Logout Route
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/saint-gloopy-noops/login'));
});

module.exports = router;
