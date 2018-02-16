const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/blog');
mongoose.Promise = global.Promise;

module.exports = mongoose;
