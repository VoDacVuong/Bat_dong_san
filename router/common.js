const nodemailer = require('nodemailer')
const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'acc.deviuh@gmail.com',
        pass: 'Vuong2905m'
    }
})

var UserModel = require("../models/user.js")
var TokenModel = require("../models/token.js")
var NewsModel = require("../models/news.js")


module.exports.check_token = async function (req) {
    return await TokenModel.findOne({ 'token': req.body.token, 'status': true });
}

module.exports.check_admin = async function (token) {
    return await UserModel.findOne({ 'username': token.username, 'activate': true, 'role': 'ADMIN' });
}

module.exports.deactivate_user = async function (uid) {
    return await UserModel.findOne({ 'uid': uid });
}

module.exports.deactivate_token = async function (user_deactivate) {
    return await TokenModel.find({ 'username': user_deactivate.username });
}

module.exports.get_token_by_username = async function (user_deactivate) {
    await TokenModel.updateMany({ 'username': user_deactivate.username }, { 'status': false });
}

module.exports.get_news_by_uid = async function (uid) {
    return await NewsModel.findOne({ 'uid': uid });
}

module.exports.get_user_by_username = async function (username) {
    return await UserModel.findOne({ username: username });
}

module.exports.get_file = function (req) {
    if (req.file) {
        return 'http://' + req.headers.host + '/' + req.file.destination + '/' + req.file.filename
    }
    else {
        return ''
    }
}
module.exports.mail_options = function (req) {
    return {
        from: 'acc.deviuh@gmail.com',
        to: req.email,
        subject: 'Active account',
        text: 'Xin chào ' + req.username + '. Để kích hoạt tài khoản của bạn vui lòng xác nhận: ' + 'http://' + req.headers.host + '/api/v1/user/active?username=' + req.username
    }
}

module.exports.send_mail = async function () {
    await smtpTransport.send_mail(this.mail_options)
}
