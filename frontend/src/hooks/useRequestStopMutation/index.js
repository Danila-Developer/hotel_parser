import { useMutation } from '@tanstack/react-query'
import { deleteRequest } from '../../api/request'


const useRequestStopMutation = () => {
    const {
        mutate,
        data,
        isPending,
        isSuccess
    } = useMutation({
        mutationKey: ['request-stop'],
        mutationFn: () => deleteRequest()
    })

    return {
        mutate,
        data,
        isPending,
        isSuccess
    }
}

export default useRequestStopMutation