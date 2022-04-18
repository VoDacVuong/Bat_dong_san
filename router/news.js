const express = require('express')
const PAGE_SIZE = 10
const upload = require('./upload');
const Resize = require('./resize');
const { json } = require('body-parser');
const app = express()
const path = require('path');
const uuid = require('uuid');
const common = require('./common.js')
const handle_response = require('../common/handle_response');

var FormData = require('form-data');
var data = new FormData();
var UserModel = require("../models/user.js")
var TokenModel = require("../models/token.js")
var NewsModel = require("../models/news.js")
var jwt = require('jsonwebtoken');
const { none, array } = require('./upload');
const fileSystem = require('fs');
const { vary } = require('express/lib/response');
var router = express.Router()
// var json2csv = require('json2csv').Parser
// var fastcsv = require('fast-csv')
// const objectstocsv = require('objects-to-csv')

// router.get('/export', async (req, res, next) => {
//     await NewsModel.find({}).lean().exec((err, data) => {
//         if (err) throw err;
//         const csvFields = ['_id', 'username', 'password']
//         console.log(csvFields);
//         const json2csvParser = new Json2csvParser({
//             csvFields
//         });
//         const csvData = json2csvParser.parse(data);
//         fs.writeFile("bezkoder_mongodb_fs.csv", csvData, function (error) {
//             if (error) throw error;
//             console.log("Write to bezkoder_mongodb_fs.csv successfully!");
//         });
//         res.send('File downloaded Successfully')
//     });


//     // data = [
//     //     { code: '1', name: 'Nguyen Van An' },
//     //     { code: '2', name: 'Nguyen Van Teo' },
//     //     { code: '3', name: 'Nguyen Van Ti' }
//     // ]
//     // data1 = []
//     // news = await common.get_all_entity_(NewsModel, { address: 0, img_info: 0, _id: 0, __v: 0 })
//     // for (var i in data) {
//     //     data1.push(data[i])
//     // }
//     // // console.log(news.toArray())
//     // const csv = new objectstocsv(data1)
//     // await csv.toDisk('./test.csv')
//     // // console.log(await csv.toString())
//     // res.download('./test.csv')
// })

router.get('/city', (req, res, next) => {
    NewsModel.find({}, (err, news) => {
        arr_city = []
        for (item of news) {
            arr_city.push(item.address.city)
        }
        return res.json({
            'error_code': 200,
            'message': 'Success',
            'data': arr_city
        })
    })
})

// get all tin
router.post('/', async (req, res, next) => {
    var page = parseInt(req.body.page) || 1
    var page_size = parseInt(req.body.page_size) || PAGE_SIZE
    var news_fields = [
        'title',
        'type',
        'status',
        'city',
        'district',
        'street',
        'price',
        'city',
        'district',
        'street'
    ]
    var dict = {}
    for (var i of news_fields) {
        if (req.body[i] != undefined) {
            if (i === 'city' || i == 'district' || i == 'street') {
                dict['address.' + i] = req.body[i]
            }
            else {
                dict[i] = req.body[i]
            }
        }
    }
    var skip = (page - 1) * page_size
    total_news = await common.find_and_count_entity(NewsModel, dict)
    news = await common.get_all_entity(NewsModel, dict, skip, page_size)
    response = handle_response.success_ls(news, total_news, Math.ceil(total_news / page_size))
    return res.json(response)
    // NewsModel.find(dict)
    //     .sort({
    //         created_at: '-1'
    //     })
    //     .skip(skip)
    //     .limit(page_size)
    //     .then(news => {
    //         var tongSoPage = Math.ceil(news.length / page_size)
    //         return res.json({
    //             'error_code': 200,
    //             'total': news.length,
    //             'total_page': tongSoPage,
    //             'message': 'Success',
    //             'data': news
    //         })
    //     })
    // if (page) {
    //     page = parseInt(page)
    //     if (page < 1) {
    //         page = 1
    //     }
    //     var skip = (page - 1) * PAGE_SIZE
    //     NewsModel.find({})
    //         .skip(skip)
    //         .limit(PAGE_SIZE)
    //         .then(data => {
    //             NewsModel.countDocuments({}).then((total) => {
    //                 var tongSoPage = Math.ceil(total / PAGE_SIZE)
    //                 return res.json({
    //                     'total': total,
    //                     'total_page': tongSoPage,
    //                     'message': 'Success',
    //                     'data': data
    //                 })
    //             })
    //         })
    //         .catch(err => {
    //             return res.json({
    //                 'message': 'Loi phan trang !',
    //                 'data': []
    //             })
    //         })
    // }
    // else {
    //     NewsModel.find({})
    //         .then(data => {
    //             NewsModel.countDocuments({}).then((total) => {
    //                 var tongSoPage = Math.ceil(total / PAGE_SIZE)
    //                 return res.json({
    //                     'total': total,
    //                     'total_page': tongSoPage,
    //                     'message': 'Success',
    //                     'data': data
    //                 })
    //             })
    //         })
    //         .catch(err => {
    //             return res.json({
    //                 'message': 'Contact admin for support',
    //                 'data': []
    //             })
    //         })
    // }
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
    var acreage = req.body.acreage
    var bedroom_no = req.body.bedroom_no
    var bathroom_no = req.body.bathroom_no
    // upload hinh anh
    const files = req.files
    console.log(files)
    if (!files.length) {
        return res.json({
            'error_code': 400,
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
                    img_info: array_IMG,
                    acreage: acreage,
                    bedroom_no: bedroom_no,
                    bathroom_no: bathroom_no
                })
                    .then(data => {
                        return res.json({
                            'error_code': 200,
                            'message': 'Success',
                            'data': data
                        })
                    })
                    .catch(err => {
                        return res.json({
                            'error_code': 400,
                            'message': 'Thong tin nhap khong dung hoac sai, vui long kiem tra lai !',
                            'data': []
                        })
                    })
            }
            else {
                return res.json({
                    'error_code': 400,
                    'message': 'Vui Long dang nhap, hoac token da het han !',
                    'data': []
                })
            }
        })
})

// get detail
router.get('/:detail', async (req, res, next) => {
    uid = req.query.uid

    news = await common.get_news_by_uid(uid)
    if (!news) {
        response_data = handle_response.error(message = 'News not found !')
        return res.json(response_data)
    }
    owner = await common.get_user_by_username(news.username, { email: 1, phone: 1, avatar: 1, _id: 0 })
    news['owner'] = owner
    response_data = handle_response.success(news)
    return res.json(response_data)

    // NewsModel.find({
    //     uid: uid
    // })
    //     .then(data => {
    //         if (data.length) {
    //             return res.json({
    //                 'error_code': 200,
    //                 'message': 'Success',
    //                 'data': data
    //             })
    //         }
    //         else {
    //             return res.json({
    //                 'error_code': 400,
    //                 'message': 'Khong co du lieu tuong ung!',
    //                 'data': []
    //             })
    //         }
    //     })
    //     .catch(err => {
    //         return res.json({
    //             'error_code': 400,
    //             'message': 'Contact admin for support',
    //             'data': []
    //         })
    //     })
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
    var acreage = req.body.acreage
    var bedroom_no = req.body.bedroom_no
    var bathroom_no = req.body.bathroom_no

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
                'error_code': 400,
                'message': 'Vui Long dang nhap, hoac token da het han !',
                'data': []
            })
        }
        NewsModel.findOne({
            uid: uid
        }, (err, news) => {
            if (!news) {
                return res.json({
                    'error_code': 400,
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
            news.acreage = acreage || news.acreage
            news.bedroom_no = bedroom_no || news.bedroom_no
            news.bathroom_no = bathroom_no || news.bathroom_no

            news.save()

            return res.json({
                'error_code': 200,
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
                'error_code': 400,
                'message': 'Vui lòng đăng nhập, hoặc token đã hết hạn !',
                'data': []
            })
        }
        NewsModel.findOne({
            uid: uid
        }, (err, news) => {
            if (!news) {
                return res.json({
                    'error_code': 400,
                    'message': 'Không tìm thấy tin tương ứng',
                    'data': []
                })
            }
            news.status = false
            news.save()
            return res.json({
                'error_code': 200,
                'message': 'Success',
                'data': news
            })
        })
    })

})



module.exports = router