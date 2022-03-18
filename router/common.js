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
const { json } = require('express/lib/response')


module.exports.check_token = async function (req) {
    return await TokenModel.findOne({ 'token': req.body.token, 'status': true });
}

module.exports.check_admin = async function (token) {
    token_qs = await TokenModel.findOne({ 'token': token, 'status': true }) || ''
    return UserModel.findOne({ 'username': token_qs.username, 'activate': true, 'role': 'ADMIN' });
}

module.exports.deactivate_user = async function (uid) {
    return await UserModel.findOne({ 'uid': uid });
}

module.exports.deactivate_token = async function (token) {
    await TokenModel.findOneAndUpdate({ 'username': token.username }, { 'status': false });
}

module.exports.deactivate_user = async function (user) {
    await TokenModel.updateMany({ 'username': user.username }, { 'status': false })
    await UserModel.findOneAndUpdate({ 'username': user.username }, { 'activate': false });
}

module.exports.get_news_by_uid = async function (uid) {
    return await NewsModel.findOne({ 'uid': uid });
}

module.exports.get_user_by_username = async function (username, projection = {}) {
    return await UserModel.findOne({ username: username }, projection);
}

module.exports.get_user_by_uid = function (uid) {
    return UserModel.findOne({ uid: uid });
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

module.exports.get_all_entity = function (entity, dict, skip, page_size, projection = {}) {
    return entity.find(dict, projection).skip(skip).limit(page_size).sort({ created_at: -1 })
}

module.exports.count_entity = function (model) {
    return model.countDocuments({})
}

module.exports.find_and_count_entity = function (model, dict) {
    return model.countDocuments(dict)
}

module.exports.get_news_by_username = function (username, projection = {}) {
    return NewsModel.find({ username: username }, projection)
}

module.exports.get_news_by_uid = function (uid) {
    return NewsModel.findOne({ uid: uid })
}
