const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({
    name: "Rabeon Cloud API",
    status: "online",
    version: "1.0.0"
  })
})

const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log("Rabeon Cloud running on", PORT)
})
