const express = require('express')
const path = require('path')
const port = process.env.PORT || 8000
const common = require('./router/common.js')
const handle_response = require('./common/handle_response.js')
const app = express()

var bodyParser = require('body-parser')
var user = require("./router/user.js")
var news = require("./router/news.js")
var address = require("./router/address.js")
var token = require("./router/token.js")
var cors = require('cors')
var comment = require("./router/comment.js")
// var multer = require('multer');
// var upload = multer();

//Bổ xung đường dẫn tĩnh
// app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/public/uploads', express.static(path.join(__dirname, './public/uploads')))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(cors())
// app.use(upload.array());
// app.use(express.static('public'));



app.use("/api/v1/user/", user)
app.use("/api/v1/news/", news)
app.use("/api/v1/address/", address)
app.use("/api/v1/comments/", comment)
app.use('/api/v1/tokens/', token)

// active account
app.get('/api/v1/user/:active', async (req, res) => {
    username = req.query.username
    user = await common.get_user_by_username(username)
    if (!user) {
        response_data = handle_response.error(message = 'User not found !')
        return res.json(response_data)
    }
    user.activate = true
    user.save()
    console.log(path)
    var duongdanfile = path.join(__dirname, 'home.html')
    res.sendFile(duongdanfile)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})