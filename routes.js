const bcrypt = require('bcryptjs');
const axios = require("axios");
const crawlerUserAgents = require('crawler-user-agents'); // ✅ Bot detection library

const {
    Project,
    About,
    Education,
    WorkExperience,
    Contact,
    AdminUser,
    VisitorData
} = require('./models');

const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

// About route
router.get('/about', async (req, res) => {
    try {
        const about = await About.find();
        const aboutData = about[0];
        res.render('about', { about: aboutData, title: 'About' });
    } catch (err) {
        console.error('Error fetching about information:', err);
        res.status(500).send('Internal Server Error with /about route.');
    }
});

// Projects route
router.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        projects.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
        res.render('projects', { projects, title: 'Projects' });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send('Internal Server Error with /projects route.');
    }
});

// Resume route
router.get('/resume', async (req, res) => {
    try {
        const education = await Education.find();
        const workExperience = await WorkExperience.find();

        res.render('resume', { education, workExperience, title: 'Resume' });
    } catch (err) {
        console.error('Error fetching resume data:', err);
        res.status(500).send('Internal Server Error with /resume route.');
    }
});

// Contact route
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact', success: null, error: null });
});

// Contact form
router.post("/submit-form", async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const token = req.body["cf-turnstile-response"];

        if (!name || !email || !message) {
            return res.status(400).render("contact", {
                title: "Contact",
                error: "Name, email, and message are required."
            });
        }

        if (!token) {
            return res.status(400).render("contact", {
                title: "Contact",
                error: "CAPTCHA verification failed. Please try again."
            });
        }

        const captchaResponse = await axios.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            new URLSearchParams({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: token
            }).toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        if (!captchaResponse.data.success) {
            return res.status(400).render("contact", {
                title: "Contact",
                error: "CAPTCHA verification failed. Please try again."
            });
        }

        const newContact = new Contact({ name, email, phoneNumber: phone, message });
        await newContact.save();

        res.render("contact", {
            title: "Contact",
            success: "Message received! I will get back to you soon.",
            hideForm: true
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).render("contact", {
            title: "Contact",
            error: "Server Error. Please try again later."
        });
    }
});

// Admin login
router.get('/admin', (req, res) => {
    res.render('admin', { title: 'Admin', error: null });
});

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await AdminUser.findOne({ username });
        if (!admin) {
            return res.render('admin', { title: 'Admin', error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.render('admin', { title: 'Admin', error: 'Invalid credentials' });
        }

        req.session.isAuthenticated = true;
        res.redirect('/admin-panel');
    } catch (err) {
        console.error('Error during admin login:', err);
        res.status(500).render('admin', { title: 'Admin', error: 'Something went wrong.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('/admin');
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) return next();
    res.redirect('/admin');
}

// ✅ Bot detection function using crawler-user-agents
function isBot(userAgent) {
    return crawlerUserAgents.some(bot => new RegExp(bot.pattern, 'i').test(userAgent || ''));
}

// Admin panel
router.get('/admin-panel', isAuthenticated, async (req, res) => {
    try {
        const contact = await Contact.find();
        const allVisitors = await VisitorData.find().sort({ _id: -1 }).limit(100);

        const realVisitors = [];
        const botVisitors = [];

        for (const visitor of allVisitors) {
            const detectedBot = isBot(visitor.userAgent);
            if (visitor.isBot || detectedBot) {
                botVisitors.push(visitor);
            } else {
                realVisitors.push(visitor);
            }
        }

        res.render('admin-panel', {
            title: 'Admin Panel',
            session: req.session,
            realVisitors,
            botVisitors,
            contact,
            success: null,
            error: null
        });
    } catch (err) {
        console.error("Error loading visitor data:", err);
        res.status(500).render("admin-panel", {
            title: "Admin Panel",
            session: req.session,
            realVisitors: [],
            botVisitors: [],
            contact: [],
            success: null,
            error: "Could not load visitor data."
        });
    }
});

// System architecture
router.get('/architecture', async (req, res) => {
    try {
        res.render('architecture', { title: 'System Architecture' });
    } catch (err) {
        console.error('Error loading System Architecture page', err);
        res.status(500).send('Internal Server Error with /architecture route.');
    }
});

// Privacy policy
router.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy', { title: 'Privacy Policy', success: null, error: null });
});

module.exports = router;
