const axios = require('axios')
const models = require('../models')
const fs = require('fs')
const path = require('path')
const ParserService = require('./parser.service')
const { Op } = require("sequelize")
const _ = require('lodash')

class SearchService {
    static async getSearch(query) {
        const response = await axios.post('https://accommodations.booking.com/autocomplete.json', {
            language: 'ru',
            query: query,
            size: 5
        })
        const data = response.data

        return data?.results.map(item => {
            return {
                label: item.label,
                label1: item.label1,
                label2: item.label2,
                photo_uri: item.photo_uri,
                destType: item.dest_type
            }
        })
    }

    static async getRequestById(request) {
        const response = await models.RequestModel.findAll({where: {id: request}, raw: true, order: [['createdAt', 'DESC']]})
        const data = _.get(response, '[0]', {})

        return {
            ...data,
            status: data?.id === ParserService.actualRequestId
                ? 'isRunning'
                : ParserService.requestsQueue.filter(request => request.id === data?.id).length > 0
                    ? 'isPending'
                    : 'completed',
            totalHotels: (await models.HotelModel.count({
                raw: true,
                where: {requestId: data?.id, email: {[Op.not]: ''}}
            }))
        }
    }

    static async getAllRequests() {
        const data = await models.RequestModel.findAll({raw: true, order: [['createdAt', 'DESC']]})

        return Promise.all(data.map(async item => {
            return {
                ...item,
                status: item.id === ParserService.actualRequestId
                    ? 'isRunning'
                    : ParserService.requestsQueue.filter(request => request.id === item.id).length > 0
                        ? 'isPending'
                        : 'completed',
                totalHotels: (await models.HotelModel.count({
                    raw: true,
                    where: {requestId: item.id, email: {[Op.not]: ''}}
                }))
            }
        }))
    }

    static async getRequestExportPath({ requestId, fields, separator = ';' }) {
        const request = (await SearchService.getRequestById(requestId))

        const fieldsToGet = []

        Object.keys(fields).map(item => {
            if (fields[item]) {
                fieldsToGet.push(item)
            }
        })

        const hotels = await models.HotelModel.findAll({
            where: {
                requestId: requestId
            },
            raw: true,
            attributes: fieldsToGet
        })

        const filteredHotels = hotels.filter((item) => item.email !== '')

        if (!fs.existsSync(path.resolve(__dirname, '../../exports'))) {
            fs.mkdirSync(path.resolve(__dirname, '../../exports'))
        }

        const pathToFile = path.resolve(__dirname, `../../exports/${request.place}.txt`)

        let file = ''

        filteredHotels.map((item, index) => {
            let row = ''
            Object.keys(item).map((key, index) => {
                if (Object.keys(item).length - 1 === index) {
                    if (key === 'email') {
                        return row = row + item[key].split(',').join(separator)
                    }
                    return row = row + item[key]
                }
                row = row + item[key] + separator
            })

            if (filteredHotels.length - 1 !== index) {
                row = row + '\n'
            }

            file = file + row
        })

        fs.writeFileSync(pathToFile, file)

        return pathToFile
    }
}

module.exports = SearchService