import { useQuery } from '@tanstack/react-query'
import {getRequests} from '../../api/request'


const useRequestByIdQuery = (requestId) => {
    const {
        data = [],
        isError,
        isSuccess,
        isFetching,
        refetch
    } = useQuery({
        queryKey: ['get-requests-by-id'],
        queryFn: () => getRequests(requestId),
        refetchOnMount: true,
        retryOnMount: true,
        refetchInterval: 4000
    })

    return {
        isError,
        data,
        isSuccess,
        isFetching,
        refetch
    }
}

export default useRequestByIdQuery