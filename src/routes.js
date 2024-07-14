const { Router } = require("express")
const {
  getCaptchaImage
  // submitCaptchaSolution
} = require("./controllers/VehicleController.js")

const router = Router()

router.get("/vehicle/:plate", getCaptchaImage)
// router.post("/vehicle/data", authMiddleware, submitCaptchaSolution)

module.exports = router
