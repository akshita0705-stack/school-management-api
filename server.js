const db = require('./db');
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validation
    if (!name || !address || latitude == null || longitude == null) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'Latitude and Longitude must be numbers' });
    }

    const query = `
        INSERT INTO schools (name, address, latitude, longitude)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(201).json({
            message: 'School added successfully',
            schoolId: result.insertId
        });
    });
});

app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    // Validation
    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    const query = 'SELECT * FROM schools';

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        // Haversine formula
        const getDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;

            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) *
                Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        // Add distance to each school
        const schoolsWithDistance = results.map(school => {
            const distance = getDistance(
                userLat,
                userLon,
                school.latitude,
                school.longitude
            );

            return { ...school, distance };
        });

        // Sort by distance
        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        res.json(schoolsWithDistance);
    });
});