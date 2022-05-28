const mongoose = require('mongoose');

//mongoose.connect('mongodb+srv://dbUser:dbUser@cluster0.enbv6.mongodb.net/datasheet');
mongoose.connect(`mongodb://mongodb:27017/${process.env.DB_NAME}`);

module.exports = {
    Student: require('./Student'),
    Course: require('./Course'),
    Grade: require('./Grade'),
    Registration: require('./Registration')
};