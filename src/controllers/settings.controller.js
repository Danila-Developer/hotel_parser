const SettingsService = require('../services/settings.service')

class SettingsController {
    static async getSettings(req, res) {
        try {
            const data = await SettingsService.getLastSettings()

            return res.status(200).json(data)
        } catch (err) {
            console.log(err)
        }
    }

    static async postSettings(req, res) {
        try {
            const response = await SettingsService.createSettings(req.body)

            return res.status(200).json(response)
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = SettingsController