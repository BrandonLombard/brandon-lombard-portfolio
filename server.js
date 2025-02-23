// -------------------- Imports --------------------
const express = require('express');
const axios = require("axios");
const ejs = require('ejs');
const mongoose = require('mongoose');
const ejsLayouts = require('express-ejs-layouts');
require('dotenv').config(); // Load environment variables
const session = require('express-session');
const routes = require('./routes'); // Load routes

// -------------------- App Configuration --------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing request bodies 
app.use(express.json()); // Parse JSON data
app.use(express.urlencoded({ extended: true })); // Parse form data

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));

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

// -------------------- Portfolio Site Routes and Mongoose Schema/Models help in routes.js --------------------
app.use('/', routes);

// -------------------- Saint Gloopy Noops EHR Project routes --------------------
const EHR_routes = require('./portfolio_projects/saint_gloopy_noops/routes'); // Load routes
app.use('/saint-gloopy-noops', EHR_routes);

// -------------------- Start Server --------------------
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
