const { response } = require('express')
const express = require('express')
var router = express.Router()
const common = require('./common.js')
const handle_response = require('../common/handle_response.js')

router.post('/check_token', async (req, res, next) => {
    token = req.body.token
    token = await common.get_token(token)
    if (!token) {
        response_data = handle_response.error(message = 'Token not found')
        return res.json(response_data)
    }
    response_data = handle_response.success(token)
    return res.json(response_data)
})

module.exports = router