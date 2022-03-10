const mongoose = require('mongoose');
const { number } = require('sharp/lib/is');
mongoURL = process.env.MONGO_URL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Da ket noi model news")

const Schema = mongoose.Schema;

const NewsSchema = new Schema({
    uid: String,
    title: {
        type: String,
        required: true
    },
    price: Number,
    type: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    address: {
        city: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        }
    },
    img_avatar: {
        type: String,
    },
    img_info: {
        type: Object
    },
    note: String
}, {
    collection: 'news'
});

const NewsModel = mongoose.model('news', NewsSchema)
module.exports = NewsModel