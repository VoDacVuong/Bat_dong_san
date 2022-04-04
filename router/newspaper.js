const express = require('express')
const common = require('./common.js')
const handle_response = require('../common/handle_response')
const upload = require('./upload');

var NewspaperModel = require("../models/newspaper.js")
var router = express.Router()

router.post('/create', upload.single('cover'), async (req, res, next) => {
    token = req.body.token
    if (!await common.check_admin(token)) {
        response_data = handle_response.error('Permission denied')
        return res.json(response_data)
    }
    newspaper_fields = [
        'title',
        'content',
        'creator',
    ]


    await common.validate_field_not_null(req, res, newspaper_fields)
    cover = common.get_file(req)
    NewspaperModel.create({
        title: req.body.title,
        content: req.body.content,
        cover: cover,
        creator: await common.get_token(token).username
    }, (error, newspaper) => {
        if (error) {
            response_data = handle_response.error(message = 'Contact admin for support')
            return res.json(response_data)
        }
        else {
            response_data = handle_response.success(newspaper)
            return res.json(response_data)
        }
    })
})

module.exports = router