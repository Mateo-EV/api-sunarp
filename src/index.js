const express = require("express")
const router = require("./routes.js")
const { PORT } = require("./config.js")

const app = express()

app.use(express.json())
app.get("/", (req, res) => {
  res.send("Hello World")
})
app.use("/api", router)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
