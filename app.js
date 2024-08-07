const express = require("express")
const app = express()
const dotenv = require("dotenv")
const productRouter = require("./routes/productRoutes")

dotenv.config({ path: "./config.env" })

//All the middleware put here
app.use(express.json())

//Routes
app.use("/api/v1/products", productRouter.router)

module.exports = app
