// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const User = require('./models/User');
const session = require('express-session');
const MongoStore = require('connect-mongo');

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


// Session Middleware with MongoDB store
app.use(session({
    secret: 'your_secret_key',  // Replace with a secure key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: { maxAge: 15 * 1000 }  // Default session duration: 15 seconds
}));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});


app.post('/login', async (req, res) => {
    const { username, password, rememberMe } = req.body;

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

        // Set session expiration based on "Remember Me"
        if (rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
            req.session.cookie.maxAge = 15 * 1000; // 15 seconds
        }

        req.session.userId = user._id;
        console.log(`User ${username} logged in. Session ID: ${req.sessionID}`);

        // Redirect to welcome page after successful login
        return res.redirect('/welcome'); // Ensure this is the last response
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).send('Internal server error.');
    }
});


// app.get('/welcome', (req, res) => {
//     if (req.session.userId) {
//         console.log(`GET /welcome - User ${req.session.userId}`);
//         res.render('welcome');
//     } else {
//         console.log('Redirecting to login - No user session.');
//         res.redirect('/');
//     }
// });

// Logout Route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Failed to logout');
        }
        res.redirect('/'); // Redirect to login page
    });
});

app.get('/welcome', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/'); // Redirect to login if not authenticated
    }
    res.render('welcome'); // This will render the welcome.ejs file
});


app.get('/check-session', (req, res) => {
    console.log(`Check session for user: ${req.session.userId}`);
    if (req.session.userId) {
        res.sendStatus(200); // Session is active
    } else {
        res.sendStatus(401); // Session expired
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});