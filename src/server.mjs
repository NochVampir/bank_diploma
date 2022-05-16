import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import accountApi from "./api/account.mjs";
import transactionsApi from "./api/transactions.mjs";
import {db} from "./db.mjs";
import {createRequire} from "module";
import * as swaggerUi from "swagger-ui-express";

const requireModule = createRequire(import.meta.url)
const swaggerJson = requireModule("../swagger.json")

const app = express();
const port = 3000;

app.use(cors({
    origin: ["http://localhost:3001", "http://127.0.0.1"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(requireModule("express-status-monitor")())

db.authenticate()
    .then(() => {
        console.log("DB is connected");
    })

import "./auth.mjs";

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson))

app.use('/account', accountApi);
app.use('/transactions', transactionsApi);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
