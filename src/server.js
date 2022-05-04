const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const {initRoutes} = require("./routes");
const {db} = require("./db");
const app = express()
const port = 3000

app.use(cors({
    origin: ["http://localhost:3001", "http://127.0.0.1"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
}));
app.use(cookieParser());
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
