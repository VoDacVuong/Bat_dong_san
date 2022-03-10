const express = require('express')
const bcrypt = require('bcrypt');
const PAGE_SIZE = 2
const { json } = require('body-parser');
const app = express()
const upload = require('./upload');

var router = express.Router()
var UserModel = require("../models/user.js")
var TokenModel = require("../models/token.js")
var jwt = require('jsonwebtoken');


// router.get("/:id", (req, res) => {
//     res.json(`Day là medthod GET ${req.params.id}`)
// })

router.get("/", (req, res, next) => {
    var page = req.body.page
    if (page) {
        page = parseInt(page)
        if (page < 1) {
            page = 1
        }
        var skip = (page - 1) * PAGE_SIZE
        UserModel.find({})
            .skip(skip)
            .limit(PAGE_SIZE)
            .then(data => {
                UserModel.countDocuments({}).then((total) => {
                    var tongSoPage = Math.ceil(total / PAGE_SIZE)
                    return res.json({
                        'total': total,
                        'total_page': tongSoPage,
                        'message': 'Success',
                        'data': data
                    })
                })
            })
            .catch(err => {
                return res.json({
                    'message': 'Loi phan trang !',
                    'data': []
                })
            })
    }
    else {
        UserModel.find({})
            .then(data => {
                UserModel.countDocuments({}).then((total) => {
                    var tongSoPage = Math.ceil(total / PAGE_SIZE)
                    return res.json({
                        'total': total,
                        'total_page': tongSoPage,
                        'message': 'Success',
                        'data': data
                    })
                })
            })
            .catch(err => {
                return res.json({
                    'message': 'Contact admin for support',
                    'data': []
                })
            })
    }
})

// Dang ky tai khoan
router.post("/register", upload.single('avatar'), (req, res) => {
    var username = req.body.username
    var password = req.body.password
    var fullname = req.body.fullname || ''
    var gender = req.body.gender || ''
    var phone = req.body.phone || ''
    var role = req.body.role || 'CUSTOMER'
    var avatar = ''
    file = req.file
    if (file) {
        avatar = 'http://' + req.headers.host + '/' + file.destination + '/' + file.filename
    }
    if (!username || !password) {
        return res.json({
            'message': 'Vui long nhap day du thong tin username, password !',
            'data': []
        })
    }

    UserModel.findOne({
        username: username
    })
        .then(data => {
            if (data) {
                return res.json({
                    'message': 'Username da ton tai!',
                    'data': []
                })
            }
            else {
                UserModel.create({
                    username: username,
                    password: password,
                    fullname: fullname,
                    gender: gender,
                    phone: phone,
                    role: role,
                    avatar: avatar
                })
                var token = jwt.sign({ 'username': username }, 'secret')
                // var dulieu = jwt.verify(token, 'secret')
                // console.log(dulieu)
                TokenModel.create({
                    token: token,
                    username: username,
                    status: true
                })
                    .then(data => {
                        return res.json({
                            'token': token,
                            'message': 'Tao thanh cong',
                            'data': []
                        })
                    })
            }
        })
})

// update tai khoan
router.post("/update", upload.single('avatar'), (req, res) => {
    fullname = req.body.fullname
    gender = req.body.gender
    phone = req.body.phone
    token = req.body.token
    TokenModel.findOne({
        token: token,
        status: true
    }, (err, token) => {
        if (!token) {
            return res.json({
                'message': "Vui Long dang nhap, hoac token da het han",
                data: []
            })
        }
        acc = jwt.verify(token.token, 'secret')
        UserModel.findOne({
            username: acc.username
        }, (err, user) => {
            if (!user) {
                return res.json({
                    'message': 'User không tồn tại !',
                    'data': []
                })
            }
            avatar = ''
            file = req.file
            if (file) {
                avatar = 'http://' + req.headers.host + '/' + file.destination + '/' + file.filename
            }
            user.fullname = fullname || user.fullname
            user.gender = gender || user.gender
            user.phone = phone || user.phone
            user.avatar = avatar || user.avatar
            user.save()
            return res.json({
                'message': 'Success',
                'data': {
                    username: user.username,
                    fullname: user.fullname,
                    role: user.role,
                    gender: user.gender,
                    phone: user.phone,
                    avatar: user.avatar
                }
            })
        })
    })
})

// Dang nhap
router.post('/login', (req, res, next) => {
    var username = req.body.username
    var password = req.body.password

    UserModel.findOne({
        username: username
    }, (err, user) => {
        if (!user) {
            return res.json({
                'message': 'Tài khoản không tồn tại !',
                'data': []
            })
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({
                    'message': 'Vui lòng kiểm tra lại mật khẩu !',
                    'data': []
                })
            }
            var token = jwt.sign({ 'username': username }, 'secret')
            // var dulieu = jwt.verify(token, 'secret')
            // console.log(dulieu)
            TokenModel.updateMany({ username: username }, { status: false })
                .then(data => {
                    TokenModel.create({
                        username: username,
                        token: token,
                        status: true
                    })
                })
            return res.json({
                'token': token,
                'data': {
                    username: user.username,
                    fullname: user.fullname,
                    role: user.role,
                    gender: user.gender,
                    phone: user.phone
                }
            })
        })
    })

    // UserModel.findOne({
    //     username: username,
    //     password: password
    // })
    //     .then(data => {
    //         if (data) {
    //             var token = jwt.sign({ 'username': username }, 'secret')
    //             // var dulieu = jwt.verify(token, 'secret')
    //             // console.log(dulieu)
    //             TokenModel.updateMany({ username: username }, { status: false })
    //                 .then(data => {
    //                     TokenModel.create({
    //                         username: username,
    //                         token: token,
    //                         status: true
    //                     })
    //                 })
    //             return res.json({
    //                 'token': token,
    //                 'data': data
    //             })
    //         }
    //         else {
    //             return res.json("Tai khoan khong ton tai")
    //         }
    //     })
    //     .catch(err => {
    //         return res.json("Loi server")
    //     })

})

// get profile
router.get('/profile', (req, res, next) => {
    token = req.body.token
    TokenModel.findOne({
        token: token,
        status: true
    }, (err, token) => {
        if (!token) {
            return res.json({
                'message': "Vui Long dang nhap, hoac token da het han",
                data: []
            })
        }
        acc = jwt.verify(token.token, 'secret')
        UserModel.findOne({
            username: acc.username
        }, (err, user) => {
            if (!user) {
                return res.json({
                    'message': 'User không tồn tại !',
                    'data': []
                })
            }
            return res.json({
                'message': 'Success',
                'data': {
                    username: user.username,
                    fullname: user.fullname,
                    role: user.role,
                    gender: user.gender,
                    phone: user.phone,
                    avatar: user.avatar
                }
            })
        })
    })
})

module.exports = router