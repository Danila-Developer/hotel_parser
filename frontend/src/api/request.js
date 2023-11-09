import client, { BASE_URL } from './index'
import _ from 'lodash'

export async function postRequest(body) {
    const response = await client.post(`${BASE_URL}/request`, body)

    return response.data
}

export async function getRequests(request = null) {
    if (!_.isNil(request)) {
        const response = await client.get(`${BASE_URL}/request?request=${request}`)
        return response.data
    } else {
        const response = await client.get(`${BASE_URL}/request`)
        return response.data
    }
}

export async function deleteRequest() {
    const response = await client.delete(`${BASE_URL}/request`)
    return response.data
}

export async function postExportRequest(body) {
    const response = await client.post(`${BASE_URL}/request-export`, body)
    return response.data
}