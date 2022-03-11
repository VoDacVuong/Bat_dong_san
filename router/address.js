const express = require('express')
const uuid = require('uuid');
const PAGE_SIZE = 2

var router = express.Router()
var AddressModel = require("../models/address.js")
var jwt = require('jsonwebtoken');

router.get('/', (req, res, next) => {
    var address_fields = [
        'city',
        'district',
        'street'
    ]
    var dict = {}
    for (var i of address_fields) {
        if (req.body[i] != undefined) {
            dict[i] = req.body[i]
        }
    }

    AddressModel.find(dict, (err, address) => {
        return res.json({
            'message': 'Success',
            'data': address
        })
    })
})

router.post('/create', (req, res, next) => {
    var city = req.body.city
    var district = req.body.district
    var street = req.body.street

    AddressModel.create({
        uid: uuid.v4(),
        city: city,
        district: district,
        street: street
    }, (err, address) => {
        if (err) {
            return res.json({
                'message': 'Vui lòng nhập chính xác thông tin !',
                'data': []
            })
        }
        return res.json({
            'message': 'Success',
            'data': address
        })
    })
})

router.post('/update', (req, res, next) => {
    var uid = req.body.uid
    var city = req.body.city
    var district = req.body.district
    var street = req.body.street

    AddressModel.findOne({
        uid: uid
    }, (err, address) => {
        if (!address) {
            return res.json({
                'message': 'Không tìm thấy tin tương ứng',
                'data': []
            })
        }
        address.city = city || address.city
        address.district = district || address.district
        address.street = street || address.street
        address.save()
        return res.json({
            'message': 'Success',
            'data': address
        })
    })
})

module.exports = router