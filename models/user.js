const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/BDS');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    password: String,
    fullname: String,
    role: {
        type: String,
        default: 'CUSTOMER'
    },
    gender: String,
    phone: String,
}, {
    collection: 'user'
});

const UserModel = mongoose.model('user', UserSchema)
module.exports = UserModel

// for (let index = 1; index <= 20; index++) {
//     AccountModel.create({
//         username: "vodacvuong_" + index,
//         password: "12345"
//     })
// }