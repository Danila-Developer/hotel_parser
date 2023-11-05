const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const SettingsModel = sequelize.define(
    'settings',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        processCount: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        clearBD: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        exclude: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        updatedAt: false,
        createdAt: true,
        tableName: 'settings'
    }
)


module.exports = SettingsModel