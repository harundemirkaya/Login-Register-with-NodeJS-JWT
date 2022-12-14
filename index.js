const express = require("express");
const app = express();
require('dotenv/config');

// Import Routes
const authRoute = require('./routes/auth');

// Connect Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect(
    process.env.DB_CONNECTION,
    () => {
    console.log("connected to db");
});

// Middlewares
app.use(express.json());

// Route Middlewares
app.use('/api/user', authRoute);


app.listen(3000, () => console.log("Server Up!"));
