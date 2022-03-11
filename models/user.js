const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
mongoURL = process.env.MONGO_URL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Da ket noi model user")
const UserSchema = new Schema({
    uid: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        unique: true
    },
    password: String,
    fullname: String,
    role: {
        type: String,
        enum: ['CUSTOMER', 'ADMIN'],
        default: 'CUSTOMER'
    },
    gender: {
        type: String,
        enum: ['Female', 'Male']
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    activate: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        default: ''
    }
}, {
    collection: 'user'
});

// Mã hóa password
UserSchema.pre('save', function (next) {
    if (!this.isModified("password")) return next();
    bcrypt.hash(this.password, 10, (err, passwordHash) => {
        if (err) return next(err)
        this.password = passwordHash
        next();
    })
})

// UserSchema.method.comparePassword = function (password, cb) {
//     bcrypt.compare(password, this.password, (err, isMatch) => {
//         if(err) return cb(err)
//         else{
//             if(!isMatch) return cb(null, isMatch)
//             return cb(null, this)
//         }
//     })
// }

const UserModel = mongoose.model('user', UserSchema)
module.exports = UserModel

// for (let index = 1; index <= 20; index++) {
//     AccountModel.create({
//         username: "vodacvuong_" + index,
//         password: "12345"
//     })
// }