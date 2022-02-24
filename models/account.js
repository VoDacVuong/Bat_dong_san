const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/demo_nodejs');

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    username: String,
    password: String
}, {
    collection: 'account'
});

const AccountModel = mongoose.model('account', AccountSchema)
module.exports = AccountModel

// for (let index = 1; index <= 20; index++) {
//     AccountModel.create({
//         username: "vodacvuong_" + index,
//         password: "12345"
//     })
// }