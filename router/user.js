const express = require('express')
var UserModel = require("../models/user.js")
var TokenModel = require("../models/token.js")
var jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const app = express()
var router = express.Router()
const PAGE_SIZE = 2


router.get("/:id", (req, res) => {
    res.json(`Day là medthod GET ${req.params.id}`)
})

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
router.post("/register", (req, res) => {
    var username = req.body.username
    var password = req.body.password
    var fullname = req.body.fullname || ''
    var gender = req.body.gender || ''
    var phone = req.body.phone || ''
    var role = req.body.role || 'CUSTOMER'

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
                    role: role
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
router.post("/update", (req, res) => {
    var id = req.body.id
    var password = req.body.password
    UserModel.findOneAndUpdate({
        _id: id
    },
        {
            password: password
        })
        .then(data => {
            res.json("update thanh cong")
        })
        .catch(err => {
            res.json("update that bai")
        })
})

// Dang nhap
router.post('/login', (req, res, next) => {
    var username = req.body.username
    var password = req.body.password
    UserModel.findOne({
        username: username,
        password: password
    })
        .then(data => {
            if (data) {
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
                    'data': data
                })
            }
            else {
                return res.json("Tai khoan khong ton tai")
            }
        })
        .catch(err => {
            return res.json("Loi server")
        })

})

// get profile
router.post('/profile', (req, res, next) => {
    token = req.body.token
    TokenModel.findOne({
        token: token,
        status: true
    })
        .then(data => {
            if (data) {
                account = jwt.verify(token, 'secret')
                return res.json("Xin chao " + account.username)
            }
            else {
                return res.json("Vui Long dang nhap, hoac token da het han")
            }
        })
})

module.exports = router