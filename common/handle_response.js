const { json } = require("express/lib/response")
const UserModel = require("../models/user")


module.exports = {
    success_ls: function (data, total, total_page) {
        return {
            'total': total,
            'total_page': total_page,
            'error_code': 200,
            'message': 'Success',
            'data': data
        }
    },
    success: function (data) {
        return {
            'error_code': 200,
            'message': 'Success',
            'data': data
        }
    },

    false: function (message) {
        return {
            'error_code': 400,
            'message': message,
            'data': []
        }
    },
}