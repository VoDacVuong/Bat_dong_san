const express = require('express')
const bcrypt = require('bcrypt');
const PAGE_SIZE = 10
const { json } = require('body-parser');
const app = express()
const upload = require('./upload');
const uuid = require('uuid');
const common = require('./common.js')
const { status, type } = require('express/lib/response');
const path = require('path')
const nodemailer = require('nodemailer')
const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'acc.deviuh@gmail.com',
        pass: 'Vuong2905m'
    }
})

var router = express.Router()
var UserModel = require("../models/user.js")
var TokenModel = require("../models/token.js")
var NewsModel = require("../models/news.js")
var jwt = require('jsonwebtoken');
const handle_response = require('../common/handle_response');


router.post("/", async (req, res, next) => {
    var page = parseInt(req.body.page) || 1
    var page_size = parseInt(req.body.page_size) || PAGE_SIZE

    var user_fields = [
        'activate'
    ]
    var dict = {}
    for (var i of user_fields) {
        if (req.body[i] != undefined) {
            dict[i] = req.body[i]
        }
    }
    var skip = (page - 1) * page_size
    total_user = await common.find_and_count_entity(UserModel, dict)
    users = await common.get_all_entity(UserModel, dict, skip, page_size, projection = { password: 0 })
    response = handle_response.success_ls(users, total_user, Math.ceil(total_user / page_size))
    return res.json(response)
    // var page = req.body.page
    // if (page) {
    //     page = parseInt(page)
    //     if (page < 1) {
    //         page = 1
    //     }
    //     var skip = (page - 1) * PAGE_SIZE
    //     UserModel.find({})
    //         .skip(skip)
    //         .limit(PAGE_SIZE)
    //         .then(data => {
    //             UserModel.countDocuments({}).then((total) => {
    //                 var tongSoPage = Math.ceil(total / PAGE_SIZE)
    //                 return res.json({
    //                     'error_code': 200,
    //                     'total': total,
    //                     'total_page': tongSoPage,
    //                     'message': 'Success',
    //                     'data': data
    //                 })
    //             })
    //         })
    //         .catch(err => {
    //             return res.json({
    //                 'error_code': 400,
    //                 'message': 'Loi phan trang !',
    //                 'data': []
    //             })
    //         })
    // }
    // else {
    //     UserModel.find({})
    //         .then(data => {
    //             UserModel.countDocuments({}).then((total) => {
    //                 var tongSoPage = Math.ceil(total / PAGE_SIZE)
    //                 return res.json({
    //                     'error_code': 200,
    //                     'total': total,
    //                     'total_page': tongSoPage,
    //                     'message': 'Success',
    //                     'data': data
    //                 })
    //             })
    //         })
    //         .catch(err => {
    //             return res.json({
    //                 'error_code': 400,
    //                 'message': 'Contact admin for support',
    //                 'data': []
    //             })
    //         })
    // }
})

// Dang ky tai khoan
router.post("/register", upload.single('avatar'), async (req, res) => {
    var username = req.body.username
    var password = req.body.password
    var email = req.body.email
    var fullname = req.body.fullname || ''
    var gender = req.body.gender || 'other'
    var phone = req.body.phone || ''
    var avatar = common.get_file(req)

    if (!username || !password || !email) {
        return res.json({
            'error_code': 400,
            'message': 'Vui long nhap day du thong tin username, password và email !',
            'data': []
        })
    }

    UserModel.findOne({
        username: username
    })
        .then(data => {
            if (data) {
                return res.json({
                    'error_code': 400,
                    'message': 'Username da ton tai!',
                    'data': []
                })
            }
            else {
                UserModel.create({
                    uid: uuid.v4(),
                    username: username,
                    password: password,
                    email: email,
                    avatar: avatar

                }, (err, user) => {
                    if (err) {
                        return res.json({
                            'error_code': 400,
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
                            var mailOptions = {
                                from: 'acc.deviuh@gmail.com',
                                to: email,
                                subject: 'Active account',
                                text: 'Xin chào ' + username + '. Để kích hoạt tài khoản của bạn vui lòng xác nhận: ' + 'http://' + req.headers.host + '/api/v1/user/active?username=' + username
                            };
                            smtpTransport.sendMail(mailOptions, (err, info) => {
                                if (err) {
                                    console.log(err)
                                    return res.json({
                                        'error_code': 400,
                                        'message': 'Contact admin for support',
                                        'data': []
                                    })
                                }
                                else {
                                    console.log('Email sent: ' + info.response);
                                }
                            })
                            return res.json({
                                'error_code': 200,
                                // 'token': token,
                                'message': 'Success',
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
                'error_code': 400,
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
                    'error_code': 400,
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
                'error_code': 200,
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
            return res.json({
                'error_code': 400,
                'message': 'Tài khoản không tồn tại !',
                'data': []
            })
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({
                    'error_code': 400,
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
                'error_code': 200,
                'message': 'Success',
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
router.get('/profile', async (req, res, next) => {
    uid = req.query.uid
    user = await common.get_user_by_uid(uid)
    response_data = handle_response.success(user)
    return res.json(response_data)
    // token = req.body.token
    // TokenModel.findOne({
    //     token: token,
    //     status: true
    // }, (err, token) => {
    //     if (!token) {
    //         return res.json({
    //             'error_code': 400,
    //             'message': "Vui Long dang nhap, hoac token da het han",
    //             data: []
    //         })
    //     }
    //     acc = jwt.verify(token.token, 'secret')
    //     UserModel.findOne({
    //         username: acc.username
    //     }, (err, user) => {
    //         if (!user) {
    //             return res.json({
    //                 'error_code': 400,
    //                 'message': 'User không tồn tại !',
    //                 'data': []
    //             })
    //         }
    //         return res.json({
    //             'error_code': 200,
    //             'message': 'Success',
    //             'data': {
    //                 username: user.username,
    //                 fullname: user.fullname,
    //                 role: user.role,
    //                 gender: user.gender,
    //                 phone: user.phone,
    //                 avatar: user.avatar
    //             }
    //         })
    //     })
    // })
})

// get news by user
router.post('/news', async (req, res, next) => {
    var page = parseInt(req.body.page) || 1
    var page_size = parseInt(req.body.page_size) || PAGE_SIZE

    token = await common.check_token(req)
    console.log(token)
    if (!token) {
        response = handle_response.error(message = 'Vui lòng đăng nhập, hoặc token đã hết hạn !')
        return res.json(response)
    }

    acc = jwt.verify(token.token, 'secret')
    dict = {
        username: acc.username
    }

    var skip = (page - 1) * page_size
    total_news = await common.find_and_count_entity(NewsModel, dict)
    news = await common.get_all_entity(NewsModel, dict, skip, page_size)
    response = handle_response.success_ls(news, total_news, Math.ceil(total_news / page_size))

    return res.json(response)

    // token = req.body.token
    // TokenModel.findOne({
    //     token: token
    // }, (err, token) => {
    //     if (!token) {
    //         return res.json({
    //             'error_code': 400,
    //             'message': "Vui Long dang nhap, hoac token da het han",
    //             data: []
    //         })
    //     }
    //     acc = jwt.verify(token.token, 'secret')
    //     NewsModel.find({
    //         username: acc.username
    //     }, (err, news) => {
    //         return res.json({
    //             'error_code': 200,
    //             'message': 'Success',
    //             'data': news
    //         })
    //     })
    // })
})

// deactivate user
router.post('/deactivate', async (req, res) => {
    token = req.body.token
    uid = req.body.uid

    if (!await common.check_admin(token)) {
        response_data = handle_response.error('Permission denied')
        return res.json(response_data)
    }

    user = await common.get_user_by_uid(uid)
    if (!user) {
        response_data = handle_response.error('User không tồn tại !')
        return res.json(response_data)
    }

    await common.deactivate_user(user)
    response_data = handle_response.success([])
    return res.json(response_data)

    // token = await common.check_token(req)
    // if (!token) {
    //     return res.json({
    //         'error_code': 400,
    //         'message': 'Vui lòng đăng nhập hoặc token đã hết hạn !',
    //         'data': []
    //     })
    // }
    // user_req = await common.check_admin(token)
    // if (!user_req) {
    //     return res.json({
    //         'error_code': 400,
    //         'message': 'Permission denied',
    //         'data': []
    //     })
    // }

    // user_deactivate = await common.deactivate_user(uid)

    // if (user_deactivate) {
    //     // deactivate user
    //     user_deactivate.activate = false
    //     user_deactivate.save()

    //     // deactivate token
    //     await common.get_token_by_username(user_deactivate)
    //     return res.json({
    //         'error_code': 200,
    //         'message': 'Success',
    //         'data': []
    //     })
    // }

    // return res.json({
    //     'error_code': 400,
    //     'message': 'Contact admin for support',
    //     'data': []
    // })
})

// logout
router.post('/logout', async (req, res, next) => {
    token = await common.check_token(req)
    if (!token) {
        response_data = handle_response.error(message = 'Vui lòng đăng nhập !')
        return res.json(response_data)
    }
    common.deactivate_token(token)
    response_data = handle_response.success([])
    return res.json(response_data)
})

// active account
// router.get('/:active', async (req, res) => {
//     username = req.query.username
//     user = await common.get_user_by_username(username)
//     if (!user) {
//         return res.json({
//             // 'token': token,
//             'message': 'Đăng ký không thành công !',
//             'data': []
//         })
//     }
//     user.activate = true
//     user.save()
//     console.log(path)
//     var duongdanfile = path.join(__dirname, 'home.html')
//     res.sendFile(duongdanfile)
// })

module.exports = router