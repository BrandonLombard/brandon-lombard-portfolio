const express = require('express');
const axios = require("axios");
const ejs = require('ejs');
const mongoose = require('mongoose');
const ejsLayouts = require('express-ejs-layouts');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const router = express.Router();
const favicon = require('serve-favicon');

// -------------------- Database Connections --------------------
// Portfolio Site Database
const portfolioDB = mongoose.createConnection(
    `mongodb+srv://${encodeURIComponent(process.env.DB_USERNAME)}:${encodeURIComponent(process.env.DB_PASSWORD)}@brandon-lombard.ug8qz.mongodb.net/brandon-lombard-portfolio?retryWrites=true&w=majority`
);

// Saint Gloopy Noops EHR Database
const ehrDB = mongoose.createConnection(
    `mongodb+srv://${encodeURIComponent(process.env.DB_USERNAME)}:${encodeURIComponent(process.env.DB_PASSWORD)}@brandon-lombard.ug8qz.mongodb.net/saint-gloopy-noops?retryWrites=true&w=majority`
);

// Handle DB connection errors
portfolioDB.on('error', console.error.bind(console, 'Portfolio DB connection error:'));
portfolioDB.once('open', () => console.log('✅ Connected to Portfolio DB'));

ehrDB.on('error', console.error.bind(console, 'EHR DB connection error:'));
ehrDB.once('open', () => console.log('✅ Connected to EHR DB'));

// ✅ Export databases before importing routes
module.exports = { portfolioDB, ehrDB };

// -------------------- App Configuration --------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Serve the favicon
app.use(favicon(path.join(__dirname, 'public/images/', 'favicon.ico')));

// Set view engine
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layout');
app.use(express.static('public'));

// Tracks the user on the website and some of their data
const createTrackVisitor = require('./middleware/trackVisitor');
app.use(createTrackVisitor(portfolioDB));

// ✅ Import routes AFTER exporting databases
const portfolioRoutes = require('./routes');
const ehrRoutes = require('./portfolio_projects/saint_gloopy_noops/routes');
const miniAppRoutes = require('./portfolio_projects/mini-apps/routes');

app.use('/', portfolioRoutes);
app.use('/saint-gloopy-noops', ehrRoutes);
app.use('/apps', miniAppRoutes);

// Global 404 Catch-All (only triggers if no route was found in projects/main site)
app.use((req, res) => {
    res.status(404).render('404', { title: "Page Not Found" });
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
