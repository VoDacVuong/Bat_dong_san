const express = require('express')
const PAGE_SIZE = 10
const upload = require('./upload');
const Resize = require('./resize');
const { json } = require('body-parser');
const app = express()
const path = require('path');
const uuid = require('uuid');

var FormData = require('form-data');
var data = new FormData();
var UserModel = require("../models/user.js")
var TokenModel = require("../models/token.js")
var NewsModel = require("../models/news.js")
var jwt = require('jsonwebtoken');
const { none } = require('./upload');
var router = express.Router()

// get all tin
router.post('/', (req, res, next) => {
    var title = req.body.title
    var type = req.body.type
    // var username = req.body.username
    var status = req.body.status || true
    var city = req.body.city
    var district = req.body.district
    var street = req.body.street
    var price = parseInt(req.body.price)
    var page = req.body.page
    if (page) {
        page = parseInt(page)
        if (page < 1) {
            page = 1
        }
        var skip = (page - 1) * PAGE_SIZE
        NewsModel.find({
        })
            .skip(skip)
            .limit(PAGE_SIZE)
            .then(data => {
                NewsModel.countDocuments({}).then((total) => {
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
        NewsModel.find({})
            .then(data => {
                NewsModel.countDocuments({}).then((total) => {
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

// upload ảnh
router.post('/upload_img', upload.array('imgs', 10), (req, res, next) => {
    var array_IMG = [];
    req.files.map(item => {
        array_IMG.push(item.filename);
    })
    res.json({
        array_IMG: array_IMG,
        result: true
    });
})

// Tao tin moi
router.post('/create', upload.array('imgs', 10), (req, res, next) => {
    var title = req.body.title
    var type = req.body.type
    // var username = req.body.username
    var status = req.body.status || true
    var city = req.body.city
    var district = req.body.district
    var street = req.body.street
    var price = req.body.price
    // upload hinh anh
    const files = req.files
    console.log(files)
    if (!files.length) {
        return res.json({
            'message': 'Vui long upload file !',
            'data': []
        })
    }

    var array_IMG = [];
    req.files.map(item => {
        array_IMG.push('http://' + req.headers.host + '/' + item.destination + '/' + item.filename);
    })

    token = req.body.token
    username = ''
    TokenModel.findOne({
        token: token,
        status: true
    })
        .then(data => {
            if (data) {
                account = jwt.verify(token, 'secret')
                username = account.username
                NewsModel.create({
                    uid: uuid.v4(),
                    title: title,
                    type: type,
                    username: username,
                    status: status,
                    price: price,
                    address: {
                        city: city,
                        district: district,
                        street: street
                    },
                    // img_avatar: 'http://' + req.headers.host + '/' + file.destination + '/' + file.filename
                    img_info: array_IMG
                })
                    .then(data => {
                        return res.json({
                            'message': 'Success',
                            'data': data
                        })
                    })
                    .catch(err => {
                        return res.json({
                            'message': 'Thong tin nhap khong dung hoac sai, vui long kiem tra lai !',
                            'data': []
                        })
                    })
            }
            else {
                return res.json({
                    'message': 'Vui Long dang nhap, hoac token da het han !',
                    'data': []
                })
            }
        })
})

// get detail
router.get('/:detail', (req, res, next) => {
    uid = req.query.uid
    console.log(req.query)
    console.log(req.params)
    NewsModel.find({
        uid: uid
    })
        .then(data => {
            if (data.length) {
                return res.json({
                    'message': 'Success',
                    'data': data
                })
            }
            else {
                return res.json({
                    'message': 'Khong co du lieu tuong ung!',
                    'data': []
                })
            }
        })
        .catch(err => {
            return res.json({
                'message': 'Contact admin for support',
                'data': []
            })
        })
})

// update news
router.post('/update', upload.array('imgs', 10), (req, res, next) => {
    token = req.body.token
    uid = req.body.uid

    var title = req.body.title
    var type = req.body.type
    // var username = req.body.username
    var status = req.body.status
    var city = req.body.city
    var district = req.body.district
    var street = req.body.street
    var price = req.body.price
    const files = req.files
    var array_IMG = undefined
    if (files.length) {
        array_IMG = []
        req.files.map(item => {
            array_IMG.push('http://' + req.headers.host + '/' + item.destination + '/' + item.filename);
        })
    }
    username = ''
    TokenModel.findOne({
        token: token,
        status: true
    }, (err, token) => {
        if (!token) {
            return res.json({
                'message': 'Vui Long dang nhap, hoac token da het han !',
                'data': []
            })
        }
        NewsModel.findOne({
            uid: uid
        }, (err, news) => {
            if (!news) {
                return res.json({
                    'message': 'Không tìm thấy tin tương ứng',
                    'data': []
                })
            }
            news.title = title || news.title
            news.type = type || news.type
            news.status = status || news.status
            news.price = price || news.price
            news.address.city = city || news.address.city
            news.address.district = district || news.address.district
            news.address.street = street || news.address.street
            news.img_info = array_IMG || news.img_info
            news.save()
            return res.json({
                'message': 'Success',
                'data': news
            })
        })
    })
})

// delete news
router.post('/delete', (req, res, next) => {
    uid = req.body.uid
    token = req.body.token
    TokenModel.findOne({
        token: token,
        status: true
    }, (err, token) => {
        if (!token) {
            return res.json({
                'message': 'Vui lòng đăng nhập, hoặc token đã hết hạn !',
                'data': []
            })
        }
        NewsModel.findOne({
            uid: uid
        }, (err, news) => {
            if (!news) {
                return res.json({
                    'message': 'Không tìm thấy tin tương ứng',
                    'data': []
                })
            }
            news.status = false
            news.save()
            return res.json({
                'message': 'Success',
                'data': news
            })
        })
    })

})

module.exports = router