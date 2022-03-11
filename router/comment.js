const express = require('express')
var router = express.Router()
var AddressModel = require("../models/comment.js")

router.post('/', (req, res, next) => {
    var comment_fields = [
        'news_uid',
    ]
    var dict = {}
    for (var i of comment_fields) {
        if (req.body[i] != undefined) {
            dict[i] = req.body[i]
        }
    }
})

module.exports = router