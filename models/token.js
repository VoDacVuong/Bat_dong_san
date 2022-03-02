const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/BDS');

const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    token: String,
    username: String,
    status: Boolean
}, {
    collection: 'token'
});

const TokenModel = mongoose.model('token', TokenSchema)
module.exports = TokenModel