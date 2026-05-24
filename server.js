const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const app = express()

app.use(cors())
app.use(express.json())

const SECRET = "RABEON_SECRET_KEY"

app.get("/", (req, res) => {
  res.json({
    name: "Rabeon Cloud API",
    status: "online",
    version: "2.0.0"
  })
})

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (existing) {
      return res.status(400).json({
        error: "User already exists"
      })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed
      }
    })

    res.json({
      status: "registered",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      })
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return res.status(401).json({
        error: "Invalid credentials"
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      SECRET,
      {
        expiresIn: "7d"
      }
    )

    res.json({
      status: "logged_in",
      token
    })

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log("Rabeon Cloud running on", PORT)
})
