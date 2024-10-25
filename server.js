// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});


app.post('/login', async (req, res) => {
    console.log('Content-Type:', req.headers['content-type']); // Log the Content-Type
    console.log('Request Body:', req.body); // Log the request body

    const { username, password } = req.body;

    // Validation checks
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        // Find the user in the database
        const user = await User.findOne({ username });

        // Check if user exists and validate the password
        if (!user || user.password !== password) {
            return res.status(401).send('Invalid username or password.');
        }

        // If validation is successful
        res.send('User logged in successfully!');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal server error.');
    }
});


app.get('/welcome', (req, res) => {
    res.render('welcome'); // This will render the welcome.ejs file
});

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});