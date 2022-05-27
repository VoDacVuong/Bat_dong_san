const express = require('express')
const common = require('./common.js')
const PAGE_SIZE = 10
const handle_response = require('../common/handle_response')
const upload = require('./upload');

var NewspaperModel = require("../models/newspaper.js")
var router = express.Router()

// get all bài báo
router.post('/', async (req, res, next) => {
    var page = parseInt(req.body.page) || 1
    var page_size = parseInt(req.body.page_size) || PAGE_SIZE
    var news_fields = [
        'uid',
        'title',
        'status',
        'creator',
    ]
    var dict = {}
    for (var i of news_fields) {
        if (req.body[i] != undefined) {
            dict[i] = req.body[i]
        }
    }
    var skip = (page - 1) * page_size
    total_newspapers = await common.find_and_count_entity(NewspaperModel, dict)
    newspapers = await common.get_all_entity(NewspaperModel, dict, skip, page_size)
    response_data = handle_response.success_ls(newspapers, total_newspapers,Math.ceil(total_newspapers / page_size))
    return res.json(response_data)
})

router.get('/:detail',  async (req, res, next) =>{
    uid = req.query.uid
    newspaper = await common.get_newspaper_by_uid(uid)
    if(!newspaper){
        response_data = handle_response.error(message = "Newspaper not found !")
        return res.json(response_data)
    }
    response_data = handle_response.success(newspaper)
    return res.json(response_data)
})

// Tạo bài báo
router.post('/create', upload.single('cover'), async (req, res, next) => {
    token = req.body.token
    if (!await common.check_admin(token)) {
        response_data = handle_response.error('Permission denied')
        return res.json(response_data)
    }
    newspaper_fields = [
        'title',
        'content',
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