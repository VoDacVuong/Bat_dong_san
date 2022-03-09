const mongoose = require('mongoose');
const { number, bool } = require('sharp/lib/is');
mongoURL = process.env.MONGO_URL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Da ket noi address")
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    uid: {
        type: String,
        unique: true
    },
    status: {
        type: Boolean,
        default: true
    },
    city: {
        type: String,
        unique: true,
        required: true

    },
    district: {
        type: String,
        unique: true,
        required: true
    },
    street: {
        type: String,
        unique: true,
        required: true
    }
}, {
    collection: 'address'
});

const AddressModel = mongoose.model('address', AddressSchema)
module.exports = AddressModel