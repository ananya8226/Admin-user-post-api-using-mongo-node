const app = require('express')()
const path = require('path')
const yamljs = require('yamljs')
const swaggerUi = require('swagger-ui-express')

// Auth
const swaggerAuthDocument = yamljs.load(
  path.resolve(__dirname, '../../../docs/swagger.yaml')
)
app.get('/docs.json', (req, res) => res.send(swaggerAuthDocument))
app.use('/docs', swaggerUi.serve, (req, res) => {
  res.send(swaggerUi.generateHTML(swaggerAuthDocument))
})

module.exports = app
