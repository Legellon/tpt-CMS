const express = require('express')
const CMS = require('../controllers/CMS')

const router = express.Router()

router.get('/:database/:table', CMS.Render)

router.post('/delete', CMS.Delete)
router.post('/save', CMS.Save)
router.post('/edit', CMS.Edit)

module.exports = router