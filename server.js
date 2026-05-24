const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const app = express()

app.use(cors())
app.use(express.json())

const SECRET = process.env.JWT_SECRET || "RABEON_SECRET_KEY"

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

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "All fields are required"
      })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
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

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Internal server error"
    })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      })
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
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

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Internal server error"
    })
  }
})

const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log(`Rabeon Cloud running on ${PORT}`)
})
