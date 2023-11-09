import { useMutation } from '@tanstack/react-query'
import { postRequest } from '../../api/request'


const useRequestMutation = () => {
    const {
        data,
        isError,
        isSuccess,
        isPending,
        mutate
    } = useMutation({
        mutationKey: ['post-request'],
        mutationFn: (body) => postRequest(body)
    })

    return {
        isError,
        data,
        mutate: (body) => mutate(body),
        isSuccess,
        isPending
    }
}

export default useRequestMutation