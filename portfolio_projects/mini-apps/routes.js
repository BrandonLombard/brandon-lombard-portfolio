const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path'); 

// Set a local views directory for this subproject
router.use((req, res, next) => {
    req.app.set('views', path.join(__dirname, 'views')); // Set apps views folder
    res.locals.currentPath = req.path;
    next();
});

// Set a local views directory for this subproject
router.get('/jobs', async (req, res) => {
    const { keyword = "Junior Software Developer", location = "remote", date_posted = "today", job_salary } = req.query;

    try {
        const options = {
            method: 'GET',
            url: 'https://jsearch.p.rapidapi.com/search',
            params: {
                query: `${keyword} in ${location}`,
                page: '1',
                num_pages: '2',
                date_posted,
                job_salary
            },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        const allJobs = response.data.data;

        res.render('jobs', {
            layout: path.join(__dirname, 'views', 'layout'),
            title: 'Junior Developer Jobs (Last 24 Hours)',
            jobs: allJobs,
            keyword,
            location,
            date_posted,
            job_salary,
            error: null
        });
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        res.status(500).render('jobs', {
            layout: path.join(__dirname, 'views', 'layout'),
            title: 'Junior Developer Jobs',
            jobs: [],
            error: 'Failed to fetch jobs',
            keyword,
            location,
            date_posted,
            job_salary
        });
    }
});
module.exports = router;