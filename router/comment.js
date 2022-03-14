const { compare } = require('bcrypt')
const express = require('express')
const common = require('./common.js')

var router = express.Router()
var CommentModel = require("../models/comment.js")

router.post('/', (req, res, next) => {
    var comment_fields = [
        'news',
    ]
    var dict = {}
    for (var i of comment_fields) {
        if (req.body[i] != undefined) {
            dict[i] = req.body[i]
        }
    }
    console.log(dict)
    CommentModel.find(dict, (err, comments) => {
        return res.json({
            'message': 'Success',
            'data': comments
        })
    })
})

router.post('/create', async (req, res, next) => {
    token = await common.check_token(req)
    if (!token) {
        return res.json({
            'message': 'Vui lòng đăng nhập hoặc token đã hết hạn !',
            'data': []
        })
    }
    CommentModel.create({
        news: req.body.news_uid,
        message: req.body.message,
        user: token.username
    }, (err, comment) => {
        if (!comment) {
            console.log(req.body.news_uid)
            console.log(req.body.message)
            return res.json({
                'message': 'Thông tin không hợp lệ !',
                'data': []
            })
        }
        return res.json({
            'message': 'Success!',
            'data': comment
        })
    })
})

module.exports = router