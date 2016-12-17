const express = require('express')

const router = express.Router()

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' })
})

router.get('/example', (req, res) => {
  res.render('example', { title: 'Example Page' })
})

module.exports = router
