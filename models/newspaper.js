const { type } = require('express/lib/response');
const mongoose = require('mongoose');
mongoURL = process.env.MONGO_URL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Connected Newspaper")

const uuid = require('uuid');
const Schema = mongoose.Schema

const NewspaperSchema = new Schema({
    uid: {
        type: String,
        default: uuid.v4()
    },
    title: {
        type: String,
        require: true
    },
    content: {
        type: String,
    },
    cover: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true
    },
    creator: {
        type: String,
        require: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'newspaper'
})

const NewspaperModel = mongoose.model('newspaper', NewspaperSchema)

module.exports = NewspaperModel