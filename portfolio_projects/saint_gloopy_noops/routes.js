const express = require('express');
const path = require('path'); 
const { ehrDB } = require('../../server'); // Import EHR Database
const User = require('./models/User')(ehrDB); 
const router = express.Router();

// Set a local views directory for this subproject
router.use((req, res, next) => {
    req.app.set('views', path.join(__dirname, 'views')); // Set EHR views folder
    res.locals.currentPath = req.path;
    next();
});

// Login Route
router.get('/', (req, res) => res.redirect('/saint-gloopy-noops/login'));
router.get('/login', (req, res) => res.render('login', { title: "Login" }));
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: "Incorrect username, please try again." });
        } else if (!(await user.comparePassword(password))) {
            return res.status(400).json({ error: "Incorrect password, please try again." });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        res.json({ success: true, redirect: "/saint-gloopy-noops/dashboard" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
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
        console.error(error);
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
