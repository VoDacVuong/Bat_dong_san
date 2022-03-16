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
        enum: [
            'BIET_THU',
            'NHA_VUON',
            'NHA_PHO',
            'CHUNG_CU',
            'CAN_HO'
        ],
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
    acreage: {
        type: Number,
        default: 0
    },
    bedroom_no: {
        type: Number,
        default: 0
    },
    bathroom_no: {
        type: Number,
        default: 0
    },
    note: String,
    created_at: {
        type: Date,
        default: Date.now
    }

}, {
    collection: 'news'
});

const NewsModel = mongoose.model('news', NewsSchema)
module.exports = NewsModel