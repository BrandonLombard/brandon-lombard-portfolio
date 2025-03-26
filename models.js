// ------------------------------------------------
//           Mongoose Schema and Models           -
// ------------------------------------------------
const mongoose = require('mongoose');
const OpenAI = require("openai"); // Import OpenAI library
const { portfolioDB } = require('./server.js'); // Import Portfolio DB

// Portfolio page
const Project = portfolioDB.model('projects', new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: [String], required: true },
    image: { type: String, required: true },
    link: { type: String, required: true },
    last_updated: { type: Date, required: true }
}));

// About Page
const About = portfolioDB.model('about', new mongoose.Schema({
    tagline: { type: String, required: true },
    interests: { type: [String], required: true },
    about_me: { type: [String], required: true }
}));

// Resume Page
// Education in the Resume Page
const Education = portfolioDB.model('education', new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    concentration: { type: String, required: false },
    school: { type: String, required: true },
    date_graduated: { type: Date, required: false }
}));

// Work Experience in the Resume Page
const WorkExperience = portfolioDB.model('work_experience', new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: false },
    bullet_points: { type: [String], required: true }
}));

// Contact Page 
const Contact = portfolioDB.model("contact", new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}));

// Admin user model
const AdminUser = portfolioDB.model('admin_user', new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true } // Hashed password
}));

// For tracking visitors on the website and what pages they visit
const VisitPageSchema = new mongoose.Schema({
    page: { type: String, required: true },
    timestamp: { type: Date, required: true }
}, { _id: true });

const VisitorSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    userAgent: { type: String, required: false },
    visits: [{
        page: { type: String, required: true },
        timestamp: { type: Date, required: true }
    }]
}, { timestamps: true });

const VisitorData = portfolioDB.model('VisitorData', VisitorSchema, 'visitors'); 

// OpenAI API Setup - IN PROGRESS
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Load API key from .env file
});

// Export all at once
module.exports = {
    Project,
    About,
    Education,
    WorkExperience,
    Contact,
    AdminUser,
    VisitorData
};