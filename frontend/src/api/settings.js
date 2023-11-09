import client, { BASE_URL } from './index'

export async function getSettings() {
    const response = await client.get(`${BASE_URL}/settings`)

    return response.data
}

export async function postSettings(body) {
    const response = await client.post(`${BASE_URL}/settings`, body)

    return response.data
}