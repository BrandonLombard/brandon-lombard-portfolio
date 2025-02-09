// This file includes the mongoose schema and models that are then used in the routes

// ------------------------------------------------
//           Mongoose Schema and Models           -
// ------------------------------------------------
const mongoose = require('mongoose');

// Portfolio page
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {type: String, required: true},
    image: { type: String, required: true},
    link: { type: String, required: true }
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
    res.render('contact', { title: 'Contact' });
});

module.exports = router;
