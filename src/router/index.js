const Router = require('express').Router
const SearchController = require('../controllers/search.controller')
const ParserController = require('../controllers/parser.controller')
const SettingsController = require('../controllers/settings.controller')

const router = Router()

router.post('/search', SearchController.postSearch)


router.get('/hotel', ParserController.getHotel)

router.post('/request', ParserController.postRequest)
router.delete('/request', ParserController.deleteRequest)
router.get('/request', SearchController.getRequests)
router.post('/request-export', SearchController.postRequestExport)

router.get('/settings', SettingsController.getSettings)
router.post('/settings', SettingsController.postSettings)

module.exports = router