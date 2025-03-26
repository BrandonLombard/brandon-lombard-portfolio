const bcrypt = require('bcrypt');
const axios = require("axios");

const {
    Project,
    About,
    Education,
    WorkExperience,
    Contact,
    AdminUser,
    VisitorData
  } = require('./models');

// ------------------------------------------------
//                      Routes                    -
// ------------------------------------------------
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
        const projects = await Project.find(); // Fetch all projects from MongoDB
        projects.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)); // Sort newest to oldest
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

// Handle Contact Form Submission with Turnstile CAPTCHA Verification
router.post("/submit-form", async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const token = req.body["cf-turnstile-response"];

        // Check for missing form fields
        if (!name || !email || !message) {
            return res.status(400).render("contact", { 
                title: "Contact", 
                error: "Name, email, and message are required." 
            });
        }

        // Check if CAPTCHA token is present
        if (!token) {
            return res.status(400).render("contact", { 
                title: "Contact", 
                error: "CAPTCHA verification failed. Please try again." 
            });
        }

        // Verify Turnstile CAPTCHA with Cloudflare
        const captchaVerifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
        const captchaResponse = await axios.post(
            captchaVerifyUrl,
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

        // Save form data to MongoDB
        const newContact = new Contact({ name, email, phoneNumber: phone, message });
        await newContact.save();

        // Render the contact page with success message
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

// Admin Route
router.get('/admin', (req, res) => {
    res.render('admin', { title: 'Admin', error: null });
});

router.post('/admin', async (req, res) => {
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
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.redirect('/admin');
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) return next();
    res.redirect('/admin');
}

router.get('/admin-panel', isAuthenticated, async (req, res) => {
    try {
      const visitors = await VisitorData.find().sort({ _id: -1 }).limit(100); // latest 100 visits
      res.render('admin-panel', {
        title: 'Admin Panel',
        success: null,
        error: null,
        session: req.session,
        visitors // ✅ pass it to EJS
      });
    } catch (err) {
      console.error("Error loading visitor data:", err);
      res.status(500).render("admin-panel", {
        title: "Admin Panel",
        error: "Could not load visitor data.",
        success: null,
        session: req.session,
        visitors: []
      });
    }
  });

// OpenAI Chat Route
router.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: message }],
        });

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: "Something went wrong with the AI response." });
    }
});

// System Architecture route that displays how the website is set up and its documentation
router.get('/architecture', async (req, res) => {
    try {
        const education = await Education.find();

        res.render('architecture', {  title: 'System Architecture' });
    } catch (err) {
        console.error('Error loading System Architecture page', err);
        res.status(500).send('Internal Server Error with /architecture route.');
    }
});

// Privacy Policy route
router.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy', { title: 'Privacy Policy', success: null, error: null });
});

module.exports = router;
