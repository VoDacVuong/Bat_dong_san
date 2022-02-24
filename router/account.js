const express = require('express')
var AccountModel = require("../models/account.js")
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
    var page = req.query.page
    if (page) {
        page = parseInt(req.query.page)
        if (page < 1) {
            page = 1
        }
        var skip = (page - 1) * PAGE_SIZE
        AccountModel.find({})
            .skip(skip)
            .limit(PAGE_SIZE)
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json("loi phan trang")
            })
    }
    else {
        AccountModel.find({})
            .then(data => {
                res.json(data)
            })
            .catch(err => {
                res.json("loi")
            })
    }
})

router.post("/register", (req, res) => {
    var username = req.body.username
    var password = req.body.password

    AccountModel.findOne({
        username: username
    })
        .then(data => {
            if (data) {
                res.json("username da ton tai")
            }
            else {
                AccountModel.create({
                    username: username,
                    password: password
                })
                res.json("tao thanh cong")
            }
        })
})

router.post("/update", (req, res) => {
    var id = req.body.id
    var password = req.body.password
    // AccountModel.findByIdAndUpdate(id, {
    //     password: password
    // })
    //     .then(data => {
    //         res.json("update thanh cong")
    //     })
    //     .catch(err => {
    //         res.json("update that bai")
    //     })

    AccountModel.findOneAndUpdate({
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

router.post('/login', (req, res, next) => {
    var username = req.body.username
    var password = req.body.password
    AccountModel.findOne({
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