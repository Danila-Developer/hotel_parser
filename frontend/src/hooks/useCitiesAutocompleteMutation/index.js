import { useMutation } from '@tanstack/react-query'
import { postCitiesAutocomplete } from '../../api/cities-autocomplete'


const useCitiesAutocompleteMutation = () => {
    const {
        data = [],
        isError,
        isSuccess,
        isPending,
        mutate
    } = useMutation({
        queryKey: ['post-cities-autocomplete'],
        mutationFn: (query) => postCitiesAutocomplete(query)
    })

    return {
        isError,
        data,
        mutate: (query) => mutate(query),
        isSuccess,
        isPending
    }
}

export default useCitiesAutocompleteMutation