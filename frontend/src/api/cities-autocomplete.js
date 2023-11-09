import client, { BASE_URL } from './index'

export async function postCitiesAutocomplete(query) {
    const response = await client.post(`${BASE_URL}/search`, {
        query: query
    })

    return response.data
}