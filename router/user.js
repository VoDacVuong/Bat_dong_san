const express = require('express')
const bcrypt = require('bcrypt');
const PAGE_SIZE = 10
const { json } = require('body-parser');
const app = express()
const upload = require('./upload');
const uuid = require('uuid');
const common = require('./common.js')
const { status } = require('express/lib/response');
const nodemailer = require('nodemailer')

var router = express.Router()
var UserModel = require("../models/user.js")
var TokenModel = require("../models/token.js")
var NewsModel = require("../models/news.js")
var jwt = require('jsonwebtoken');


const smtpTransport = nodemailer.createTestA

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
                    uid: uuid.v4(),
                    username: username,
                    password: password

                }, (err, user) => {
                    if (err) {
                        return res.json({
                            'message': 'Thông tin nhập không chính xác !',
                            'data': []
                        })
                    }
                    var token = jwt.sign({ 'username': user.username }, 'secret')
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
                    uid: user.uid,
                    activate: user.activate,
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
        username: username,
        activate: true
    }, (err, user) => {
        if (!user) {
            return res.status(400).json({
                'message': 'Tài khoản không tồn tại !',
                'data': []
            })
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) {
                return res.status(400).json({
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
                    uid: user.uid,
                    activate: user.activate,
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

// get news by user
router.post('/news', (req, res, next) => {
    token = req.body.token
    TokenModel.findOne({
        token: token
    }, (err, token) => {
        if (!token) {
            return res.json({
                'message': "Vui Long dang nhap, hoac token da het han",
                data: []
            })
        }
        acc = jwt.verify(token.token, 'secret')
        NewsModel.find({
            username: acc.username
        }, (err, news) => {
            return res.json({
                'message': 'Success',
                'data': news
            })
        })
    })
})

// deactivate user
router.post('/deactivate', async (req, res) => {
    uid = req.body.uid

    token = await common.check_token(req)
    if (!token) {
        return res.status(404).json({
            'message': 'Vui lòng đăng nhập hoặc token đã hết hạn !',
            'data': []
        })
    }
    user_req = await common.check_admin(token)
    if (!user_req) {
        return res.status(404).json({
            'message': 'Permission denied',
            'data': []
        })
    }

    user_deactivate = await common.deactivate_user(uid)

    if (user_deactivate) {
        // deactivate user
        user_deactivate.activate = false
        user_deactivate.save()

        // deactivate token
        await common.get_token_by_username(user_deactivate)
        return res.json({
            'message': 'Success',
            'data': []
        })
    }

    return res.status(404).json({
        'message': 'Contact admin for support',
        'data': []
    })
})

router.post('/logout', async (req, res, next) => {
    token = await common.check_token(req)
    if (!token) {
        return res.status(400).json({
            'message': 'Contact admin for support',
            'data': []
        })
    }
    token.status = false
    token.save()
    return res.json({
        'message': 'Success',
        'data': []
    })

})



module.exports = router