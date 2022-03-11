var UserModel = require("../models/user.js")
var TokenModel = require("../models/token.js")

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
