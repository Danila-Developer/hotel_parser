import { getHotels } from '../../api/hotels'
import { useQuery } from '@tanstack/react-query'
import {getRequests} from '../../api/request'


const useRequestsQuery = () => {
    const {
        data = [],
        isError,
        isSuccess,
        isFetching,
        refetch
    } = useQuery({
        queryKey: ['get-requests'],
        queryFn: () => getRequests(null),
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

export default useRequestsQuery