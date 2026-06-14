require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Hospital Appointment System running on port ' + PORT);
    console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
});

module.exports = app;