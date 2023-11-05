const models = require('../models')
const _ = require('lodash')

class SettingsService {

    static async createSettings(body) {
        const data = await models.SettingsModel.create({...body, exclude: body?.exclude.join(',') })

        return data
    }

    static async getLastSettings() {
        const result = await models.SettingsModel.findAll({ order: [['createdAt', 'DESC']], limit: 1, raw: true })

        if (_.size(result) === 0) {
            return {
                processCount: 10,
                clearBD: true,
                exclude: []
            }
        }

        const { id, createdAt, ...data } = result[0]

        return  {
            ...data,
            exclude: data.exclude.split(',')
        }
    }
}

module.exports = SettingsService