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
}, {
    collection: 'address'
});
AddressSchema.index({ 'city': 1, 'district': 1, 'street': 1 }, { unique: true })
const AddressModel = mongoose.model('address', AddressSchema)
module.exports = AddressModel