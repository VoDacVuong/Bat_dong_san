const mongoose = require('mongoose');
const { number, object } = require('sharp/lib/is');
mongoURL = process.env.MONGO_URL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Connected News")

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
    note: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    block:{
        type: Boolean,
        default: true
    },
    owner: {
        type: Object,
        default: null
    }
}, {
    collection: 'news'
});

const NewsModel = mongoose.model('news', NewsSchema)
module.exports = NewsModel