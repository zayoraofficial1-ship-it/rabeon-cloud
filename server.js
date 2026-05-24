const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()

app.use(cors())
app.use(express.json())

const users = []

const SECRET = "RABEON_SECRET"

app.get("/", (req, res) => {
  res.json({
    name: "Rabeon Cloud API",
    status: "online",
    version: "2.0.0"
  })
})

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body

  const exists = users.find(u => u.email === email)
  if (exists) return res.status(400).json({ error: "User exists" })

  const hash = await bcrypt.hash(password, 10)

  const user = {
    id: Date.now(),
    username,
    email,
    password: hash
  }

  users.push(user)

  res.json({
    status: "registered",
    user: {
      id: user.id,
      username,
      email
    }
  })
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body

  const user = users.find(u => u.email === email)
  if (!user) return res.status(401).json({ error: "Invalid credentials" })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: "Invalid credentials" })

  const token = jwt.sign({ id: user.id, email }, SECRET)

  res.json({
    status: "logged_in",
    token
  })
})

const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log("Rabeon Cloud running on", PORT)
})
