const express = require('express')
const uuid = require('uuid');
const PAGE_SIZE = 10
const common = require('./common')
const handle_response = require('../common/handle_response');
var router = express.Router()
var AddressModel = require("../models/address.js")
var jwt = require('jsonwebtoken');
// const { response } = require('express');

router.get('/', async (req, res, next) => {
    skip = 0
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
    total_address = await common.find_and_count_entity(AddressModel, dict)
    address = await common.get_all_entity(AddressModel, dict, 0, total_address)
    response_data = handle_response.success_ls(address, total_address, 1)
    return res.json(response_data)
    // console.log(dict)
    // AddressModel.find(dict, (err, address) => {
    //     return res.json({
    //         'error_code': 200,
    //         'message': 'Success',
    //         'data': address
    //     })
    // })
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
                'error_code': 400,
                'message': 'Incorrect information',
                'data': []
            })
        }
        return res.json({
            'error_code': 200,
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
                'error_code': 400,
                'message': 'Không tìm thấy tin tương ứng',
                'data': []
            })
        }
        address.city = city || address.city
        address.district = district || address.district
        address.street = street || address.street
        address.save()
        return res.json({
            'error_code': 200,
            'message': 'Success',
            'data': address
        })
    })
})

module.exports = router