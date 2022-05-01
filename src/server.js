const express = require('express')
const bodyParser = require('body-parser')
const {initRoutes} = require("./routes");
const {db} = require("./db");
const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

db.authenticate()
    .then(() => {
        console.log("DB is connected")
    })

require('./auth')

initRoutes(app)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})