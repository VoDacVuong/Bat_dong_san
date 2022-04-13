const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
mongoURL = process.env.MONGO_URL || 'mongodb://localhost/BDS'
mongoose.connect(mongoURL);
console.log("Connected User")
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
    fullname: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['CUSTOMER', 'ADMIN'],
        default: 'CUSTOMER'
    },
    gender: {
        type: String,
        default: 'other',
        enum: ['Female', 'Male', 'other']
    },
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        unique: true,
        require: true
    },
    activate: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
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