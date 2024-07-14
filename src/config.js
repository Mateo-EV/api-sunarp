const { config } = require("dotenv")

config()

const PORT = process.env.PORT || 3000
const CAPTCHA_API_KEY = process.env.CAPTCHA_API_KEY

module.exports = {
  PORT,
  CAPTCHA_API_KEY
}
