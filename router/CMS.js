const express = require('express')
const CMS = require('../controllers/CMS')

const router = express.Router()

router.get('/:database/:table', CMS.Render)

router.post('/delete', CMS.Delete)
router.post('/save', CMS.Save)
router.post('/edit', CMS.Edit)
router.post('/up', CMS.Up)
router.post('/down', CMS.Down)

module.exports = router