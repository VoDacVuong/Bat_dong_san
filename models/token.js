const mongoose = require('mongoose');
mongoURL = process.env.mongoURL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Da ket noi model token")
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