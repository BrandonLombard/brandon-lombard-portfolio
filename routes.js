// This file includes the mongoose schema and models that are then used in the routes

// ------------------------------------------------
//           Mongoose Schema and Models           -
// ------------------------------------------------
const axios = require("axios");
const mongoose = require('mongoose');
const OpenAI = require("openai"); // Import OpenAI library

// Portfolio page
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {type: String, required: true},
    image: { type: String, required: true},
    link: { type: String, required: true },
    last_updated:{ type: Date, required: true }
});

const Project = mongoose.model('projects', projectSchema);

// About Page
const aboutSchema = new mongoose.Schema({
    tagline: { type: String, required: true },
    interests: { type: [String], required: true },
    about_me: { type: [String], required: true}
});

const About = mongoose.model('about', aboutSchema);

// Resume Page
const educationSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    concentration: {type: String, required: false},
    school: { type: String, required: true },
    date_graduated: {type: Date, required: false}
});

const Education = mongoose.model('education', educationSchema);

const workExperienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: {type: Date, required: false},
    bullet_points: {type: [String], required: true},
    
});

const WorkExperience = mongoose.model('work_experience', workExperienceSchema);

// Contact Page 
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: {type: String, required: false},
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

// OpenAI API Setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Load API key from .env file
});

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
        console.log(about);
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



module.exports = router;
