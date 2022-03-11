const mongoose = require('mongoose');
const { number } = require('sharp/lib/is');
mongoURL = process.env.MONGO_URL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Da ket noi model comment")

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    news: {
        type: String,
        require: true
    },
    message: String,
    user: {
        type: String,
        require: true,
        default: ''
    }
    // created_at: new Time
}, {
    collection: 'comment'
});

const CommentModel = mongoose.model('news', CommentSchema)
module.exports = CommentModel