const express = require('express')
const path = require('path')
var bodyParser = require('body-parser')
const app = express()
var account = require("./router/account.js")
const port = 3000

//Bổ xung đường dẫn tĩnh
app.use('/public', express.static(path.join(__dirname, '/public')))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use("/api/v1/account/", account)

// app.get('/', (req, res) => {
//     var duongdanfile = path.join(__dirname, 'home.html')

//     res.sendFile(duongdanfile)
// })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})