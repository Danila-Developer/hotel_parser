const RequestModel = require('./request.model')
const HotelModel = require('./hotel.model')
const SettingsModel = require('./settings.model')

HotelModel.belongsTo(RequestModel)
RequestModel.hasMany(HotelModel)

module.exports = {
    RequestModel,
    HotelModel,
    SettingsModel
}