import axios from 'axios'

export const BASE_URL = `http://${process.env.REACT_APP_API_URL}/api`
//45.90.34.168:8800
//localhost:8800
const client = axios.create({
    withCredentials: true,
    BASE_URL: BASE_URL,
    headers: {
        'Access-Control-Allow-Origin':'*',
        'content-type':'application/json'
    }
})

export default client