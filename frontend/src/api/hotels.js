import client, { BASE_URL } from './index'
import _ from 'lodash'

export async function getHotels(request = null, page) {
    if (!_.isNil(request)) {
        const response = await client.get(`${BASE_URL}/hotel?request=${request}&page=${page}`)
        return response.data
    } else {
        const response = await client.get(`${BASE_URL}/hotel?page=${page}`)
        return response.data
    }
}