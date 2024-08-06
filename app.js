const express = require("express")
const app = express()
const dotenv = require("dotenv")

dotenv.config({ path: "./config.env" })

//All the middleware put here

module.exports = app
