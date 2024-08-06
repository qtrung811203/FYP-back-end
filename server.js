const mongoose = require("mongoose")
const app = require("./app")

const local_db = process.env.LOCAL_DB
const port = process.env.PORT || 3000

// Connect to local database
mongoose.connect(local_db, {}).then(() => {
  console.log("DB-Connect: Connected to Local Database")
})

//Start app
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
