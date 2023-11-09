import { getHotels } from '../../api/hotels'
import { useQuery } from '@tanstack/react-query'


const useHotelsQuery = (requestId = null, page = 0) => {
    const {
        data = [],
        isError,
        isSuccess,
        isFetching,
        refetch
    } = useQuery({
        queryKey: ['get-hotels'],
        queryFn: () => getHotels(requestId, page),
        refetchOnMount: true,
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

export default useHotelsQuery