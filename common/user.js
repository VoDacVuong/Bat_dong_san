const handle_response = require('../common/handle_response.js')

module.exports.check_missing_data = async function (res, username, password, email) {
    if (!username || !password || !email) {
        response = handle_response.error(message = 'Username, password and email must not be empty')
        return res.json(response)
    }
}