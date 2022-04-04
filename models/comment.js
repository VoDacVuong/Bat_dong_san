const mongoose = require('mongoose');
const { number } = require('sharp/lib/is');
mongoURL = process.env.MONGO_URL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Connected Comment")
const timestamp = Date.now();
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    entity: {
        type: String,
        require: true
    },
    message: String,
    creator: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'comment'
});

const CommentModel = mongoose.model('comment', CommentSchema)

module.exports = CommentModel