import { getHotels } from '../../api/hotels'
import { useQuery } from '@tanstack/react-query'
import {getSettings} from '../../api/settings'


const useSettingsQuery = () => {
    const {
        data,
        isError,
        isSuccess,
        isFetching,
        refetch
    } = useQuery({
        queryKey: ['get-settings'],
        queryFn: () => getSettings(),
        refetchOnMount: true,
        retryOnMount: true
    })

    return {
        isError,
        data,
        isSuccess,
        isFetching,
        refetch
    }
}

export default useSettingsQuery