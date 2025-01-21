// -------------------- Imports --------------------
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const ejsLayouts = require('express-ejs-layouts');
require('dotenv').config(); // Load environment variables

// -------------------- App Configuration --------------------
const app = express();
const PORT = 3000;

// Set view engine and layouts
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layout');
mongoose.set('debug', true); // db debugging

// Serve static files from the 'public' directory
app.use(express.static('public'));

// -------------------- Database Connection --------------------
const uri = `mongodb+srv://${encodeURIComponent(process.env.DB_USERNAME)}:${encodeURIComponent(process.env.DB_PASSWORD)}@brandon-lombard.ug8qz.mongodb.net/brandon-lombard-portfolio?retryWrites=true&w=majority`;

mongoose
    .connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Could not connect to MongoDB:', err);
    });

// -------------------- Mongoose Schema and Models --------------------
// Portfolio page
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {type: String, required: true},
    link: { type: String, required: true }
});

const Project = mongoose.model('projects', projectSchema);

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

// -------------------- Routes --------------------
// Define routes inline (or move to a separate file for larger projects)
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us' });
});

app.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find(); // Fetch all projects from MongoDB
        res.render('projects', { projects, title: 'Projects' });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/resume', async (req, res) => {
    try {
        const education = await Education.find(); 
        const workExperience = await WorkExperience.find(); 

        res.render('resume', { education, workExperience, title: 'Resume' });
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Me' });
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
