const puppeteer = require("puppeteer")
const fs = require("fs")
const sharp = require("sharp")
const Captcha = require("2captcha")
const { CAPTCHA_API_KEY } = require("../config.js")

const solver = new Captcha.Solver(CAPTCHA_API_KEY)
/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getCaptchaImage = async (req, res) => {
  /**
   * @const {string} plate - The vehicle plate number.
   */
  const plate = req.params.plate

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  })
  const page = await browser.newPage()

  await page.goto("https://www2.sunarp.gob.pe/consulta-vehicular/inicio", {
    waitUntil: "networkidle2"
  })

  // Completar formulario de búsqueda
  const plateSelector = "#nroPlaca"
  await page.waitForSelector(plateSelector)
  await page.type(plateSelector, plate)

  // Analizar el captcha
  const captchaSelector = "#image"
  await page.waitForSelector(captchaSelector)
  const captchaBase64 = await page.$eval(captchaSelector, img => img.src)
  console.log(captchaBase64)
  // const buffer = Buffer.from(base64Data, "base64")

  // Preprocesar la imagen con sharp
  // const preprocessedBuffer = await sharp(buffer)
  //   .greyscale() // Convertir a escala de grises
  //   .threshold(128) // Aplicar un umbral para hacer la imagen binaria
  //   .normalise() // Normalizar la imagen
  //   .sharpen() // Aplicar un filtro de enfoque
  //   .removeAlpha() // Eliminar canal alfa si existe
  //   .toBuffer()

  // // Guardar imagen
  // const id = crypto.randomUUID()
  // fs.writeFileSync(`captchas/${id}.png`, preprocessedBuffer)

  const code = (await solver.imageCaptcha(captchaBase64)).data
  const codeCaptchaSelector = "#codigoCaptcha"
  await page.waitForSelector(codeCaptchaSelector)
  await page.type(codeCaptchaSelector, code)

  // Darle click al botón
  const buttonSelector =
    "button.ant-btn.btn-sunarp-green.ant-btn-primary.ant-btn-lg"
  await page.waitForSelector(buttonSelector)
  await page.click(buttonSelector)

  // Esperar a que el modal con los datos se cargue
  const modalSelector = "div.container-data-vehiculo.ng-star-inserted" // Selector del modal
  try {
    await page.waitForSelector(modalSelector, { timeout: 1000 })
  } catch (e) {
    return res.status(400).send("Algo salió mal")
  }

  // Descargar la imagen
  const imgSelector = `${modalSelector} img`
  await page.waitForSelector(imgSelector)

  const imgSrc = await page.$eval(imgSelector, img => img.src)

  const viewSource = await page.goto(imgSrc)
  const datos_buffer = await viewSource.buffer()

  await browser.close()

  res.writeHead(200, { "Content-Type": "image/png" })
  res.end(datos_buffer, "binary")
}

module.exports = { getCaptchaImage }
